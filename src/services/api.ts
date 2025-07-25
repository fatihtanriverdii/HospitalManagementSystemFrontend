import axios from 'axios';
import { Patient, Doctor, Department, Appointment, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7131/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Patient API
export const patientApi = {
  create: (patient: Patient) => api.post<ApiResponse<Patient>>('/Patient', patient),
  getByTc: (tc: string) => api.get<ApiResponse<Patient>>(`/Patient/tc/${tc}`),
  getAppointments: (patientId: number) => api.get<ApiResponse<Appointment[]>>(`/Appointment/patient/${patientId}`),
};

// Doctor API
export const doctorApi = {
  create: (doctor: Doctor) => api.post<ApiResponse<Doctor>>('/Doctor', doctor),
  getAll: () => api.get<ApiResponse<Doctor[]>>('/Doctor'),
  getByDepartment: (departmentId: number) => api.get<ApiResponse<Doctor[]>>(`/Doctor/department/${departmentId}`),
  // Belirli bir tarihte doktorun uygun saatlerini getir
  getAvailableSlots: (doctorId: number, date: string) =>
    api.get<ApiResponse<{ id: number; time: string }[]>>(`/Doctor/${doctorId}/available-slots`, { params: { date } }),
  // (Opsiyonel) Belirli bir tarih aralığı için uygun saatleri getir (ileride kullanılabilir)
  getAvailableSlotsInRange: (doctorId: number, startDate: string, endDate: string) =>
    api.get<ApiResponse<{ date: string; slots: { id: number; time: string }[] }[]>>(`/Doctor/${doctorId}/available-slots-range`, { params: { startDate, endDate } }),
};

// Department API
export const departmentApi = {
  create: (department: Department) => api.post<ApiResponse<Department>>('/Department', department),
  getAll: () => api.get<ApiResponse<Department[]>>('/Department'),
};

// Appointment API
export const appointmentApi = {
  create: (appointment: Appointment) => api.post<ApiResponse<Appointment>>('/Appointment', appointment),
  getByPatient: (patientId: number) => api.get<ApiResponse<Appointment[]>>(`/Appointment/patient/${patientId}`),
};

export default api; 