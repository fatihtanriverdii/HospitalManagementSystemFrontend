'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { patientApi } from '@/services/api';
import { Patient } from '@/types';
import { UserPlus, ArrowLeft, Save, RefreshCw } from 'lucide-react';

const patientSchema = z.object({
  tc: z.string().length(11, 'T.C. kimlik numarası 11 haneli olmalıdır'),
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  phone: z.string().min(10, 'Telefon numarası geçerli olmalıdır'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: '',
  });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      tc: '',
      name: '',
      surname: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const response = await patientApi.create(data);
      if (response.data.success) {
        setAlert({
          show: true,
          type: 'success',
          title: 'Başarılı!',
          message: 'Hasta kaydı başarıyla oluşturuldu!',
        });
        // Hemen loading'i başlat ve yönlendir
        setIsRedirecting(true);
        // 1 saniye sonra yönlendir (kullanıcı başarı mesajını görebilsin)
        setTimeout(() => {
          router.push('/patients/search');
        }, 1000);
      } else {
        // API'den gelen hata mesajını kullan
        const errorMessage = response.data.message || 'Hasta kaydı oluşturulurken bir hata oluştu.';
        setAlert({
          show: true,
          type: 'error',
          title: 'Hata!',
          message: errorMessage,
        });
      }
    } catch (error: any) {
      console.error('Hasta kaydı oluşturulurken hata:', error);
      let errorMessage = 'Hasta kaydı oluşturulurken bir hata oluştu.';
      
      // API'den gelen hata mesajını kontrol et - farklı formatları dene
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.response?.data?.title) {
        // Validation errors için
        errorMessage = error.response.data.title;
        
        // Eğer detaylı hata mesajları varsa onları da ekle
        if (error.response.data.errors) {
          const errorDetails = Object.values(error.response.data.errors).flat();
          if (errorDetails.length > 0) {
            errorMessage += '\n\nDetaylar:\n' + errorDetails.join('\n');
          }
        }
      } else if (error.response?.data) {
        // Eğer data bir string ise direkt kullan
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      // TC kimlik numarası zaten mevcut hatası için özel mesaj
      if (errorMessage.toLowerCase().includes('already exist') || 
          errorMessage.toLowerCase().includes('mevcut') ||
          errorMessage.toLowerCase().includes('zaten')) {
        errorMessage = 'Bu T.C. kimlik numarasına sahip hasta zaten kayıtlı!';
      }
      
      setAlert({
        show: true,
        type: 'error',
        title: 'Hata!',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
      />
      
      {/* Yönlendirme Loading Ekranı */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Yönlendiriliyor...
            </h3>
            <p className="text-gray-600">
              Hasta sorgulama sayfasına yönlendiriliyorsunuz.
            </p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center">
                <UserPlus className="h-8 w-8 mr-3 text-blue-600" />
                Yeni Hasta Kaydı
              </h1>
              <p className="text-gray-600 mt-2">Hasta bilgilerini girerek yeni kayıt oluşturun</p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="T.C. Kimlik No"
                  placeholder="12345678901"
                  maxLength={11}
                  {...form.register('tc')}
                  error={form.formState.errors.tc?.message}
                />
                <Input
                  label="Ad"
                  placeholder="Hasta adı"
                  {...form.register('name')}
                  error={form.formState.errors.name?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Soyad"
                  placeholder="Hasta soyadı"
                  {...form.register('surname')}
                  error={form.formState.errors.surname?.message}
                />
                <Input
                  label="Telefon"
                  placeholder="555 123 45 67"
                  {...form.register('phone')}
                  error={form.formState.errors.phone?.message}
                />
              </div>

              <Input
                label="Adres"
                placeholder="Tam adres bilgisi"
                {...form.register('address')}
                error={form.formState.errors.address?.message}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Hasta Kaydını Oluştur
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="flex-1 h-14 text-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Formu Temizle
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              Bilgilendirme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  T.C. kimlik numarası 11 haneli olmalıdır
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Tüm alanlar zorunludur
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Telefon numarası geçerli formatta olmalıdır
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Adres bilgisi detaylı olmalıdır
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 