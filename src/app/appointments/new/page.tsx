'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { patientApi, doctorApi, appointmentApi } from '@/services/api';
import { Patient, Doctor, Appointment } from '@/types';
import { Calendar, ArrowLeft, Search, User, Stethoscope, Clock, Save, RefreshCw } from 'lucide-react';

const appointmentSchema = z.object({
  patientTc: z.string().length(11, 'T.C. kimlik numarası 11 haneli olmalıdır'),
  doctorId: z.number().min(1, 'Doktor seçimi gereklidir'),
  date: z.string().min(1, 'Tarih seçimi gereklidir'),
  startTime: z.string().min(1, 'Saat seçimi gereklidir'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showPatientSearch, setShowPatientSearch] = useState(true);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientTc: '',
      doctorId: 0,
      date: '',
      startTime: '',
    },
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await doctorApi.getAll();
      if (response.data.success && response.data.data) {
        setDoctors(response.data.data);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Doktorlar yüklenirken hata:', error);
      setDoctors([]);
    }
  };

  const searchPatient = async () => {
    const tc = form.getValues('patientTc');
    if (tc.length !== 11) {
      alert('Lütfen geçerli bir T.C. kimlik numarası girin.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await patientApi.getByTc(tc);
      if (response.data.success && response.data.data) {
        setPatient(response.data.data);
        setShowPatientSearch(false);
      } else {
        alert('Hasta bulunamadı. Lütfen T.C. kimlik numarasını kontrol edin.');
      }
    } catch (error) {
      console.error('Hasta aranırken hata:', error);
      alert('Hasta bulunamadı. Lütfen T.C. kimlik numarasını kontrol edin.');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!patient) {
      alert('Lütfen önce hasta bilgilerini arayın.');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentData: Omit<Appointment, 'id'> = {
        patientId: patient.id!,
        doctorId: data.doctorId,
        date: data.date,
        startTime: data.startTime,
      };

      const response = await appointmentApi.create(appointmentData);
      if (response.data.success) {
        alert('Randevu başarıyla oluşturuldu!');
        router.push('/patients/search');
      } else {
        alert('Randevu oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
      alert('Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPatient(null);
    setShowPatientSearch(true);
    form.reset();
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                <Calendar className="h-8 w-8 mr-3 text-purple-600" />
                Yeni Randevu
              </h1>
              <p className="text-gray-600 mt-2">Hasta için doktor seçimi ve randevu oluşturun</p>
            </div>
          </div>

          {/* Form Card */}
          <Card className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Hasta Arama */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Hasta Bilgileri
                  </h3>
                </div>
                
                {showPatientSearch ? (
                  <div className="space-y-4">
                    <Input
                      label="T.C. Kimlik No"
                      placeholder="12345678901"
                      maxLength={11}
                      {...form.register('patientTc')}
                      error={form.formState.errors.patientTc?.message}
                    />
                    <Button
                      type="button"
                      onClick={searchPatient}
                      disabled={isSearching}
                      className="w-full h-12 flex items-center justify-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Aranıyor...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Hasta Ara
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          {patient?.name} {patient?.surname}
                        </h4>
                        <p className="text-blue-600 font-medium">T.C: {patient?.tc}</p>
                        <p className="text-blue-600 font-medium">Tel: {patient?.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Değiştir
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Doktor Seçimi */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Doktor Seçimi
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Doktor
                  </label>
                  <select
                    {...form.register('doctorId', { valueAsNumber: true })}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:border-green-500 transition-all duration-200"
                  >
                    <option value="">Doktor seçin</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} {doctor.surname} - {doctor.department?.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.doctorId && (
                    <p className="text-sm text-red-600 font-medium">
                      {form.formState.errors.doctorId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tarih ve Saat */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Tarih ve Saat
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tarih"
                    type="date"
                    {...form.register('date')}
                    error={form.formState.errors.date?.message}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Saat
                    </label>
                    <select
                      {...form.register('startTime')}
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Saat seçin</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-red-600 font-medium">
                        {form.formState.errors.startTime.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || !patient}
                  className="flex-1 h-14 text-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Randevu Oluştur
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 h-14 text-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Formu Temizle
                </Button>
              </div>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              Bilgilendirme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Önce hasta T.C. kimlik numarası ile aranmalıdır
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Doktor seçimi zorunludur
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Tarih ve saat seçimi yapılmalıdır
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Randevu oluşturulduktan sonra hasta sorgulama sayfasına yönlendirilirsiniz
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 