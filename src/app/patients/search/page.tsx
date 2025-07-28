'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { patientApi } from '@/services/api';
import { Patient, Appointment, PaginatedResponse } from '@/types';
import { Search, User, Calendar, ArrowLeft, UserPlus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [searched, setSearched] = useState(false);
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      tc: '',
    },
  });

  const loadAppointments = async (patientId: number, page: number = 1, customPageSize?: number) => {
    setIsLoadingAppointments(true);
    const currentPageSize = customPageSize || pageSize;
    
    try {
      const appointmentsResponse = await patientApi.getAppointments(patientId, page, currentPageSize);
      console.log('Appointments API Response:', appointmentsResponse); // Debug için
      
      if (appointmentsResponse.data.success && appointmentsResponse.data.data) {
        const paginatedData = appointmentsResponse.data.data;
        setAppointments(paginatedData.items || []);
        setTotalPages(paginatedData.totalPages || 0);
        setTotalCount(paginatedData.totalCount || 0);
        setCurrentPage(page);
      } else {
        setAppointments([]);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (appointmentError) {
      console.error('Randevular yüklenirken hata:', appointmentError);
      setAppointments([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    setSearched(true);
    setCurrentPage(1); // Reset to first page on new search
    try {
      // Hasta bilgilerini getir
      const patientResponse = await patientApi.getByTc(data.tc);
      console.log('Patient API Response:', patientResponse); // Debug için
      
      if (patientResponse.data.success && patientResponse.data.data) {
        setPatient(patientResponse.data.data);
        
        // Hasta randevularını getir
        await loadAppointments(patientResponse.data.data.id!, 1);
        
        // Başarı mesajı göster
        setAlert({
          show: true,
          type: 'success',
          title: 'Başarılı!',
          message: 'Hasta bilgileri başarıyla getirildi.',
        });
        // 3 saniye sonra otomatik kapat
        setTimeout(() => {
          setAlert({ ...alert, show: false });
        }, 3000);
      } else {
        setPatient(null);
        setAppointments([]);
        setTotalPages(0);
        setTotalCount(0);
        setAlert({
          show: true,
          type: 'error',
          title: 'Hata!',
          message: 'Hasta bulunamadı.',
        });
      }
    } catch (error: any) {
      console.error('Hasta sorgulanırken hata:', error);
      setPatient(null);
      setAppointments([]);
      setTotalPages(0);
      setTotalCount(0);
      
      let errorMessage = 'Hasta bulunamadı veya bir hata oluştu.';
      
      // API'den gelen hata mesajını kontrol et
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
      } else if (error.response?.status === 404) {
        errorMessage = 'Bu T.C. kimlik numarasına sahip hasta bulunamadı.';
      }
      
      setAlert({
        show: true,
        type: 'error',
        title: 'Hata!',
        message: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setPatient(null);
    setAppointments([]);
    setIsLoadingAppointments(false);
    setSearched(false);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
    form.reset();
  };

  const handlePageChange = (newPage: number) => {
    if (patient && newPage >= 1 && newPage <= totalPages) {
      loadAppointments(patient.id!, newPage);
    }
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    if (patient) {
      await loadAppointments(patient.id!, 1, newPageSize);
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Randevu Geçmişi
                    </h2>
                  </div>
                  
                  {/* Page Size Selector */}
                  {appointments.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold text-gray-900">Sayfa başına:</label>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {isLoadingAppointments ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Randevular Yükleniyor...
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Hasta randevu geçmişi getiriliyor.
                    </p>
                  </div>
                ) : appointments.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                Dr. {appointment.doctorName} {appointment.doctorSurname}
                              </h3>
                              <p className="text-purple-600 font-medium">
                                {appointment.departmentName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: tr })}
                              </p>
                              <p className="text-purple-600 font-medium">
                                {appointment.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Toplam {totalCount} randevu, {currentPage}. sayfa / {totalPages} sayfa
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="flex items-center gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Önceki
                          </Button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "primary" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className="w-10 h-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-1"
                          >
                            Sonraki
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
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