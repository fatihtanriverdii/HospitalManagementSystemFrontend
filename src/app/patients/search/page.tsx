'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { patientApi } from '@/services/api';
import { Patient, Appointment } from '@/types';
import { Search, User, Calendar, ArrowLeft, UserPlus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const searchSchema = z.object({
  tc: z.string().length(11, 'T.C. kimlik numarası 11 haneli olmalıdır'),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function PatientSearchPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tc: '',
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    setSearched(true);
    try {
      // Hasta bilgilerini getir
      const patientResponse = await patientApi.getByTc(data.tc);
      console.log('Patient API Response:', patientResponse); // Debug için
      
      if (patientResponse.data.success && patientResponse.data.data) {
        setPatient(patientResponse.data.data);
        
        // Hasta randevularını getir
        try {
          const appointmentsResponse = await patientApi.getAppointments(data.tc);
          console.log('Appointments API Response:', appointmentsResponse); // Debug için
          
          if (appointmentsResponse.data.success && appointmentsResponse.data.data) {
            setAppointments(appointmentsResponse.data.data);
          } else {
            setAppointments([]);
          }
        } catch (appointmentError) {
          console.error('Randevular yüklenirken hata:', appointmentError);
          setAppointments([]);
        }
      } else {
        setPatient(null);
        setAppointments([]);
        alert('Hasta bulunamadı.');
      }
    } catch (error) {
      console.error('Hasta sorgulanırken hata:', error);
      setPatient(null);
      setAppointments([]);
      alert('Hasta bulunamadı veya bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setPatient(null);
    setAppointments([]);
    setSearched(false);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center">
                  <Search className="h-8 w-8 mr-3 text-blue-600" />
                  Hasta Sorgulama
                </h1>
                <p className="text-gray-600 mt-2">T.C. kimlik numarası ile hasta bilgilerini sorgulayın</p>
              </div>
            </div>
            <Link href="/patients/new">
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Yeni Hasta
              </Button>
            </Link>
          </div>

          {/* Search Form */}
          <Card className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="T.C. Kimlik No"
                    placeholder="12345678901"
                    maxLength={11}
                    {...form.register('tc')}
                    error={form.formState.errors.tc?.message}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="flex items-center gap-2 h-12 px-8"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Aranıyor...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Ara
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* No Results */}
          {searched && !patient && (
            <Card className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Hasta Bulunamadı
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Bu T.C. kimlik numarasına sahip hasta kaydı bulunamadı. Lütfen bilgileri kontrol edin.
                </p>
                <Button onClick={clearSearch} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Yeni Arama
                </Button>
              </div>
            </Card>
          )}

          {/* Patient Results */}
          {patient && (
            <div className="space-y-8">
              {/* Patient Info */}
              <Card className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hasta Bilgileri
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">T.C. Kimlik No</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-900 font-mono">{patient.tc}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Ad Soyad</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-900 font-semibold">{patient.name} {patient.surname}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Telefon</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-900">{patient.phone}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">Adres</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-900">{patient.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Appointment History */}
              <Card className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Randevu Geçmişi
                  </h2>
                </div>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              Dr. {appointment.doctor?.name} {appointment.doctor?.surname}
                            </h3>
                            <p className="text-purple-600 font-medium">
                              {appointment.doctor?.department?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: tr })}
                            </p>
                            <p className="text-purple-600 font-medium">
                              {appointment.startTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Randevu Geçmişi Yok
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Bu hastanın henüz randevu geçmişi bulunmamaktadır.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 