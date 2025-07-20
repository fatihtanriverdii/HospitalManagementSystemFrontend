export interface Patient {
  id?: number;
  tc: string;
  name: string;
  surname: string;
  phone: string;
  address: string;
}

export interface Department {
  id?: number;
  name: string;
}

export interface Doctor {
  id?: number;
  name: string;
  surname: string;
  departmentId: number;
  department?: Department;
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  startTime: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
} 