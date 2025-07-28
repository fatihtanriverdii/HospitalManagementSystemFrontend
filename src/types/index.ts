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
  time: string;
  doctorName?: string;
  doctorSurname?: string;
  departmentName?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
} 