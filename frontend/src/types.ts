export interface User {
  id: number;
  username: string;
  phone: string;
  is_admin: boolean;
  is_online: boolean;
  last_seen: string | null;
}

export interface Slot {
  id: number;
  label: string;
  is_enabled: boolean;
  sensor_occupied: boolean;
  available_for_booking: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  slot_id: number;
  slot_label: string;
  vehicle_make: string;
  registration_plate: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_price: number;
  status: string;
  payment_status: string;
}

export interface AdminBookingRow {
  id: number;
  slot_label: string;
  username: string;
  phone: string;
  registration_plate: string;
  vehicle_make: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_price: number;
  status: string;
  payment_status: string;
}
