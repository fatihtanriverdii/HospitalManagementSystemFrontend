'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { departmentApi, doctorApi } from '@/services/api';
import { Department, Doctor } from '@/types';
import { Plus, Building2, User, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DepartmentSkeleton, DoctorSkeleton } from '@/components/ui/Skeleton';

const doctorSchema = z.object({
  name: z.string().min(1, 'Doktor adı gereklidir'),
  surname: z.string().min(1, 'Doktor soyadı gereklidir'),
  departmentId: z.number().min(1, 'Bölüm seçimi gereklidir'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]); // Doktor formu için tüm bölümler
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  
  // Pagination state'leri
  const [departmentPage, setDepartmentPage] = useState(0); // İlk yüklemede 0, sonra 1
  const [doctorPage, setDoctorPage] = useState(0); // İlk yüklemede 0, sonra 1
  const [departmentPageSize] = useState(10);
  const [doctorPageSize] = useState(10);
  const [departmentTotalPages, setDepartmentTotalPages] = useState(1);
  const [doctorTotalPages, setDoctorTotalPages] = useState(1);
  const [departmentTotalCount, setDepartmentTotalCount] = useState(0);
  const [doctorTotalCount, setDoctorTotalCount] = useState(0);
  
  // Loading state'leri
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingAllDepartments, setLoadingAllDepartments] = useState(false);
  
  // Ref'ler ile duplicate request'leri önle
  const departmentsLoadedRef = useRef(false);
  const doctorsLoadedRef = useRef(false);
  const allDepartmentsLoadedRef = useRef(false);
  
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



  const doctorForm = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  });

  // İlk yükleme - sadece bir kez çalışır
  useEffect(() => {
    setDepartmentPage(1); // İlk sayfayı ayarla
    setDoctorPage(1); // İlk sayfayı ayarla
  }, []);

  // Bölüm sayfası değiştiğinde sadece paginated bölümleri yükle
  useEffect(() => {
    if (departmentPage > 0) { // İlk yüklemede çalışmasın
      loadDepartments();
    }
  }, [departmentPage]);

  // Doktor sayfası değiştiğinde sadece paginated doktorları yükle
  useEffect(() => {
    if (doctorPage > 0) { // İlk yüklemede çalışmasın
      loadDoctors();
    }
  }, [doctorPage]);

  const loadDepartments = async () => {
    if (loadingDepartments || departmentsLoadedRef.current || departmentPage <= 0) return; // Eğer zaten yükleniyorsa veya yüklendiyse veya sayfa 0 ise çık
    
    setLoadingDepartments(true);
    departmentsLoadedRef.current = true;
    
    const startTime = Date.now();
    const minLoadingTime = 800; // Minimum 800ms loading süresi
    
    try {
      const response = await departmentApi.getPaginated(departmentPage, departmentPageSize);
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data.items);
        setDepartmentTotalPages(response.data.data.totalPages || 1);
        setDepartmentTotalCount(response.data.data.totalCount || 0);
      } else {
        setDepartments([]);
        setDepartmentTotalPages(1);
        setDepartmentTotalCount(0);
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
      setDepartments([]);
      setDepartmentTotalPages(1);
      setDepartmentTotalCount(0);
    } finally {
      // Minimum loading süresini sağla
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoadingDepartments(false);
      }, remainingTime);
    }
  };



  const loadAllDepartments = async () => {
    if (loadingAllDepartments || allDepartmentsLoadedRef.current) return; // Eğer zaten yükleniyorsa veya yüklendiyse çık
    
    setLoadingAllDepartments(true);
    allDepartmentsLoadedRef.current = true;
    
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setAllDepartments(response.data.data);
      } else {
        setAllDepartments([]);
      }
    } catch (error) {
      console.error('Tüm bölümler yüklenirken hata:', error);
      setAllDepartments([]);
    } finally {
      setLoadingAllDepartments(false);
    }
  };

  const loadDoctors = async () => {
    if (loadingDoctors || doctorsLoadedRef.current || doctorPage <= 0) return; // Eğer zaten yükleniyorsa veya yüklendiyse veya sayfa 0 ise çık
    
    setLoadingDoctors(true);
    doctorsLoadedRef.current = true;
    
    const startTime = Date.now();
    const minLoadingTime = 800; // Minimum 800ms loading süresi
    
    try {
      const response = await doctorApi.getPaginated(doctorPage, doctorPageSize);
      if (response.data.success && response.data.data) {
        setDoctors(response.data.data.items);
        setDoctorTotalPages(response.data.data.totalPages || 1);
        setDoctorTotalCount(response.data.data.totalCount || 0);
      } else {
        setDoctors([]);
        setDoctorTotalPages(1);
        setDoctorTotalCount(0);
      }
    } catch (error) {
      console.error('Doktorlar yüklenirken hata:', error);
      setDoctors([]);
      setDoctorTotalPages(1);
      setDoctorTotalCount(0);
    } finally {
      // Minimum loading süresini sağla
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoadingDoctors(false);
      }, remainingTime);
    }
  };

  const onSubmitDoctor = async (data: DoctorFormData) => {
    try {
      const response = await doctorApi.create(data);
      if (response.data.success) {
        doctorForm.reset();
        setShowDoctorForm(false);
        // Yeni doktor eklendikten sonra ilk sayfaya dön ve yeniden yükle
        doctorsLoadedRef.current = false; // Ref'i sıfırla
        setDoctorPage(1);
        loadDoctors();
        
        // Başarı mesajı göster
        setAlert({
          show: true,
          type: 'success',
          title: 'Başarılı!',
          message: 'Doktor başarıyla oluşturuldu!',
        });
        // 3 saniye sonra otomatik kapat
        setTimeout(() => {
          setAlert({ ...alert, show: false });
        }, 3000);
      } else {
        // API'den gelen hata mesajını kullan
        const errorMessage = response.data.message || 'Doktor oluşturulurken bir hata oluştu.';
        setAlert({
          show: true,
          type: 'error',
          title: 'Hata!',
          message: errorMessage,
        });
      }
    } catch (error: any) {
      console.error('Doktor oluşturulurken hata:', error);
      
      let errorMessage = 'Doktor oluşturulurken bir hata oluştu.';
      
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
      }
      
      setAlert({
        show: true,
        type: 'error',
        title: 'Hata!',
        message: errorMessage,
      });
    }
  };

  // Pagination fonksiyonları
  const handleDepartmentPageChange = (newPage: number) => {
    departmentsLoadedRef.current = false; // Ref'i sıfırla
    setDepartmentPage(newPage);
  };

  const handleDoctorPageChange = (newPage: number) => {
    doctorsLoadedRef.current = false; // Ref'i sıfırla
    setDoctorPage(newPage);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Doktor ve Bölüm Tanımları
                </h1>
                <p className="text-gray-600 mt-2">Hastane bölümlerini ve doktorları yönetin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bölümler */}
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bölümler
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {departmentTotalCount} bölüm
                  </span>
                </div>

              </div>



              <div className="space-y-3">
                {loadingDepartments ? (
                  <DepartmentSkeleton count={departmentPageSize} />
                ) : (
                  <>
                    {departments.map((dept, index) => (
                      <div
                        key={dept.id}
                        className={`p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200 fade-in-delay-${Math.min(index, 3)}`}
                      >
                        <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                      </div>
                    ))}
                    {departments.length === 0 && (
                      <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                          Henüz bölüm tanımlanmamış
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bölüm Pagination */}
              {departmentTotalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Sayfa {departmentPage} / {departmentTotalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDepartmentPageChange(departmentPage - 1)}
                      disabled={departmentPage <= 1 || loadingDepartments}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDepartmentPageChange(departmentPage + 1)}
                      disabled={departmentPage >= departmentTotalPages || loadingDepartments}
                      className="flex items-center gap-1"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Doktorlar */}
            <Card className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Doktorlar
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {doctorTotalCount} doktor
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!showDoctorForm) {
                      // Doktor formu açılırken tüm bölümleri yükle
                      await loadAllDepartments();
                    }
                    setShowDoctorForm(!showDoctorForm);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Doktor
                </Button>
              </div>

              {showDoctorForm && (
                <form onSubmit={doctorForm.handleSubmit(onSubmitDoctor)} className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  {loadingAllDepartments && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-700">Bölümler yükleniyor...</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Doktor Adı"
                      placeholder="Örn: Ahmet"
                      {...doctorForm.register('name')}
                      error={doctorForm.formState.errors.name?.message}
                    />
                    <Input
                      label="Doktor Soyadı"
                      placeholder="Örn: Yılmaz"
                      {...doctorForm.register('surname')}
                      error={doctorForm.formState.errors.surname?.message}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-semibold text-gray-700">
                      Bölüm
                    </label>
                    <select
                      {...doctorForm.register('departmentId', { valueAsNumber: true })}
                      disabled={loadingAllDepartments}
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base text-gray-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:border-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{loadingAllDepartments ? 'Bölümler yükleniyor...' : 'Bölüm seçin'}</option>
                      {allDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {doctorForm.formState.errors.departmentId && (
                      <p className="text-sm text-red-600 font-medium">
                        {doctorForm.formState.errors.departmentId.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button type="submit" size="sm" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDoctorForm(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {loadingDoctors ? (
                  <DoctorSkeleton count={doctorPageSize} />
                ) : (
                  <>
                    {doctors.map((doctor, index) => (
                      <div
                        key={doctor.id}
                        className={`p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200 fade-in-delay-${Math.min(index, 3)}`}
                      >
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doctor.name} {doctor.surname}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {doctor.departmentName}
                        </p>
                      </div>
                    ))}
                    {doctors.length === 0 && (
                      <div className="text-center py-12">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">
                          Henüz doktor tanımlanmamış
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Doktor Pagination */}
              {doctorTotalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Sayfa {doctorPage} / {doctorTotalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDoctorPageChange(doctorPage - 1)}
                      disabled={doctorPage <= 1 || loadingDoctors}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDoctorPageChange(doctorPage + 1)}
                      disabled={doctorPage >= doctorTotalPages || loadingDoctors}
                      className="flex items-center gap-1"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 