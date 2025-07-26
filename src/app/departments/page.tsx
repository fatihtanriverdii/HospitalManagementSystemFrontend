'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { departmentApi, doctorApi } from '@/services/api';
import { Department, Doctor } from '@/types';
import { Plus, Building2, User, ArrowLeft, CheckCircle } from 'lucide-react';

const departmentSchema = z.object({
  name: z.string().min(1, 'Bölüm adı gereklidir'),
});

const doctorSchema = z.object({
  name: z.string().min(1, 'Doktor adı gereklidir'),
  surname: z.string().min(1, 'Doktor soyadı gereklidir'),
  departmentId: z.number().min(1, 'Bölüm seçimi gereklidir'),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;
type DoctorFormData = z.infer<typeof doctorSchema>;

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);

  const departmentForm = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const doctorForm = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  });

  useEffect(() => {
    loadDepartments();
    loadDoctors();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
      setDepartments([]);
    }
  };

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

  const onSubmitDepartment = async (data: DepartmentFormData) => {
    try {
      const response = await departmentApi.create(data);
      if (response.data.success) {
        departmentForm.reset();
        setShowDepartmentForm(false);
        loadDepartments();
      } else {
        alert('Bölüm oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Bölüm oluşturulurken hata:', error);
      alert('Bölüm oluşturulurken bir hata oluştu.');
    }
  };

  const onSubmitDoctor = async (data: DoctorFormData) => {
    try {
      const response = await doctorApi.create(data);
      if (response.data.success) {
        doctorForm.reset();
        setShowDoctorForm(false);
        loadDoctors();
      } else {
        alert('Doktor oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Doktor oluşturulurken hata:', error);
      alert('Doktor oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowDepartmentForm(!showDepartmentForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Bölüm
                </Button>
              </div>

              {showDepartmentForm && (
                <form onSubmit={departmentForm.handleSubmit(onSubmitDepartment)} className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <Input
                    label="Bölüm Adı"
                    placeholder="Örn: Kardiyoloji"
                    {...departmentForm.register('name')}
                    error={departmentForm.formState.errors.name?.message}
                  />
                  <div className="flex gap-3 mt-6">
                    <Button type="submit" size="sm" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Kaydet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDepartmentForm(false)}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200"
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
              </div>
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
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowDoctorForm(!showDoctorForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Doktor
                </Button>
              </div>

              {showDoctorForm && (
                <form onSubmit={doctorForm.handleSubmit(onSubmitDoctor)} className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
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
                      className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base text-gray-900 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:border-green-500 transition-all duration-200"
                    >
                      <option value="">Bölüm seçin</option>
                      {departments.map((dept) => (
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
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.name} {doctor.surname}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {departments.find(d => d.id === doctor.departmentId)?.name}
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 