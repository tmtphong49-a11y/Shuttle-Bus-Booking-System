export type RouteType = 'Van' | 'Bus';
export type RouteStatus = 'Active' | 'Maintenance';
export type Shift = 'Morning' | 'Night';
export type Direction = 'To Work' | 'Home';
export type BookingStatus = 'Confirmed' | 'Cancelled' | 'NoShow';

export type UserRole = 'Admin' | 'Employee' | 'Guest';

export interface Route {
  id: string;
  name: string;
  code: string;
  type: RouteType;
  capacity: number;
  status: RouteStatus;
  driverName?: string;
  driverPhone?: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  routeId: string;
  time?: string;
  shift: Shift;
  direction: Direction;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  role: UserRole;
  phone?: string;
}

export interface TimeSlot {
  id: string;
  shift: Shift;
  direction: Direction;
  time: string;
}

export interface Booking {
  id: string;
  employeeId: string;
  date: string;
  shift: Shift;
  direction: Direction;
  routeId: string;
  pickupPointId: string;
  time: string;
  status: BookingStatus;
}
