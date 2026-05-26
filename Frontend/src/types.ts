export interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export interface Patient {
  id: number;
  fullName: string;
  email: string;
}

export interface Appointment {
  id: number;
  doctorId: number;
  doctor?: Doctor;
  patientId: number;
  patient?: Patient;
  appointmentTime: string;
  notes: string;
}