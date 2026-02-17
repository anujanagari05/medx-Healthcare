export type Role = 'user' | 'hospital' | 'driver' | 'pharmacy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  severity?: 'normal' | 'moderate' | 'severe';
  actionRequired?: boolean;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  symptoms: string;
  type: 'Audio' | 'Video' | 'In-Person';
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  amount: number;
}

export interface Ride {
  id: string;
  patientId: string;
  patientName: string;
  driverId?: string;
  driverName?: string;
  vehicleType: 'Bike' | 'Car' | 'Ambulance';
  pickupLocation: string;
  dropLocation: string;
  status: 'Requested' | 'En Route' | 'Picked Up' | 'Completed';
  requestTime: Date;
  etaMinutes?: number;
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  patientName: string;
  items: string[];
  totalAmount: number;
  status: 'Placed' | 'Preparing' | 'Ready' | 'Delivered';
  date: Date;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
}

export enum ViewState {
  AUTH,
  ROLE_SELECTION,
  CODE_VERIFICATION,
  DASHBOARD
}

