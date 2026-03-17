import { Route, PickupPoint, Employee, Booking, TimeSlot } from './types';

export const INITIAL_ROUTES: Route[] = [
  { id: 'r1', name: 'Sukhumvit Line', code: 'SKV-01', type: 'Bus', capacity: 40, status: 'Active' },
  { id: 'r2', name: 'Sathorn Line', code: 'STN-02', type: 'Van', capacity: 12, status: 'Active' },
  { id: 'r3', name: 'Bangna Line', code: 'BN-03', type: 'Bus', capacity: 40, status: 'Maintenance' },
  { id: 'r4', name: 'Rama 9 Line', code: 'RM9-04', type: 'Van', capacity: 12, status: 'Active' },
];

export const INITIAL_PICKUP_POINTS: PickupPoint[] = [
  { id: 'p1', name: 'BTS On Nut', routeId: 'r1', time: '07:00', shift: 'Morning', direction: 'To Work' },
  { id: 'p2', name: 'BTS Bang Chak', routeId: 'r1', time: '07:10', shift: 'Morning', direction: 'To Work' },
  { id: 'p3', name: 'BTS Punnawithi', routeId: 'r1', time: '07:20', shift: 'Morning', direction: 'To Work' },
  { id: 'p4', name: 'MRT Silom', routeId: 'r2', time: '07:30', shift: 'Morning', direction: 'To Work' },
  { id: 'p5', name: 'Central Rama 9', routeId: 'r4', time: '07:45', shift: 'Morning', direction: 'To Work' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', firstName: 'Somsak', lastName: 'Jaidee', employeeId: 'EMP001', department: 'IT', role: 'Employee' },
  { id: 'e2', firstName: 'Wipa', lastName: 'Sookjai', employeeId: 'EMP002', department: 'HR', role: 'Employee' },
  { id: 'e3', firstName: 'Anan', lastName: 'Panya', employeeId: 'EMP003', department: 'Finance', role: 'Admin' },
  { id: 'e4', firstName: 'Malee', lastName: 'Raksit', employeeId: 'EMP004', department: 'Marketing', role: 'Employee' },
];

export const INITIAL_TIME_SLOTS: TimeSlot[] = [
  { id: 'ts1', shift: 'Morning', timeToWork: '07:00', timeHome: '17:00' },
  { id: 'ts2', shift: 'Morning', timeToWork: '07:30', timeHome: '17:30' },
  { id: 'ts3', shift: 'Morning', timeToWork: '08:00', timeHome: '18:00' },
  { id: 'ts4', shift: 'Night', timeToWork: '19:00', timeHome: '05:00' },
  { id: 'ts5', shift: 'Night', timeToWork: '19:30', timeHome: '05:30' },
  { id: 'ts6', shift: 'Night', timeToWork: '20:00', timeHome: '06:00' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', employeeId: 'e1', date: new Date().toISOString().split('T')[0], shift: 'Morning', direction: 'To Work', routeId: 'r1', pickupPointId: 'p1', time: '07:00', status: 'Confirmed' },
  { id: 'b2', employeeId: 'e2', date: new Date().toISOString().split('T')[0], shift: 'Morning', direction: 'To Work', routeId: 'r2', pickupPointId: 'p4', time: '07:30', status: 'Confirmed' },
  { id: 'b3', employeeId: 'e3', date: new Date().toISOString().split('T')[0], shift: 'Night', direction: 'Home', routeId: 'r1', pickupPointId: 'p1', time: '19:00', status: 'Confirmed' },
];
