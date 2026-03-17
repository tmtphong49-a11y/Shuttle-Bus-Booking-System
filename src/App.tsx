/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Bus, 
  MapPin, 
  Users, 
  CalendarCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  LogOut,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  Languages,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  Route, 
  PickupPoint, 
  Employee, 
  Booking, 
  RouteType, 
  RouteStatus, 
  Shift, 
  Direction,
  UserRole
} from './types';
import { 
  INITIAL_ROUTES, 
  INITIAL_PICKUP_POINTS, 
  INITIAL_EMPLOYEES, 
  INITIAL_TIME_SLOTS,
  INITIAL_BOOKINGS 
} from './constants';

// --- Components ---

const translations = {
  en: {
    appName: "Shuttle Booking", dashboard: "Dashboard", routes: "Routes", pickups: "Pickup Points", times: "Times", employees: "Employees", booking: "Book Shuttle", myBookings: "My Bookings",
    totalRoutes: "Total Routes", activeRoutes: "Active Routes", todayBookings: "Today's Bookings", cumulativeBookings: "Total Bookings", allRoutesStatus: "All Routes Status",
    employee: "Employee", pickupPoint: "Pickup Point", shift: "Shift", route: "Route", status: "Status", todayCount: "Today's Count", searchRoutes: "Search routes...",
    searchPickups: "Search pickup points...", searchEmployees: "Search employees...", addRoute: "Add Route", addPickup: "Add Pickup Point", addTime: "Add Time", addEmployee: "Add Employee",
    routeInfo: "Route Info", type: "Type", capacity: "Capacity", actions: "Actions", pointName: "Point Name", time: "Time", id: "ID", department: "Department",
    bookYourShuttle: "Book Your Shuttle", selectTravelDetails: "Select your travel details below", travelDate: "Travel Date", direction: "Direction", selectRoute: "Select Route",
    chooseRoute: "Choose a route...", choosePickup: "Choose a pickup point...", chooseTime: "Choose time...", selectRouteFirst: "Select a route first", confirmBooking: "Confirm Booking",
    myBookingHistory: "My Booking History", activeBookings: "Active Bookings", bookingId: "Booking ID", confirmed: "Confirmed", cancelled: "Cancelled", noShow: "No Show", cancelBooking: "Cancel Booking",
    noBookingsFound: "No Bookings Found", noBookingsDesc: "You haven't made any shuttle bookings yet.",    bookNow: "Book Now", morning: "Morning", night: "Night Shift",
    confirmedBookings: "Confirmed Bookings", cancelledBookings: "Cancelled Bookings", noShowBookings: "No Show Bookings",
    toWork: "To Work", home: "Home", active: "Active", maintenance: "Maintenance", editRoute: "Edit Route", addNewRoute: "Add New Route", routeName: "Route Name",
    routeCode: "License Plate", driverName: "Driver Name", driverPhone: "Driver Phone", updateRoute: "Update Route", createRoute: "Create Route", editPickup: "Edit Pickup Point", updatePoint: "Update Point", createPoint: "Create Point",
    editTime: "Edit Time", updateTime: "Update Time", createTime: "Create Time",
    editEmployee: "Edit Employee", firstName: "First Name", lastName: "Last Name", employeeId: "Employee ID", updateEmployee: "Update Employee", createEmployee: "Create Employee", phone: "Phone",
    confirmCancellation: "Confirm Cancellation", areYouSure: "Are you sure?", cancelDesc: "This action cannot be undone. Your seat will be released for others.",
    confirmDelete: "Confirm Deletion", deleteDesc: "This action cannot be undone. All associated data will be deleted.", yesDelete: "Yes, Delete",
    noKeepIt: "No, Keep it", yesCancel: "Yes, Cancel", unknownRoute: "Unknown Route", unknownPoint: "Unknown Point", unknownEmployee: "Unknown Employee",
    noBookingsToday: "No bookings for today", seats: "Seats", van: "Van", bus: "Bus",
    bookWeekly: "Book for entire week (Mon-Sat)", weeklyBooking: "Weekly Booking",
    admin: "Admin", guest: "Guest", login: "Login", logout: "Logout", selectRole: "Select Role to Login", role: "Role",
    accessDenied: "Access Denied", accessDeniedDesc: "You don't have permission to view this page."
  },
  th: {
    appName: "ระบบจองรถรับส่ง", dashboard: "แดชบอร์ด", routes: "สายรถ", pickups: "จุดรับส่ง", times: "เวลา", employees: "พนักงาน", booking: "จองรถ", myBookings: "การจองของฉัน",
    totalRoutes: "สายรถทั้งหมด", activeRoutes: "สายรถที่ใช้งาน", todayBookings: "การจองวันนี้", cumulativeBookings: "การจองสะสม", allRoutesStatus: "สถานะสายรถทั้งหมด",
    employee: "พนักงาน", pickupPoint: "จุดรับส่ง", shift: "กะเวลา", route: "สายรถ", status: "สถานะ", todayCount: "จำนวนวันนี้", searchRoutes: "ค้นหาสายรถ...",
    searchPickups: "ค้นหาจุดรับส่ง...", searchEmployees: "ค้นหาพนักงาน...", addRoute: "เพิ่มสายรถ", addPickup: "เพิ่มจุดรับส่ง", addTime: "เพิ่มเวลา", addEmployee: "เพิ่มพนักงาน",
    routeInfo: "ข้อมูลสายรถ", type: "ประเภท", capacity: "ความจุ", actions: "จัดการ", pointName: "ชื่อจุดรับส่ง", time: "เวลา", id: "รหัส", department: "แผนก",
    bookYourShuttle: "จองรถรับส่ง", selectTravelDetails: "เลือกรายละเอียดการเดินทางด้านล่าง", travelDate: "วันที่เดินทาง", direction: "เส้นทาง", selectRoute: "เลือกสายรถ",
    chooseRoute: "เลือกสายรถ...", choosePickup: "เลือกจุดรับส่ง...", chooseTime: "เลือกเวลา...", selectRouteFirst: "กรุณาเลือกสายรถก่อน", confirmBooking: "ยืนยันการจอง",
    myBookingHistory: "ประวัติการจองของฉัน", activeBookings: "รายการที่จองไว้", bookingId: "รหัสการจอง", confirmed: "ยืนยันแล้ว", cancelled: "ยกเลิกแล้ว", noShow: "ไม่มาขึ้นรถ", cancelBooking: "ยกเลิกการจอง",
    noBookingsFound: "ไม่พบรายการจอง", noBookingsDesc: "คุณยังไม่มีรายการจองรถในขณะนี้", bookNow: "จองตอนนี้", morning: "กะเช้า", night: "กะดึก",
    confirmedBookings: "รายการที่ยืนยันแล้ว", cancelledBookings: "รายการที่ยกเลิก", noShowBookings: "รายการที่ไม่มาขึ้นรถ",
    toWork: "ไปทำงาน", home: "กลับบ้าน", active: "ใช้งาน", maintenance: "ซ่อมบำรุง", editRoute: "แก้ไขสายรถ", addNewRoute: "เพิ่มสายรถใหม่", routeName: "ชื่อสายรถ",
    routeCode: "ทะเบียนรถ", driverName: "ชื่อคนขับ", driverPhone: "เบอร์โทรศัพท์คนขับ", updateRoute: "อัปเดตสายรถ", createRoute: "สร้างสายรถ", editPickup: "แก้ไขจุดรับส่ง", updatePoint: "อัปเดตจุดรับส่ง", createPoint: "สร้างจุดรับส่ง",
    editTime: "แก้ไขเวลา", updateTime: "อัปเดตเวลา", createTime: "สร้างเวลา",
    editEmployee: "แก้ไขข้อมูลพนักงาน", firstName: "ชื่อ", lastName: "นามสกุล", employeeId: "รหัสพนักงาน", updateEmployee: "อัปเดตข้อมูลพนักงาน", createEmployee: "เพิ่มพนักงาน", phone: "เบอร์โทร",
    confirmCancellation: "ยืนยันการยกเลิก", areYouSure: "คุณแน่ใจหรือไม่?", cancelDesc: "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ที่นั่งของคุณจะถูกคืนให้ผู้อื่น",
    confirmDelete: "ยืนยันการลบ", deleteDesc: "การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบ", yesDelete: "ใช่, ลบเลย",
    noKeepIt: "ไม่, เก็บไว้", yesCancel: "ใช่, ยกเลิก", unknownRoute: "ไม่พบสายรถ", unknownPoint: "ไม่พบจุดรับส่ง", unknownEmployee: "ไม่พบพนักงาน",
    noBookingsToday: "ไม่มีการจองในวันนี้", seats: "ที่นั่ง", van: "รถตู้", bus: "รถบัส",
    bookWeekly: "จองทั้งสัปดาห์ (จันทร์-เสาร์)", weeklyBooking: "จองรายสัปดาห์",
    admin: "ผู้ดูแลระบบ", guest: "ผู้เยี่ยมชม", login: "เข้าสู่ระบบ", logout: "ออกจากระบบ", selectRole: "เลือกสิทธิ์เพื่อเข้าสู่ระบบ", role: "สิทธิ์",
    dailyReport: "รายงานประจำวัน",
    accessDenied: "ปฏิเสธการเข้าถึง", accessDeniedDesc: "คุณไม่มีสิทธิ์ในการเข้าชมหน้านี้"
  }
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={18} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('shuttle-role');
    return (saved as UserRole) || 'Guest';
  });
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(() => {
    return localStorage.getItem('shuttle-employeeId');
  });
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'routes' | 'pickups' | 'employees' | 'booking' | 'my-bookings' | 'daily-report'>(() => {
    const saved = localStorage.getItem('shuttle-role');
    if (saved === 'Employee') return 'booking';
    return 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('shuttle-theme');
    if (saved) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [lang, setLang] = useState<'en' | 'th'>(() => {
    const saved = localStorage.getItem('shuttle-lang');
    return (saved === 'th' || saved === 'en') ? saved as 'en' | 'th' : 'th';
  });

  useEffect(() => {
    localStorage.setItem('shuttle-lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('shuttle-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const t = translations[lang];

  // State for data
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [pickups, setPickups] = useState<PickupPoint[]>(INITIAL_PICKUP_POINTS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(INITIAL_TIME_SLOTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: routesData, error: routesError } = await supabase.from('routes').select('*');
        if (routesError) console.error('Error fetching routes:', routesError);
        if (routesData) {
          setRoutes(routesData.map((r: any) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            type: r.type,
            capacity: r.capacity,
            status: r.status,
          })));
        }

        const { data: pickupsData, error: pickupsError } = await supabase.from('pickups').select('*');
        if (pickupsError) console.error('Error fetching pickups:', pickupsError);
        if (pickupsData) {
          setPickups(pickupsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            routeId: p.routeid,
            time: p.time,
            shift: p.shift || 'Morning',
            direction: p.direction || 'To Work',
          })));
        }
        
        const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*');
        if (employeesError) console.error('Error fetching employees:', employeesError);
        if (employeesData) {
          const mappedEmployees: Employee[] = employeesData.map((emp: any) => ({
            id: emp.id,
            firstName: emp.firstname,
            lastName: emp.lastname,
            employeeId: emp.employeeid,
            department: emp.department,
            role: emp.role || 'Employee',
            phone: emp.phone,
          }));
          setEmployees(mappedEmployees);
        }

        const { data: timesData, error: timesError } = await supabase.from('time_slots').select('*');
        if (timesError) console.error('Error fetching time slots:', timesError);
        if (timesData) {
          setTimeSlots(timesData.flatMap((t: any) => {
            const slots = [];
            if (t.time_to_work) {
              slots.push({ id: `${t.id}-to-work`, shift: t.shift, direction: 'To Work', time: t.time_to_work });
            }
            if (t.time_home) {
              slots.push({ id: `${t.id}-home`, shift: t.shift, direction: 'Home', time: t.time_home });
            }
            return slots;
          }));
        }
        
        const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
        if (bookingsError) console.error('Error fetching bookings:', bookingsError);
        if (bookingsData) {
          setBookings(bookingsData.map((b: any) => ({
            id: b.id,
            employeeId: b.employeeid,
            date: b.date,
            shift: b.shift,
            direction: b.direction,
            routeId: b.routeid,
            pickupPointId: b.pickuppointid,
            time: b.time,
            status: b.status,
          })));
        }
      } catch (err) {
        console.error('Unexpected error fetching data:', err);
      }
    }
    fetchData();
  }, []);

  // Search states
  const [routeSearch, setRouteSearch] = useState('');
  const [pickupSearch, setPickupSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedReportDate, setSelectedReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal states
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, id: string, type: 'route' | 'pickup' | 'time' | 'employee' | null }>({ isOpen: false, id: '', type: null });

  // Form states
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingPickup, setEditingPickup] = useState<PickupPoint | null>(null);
  const [editingTime, setEditingTime] = useState<TimeSlot | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Booking form state
  const [newBooking, setNewBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning' as Shift,
    direction: 'To Work' as Direction,
    routeId: '',
    pickupPointId: '',
    time: '',
    isWeekly: false
  });

  // --- Handlers ---

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const routeData: Route = {
      id: editingRoute?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string || '',
      code: formData.get('code') as string || '',
      type: formData.get('type') as RouteType || 'Van',
      capacity: Number(formData.get('capacity')) || 0,
      status: formData.get('status') as RouteStatus || 'Active',
      driverName: formData.get('driverName') as string || '',
      driverPhone: formData.get('driverPhone') as string || '',
    };

    try {
      if (editingRoute) {
        const { error } = await supabase.from('routes').update({
          name: routeData.name,
          code: routeData.code,
          type: routeData.type,
          capacity: routeData.capacity,
          status: routeData.status,
          driverName: routeData.driverName,
          driverPhone: routeData.driverPhone
        }).eq('id', editingRoute.id);
        if (error) throw error;
        setRoutes(routes.map(r => r.id === editingRoute.id ? routeData : r));
      } else {
        const { data, error } = await supabase.from('routes').insert({
          id: routeData.id,
          name: routeData.name,
          code: routeData.code,
          type: routeData.type,
          capacity: routeData.capacity,
          status: routeData.status,
          driverName: routeData.driverName,
          driverPhone: routeData.driverPhone
        }).select().single();
        if (error) throw error;
        setRoutes([...routes, { ...routeData, id: data.id }]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving route: ' + err.message);
      return;
    }
    setIsRouteModalOpen(false);
    setEditingRoute(null);
  };

  const handleAddPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const pickupData: PickupPoint = {
      id: editingPickup?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string || '',
      routeId: formData.get('routeId') as string || '',
      time: '',
      shift: formData.get('shift') as Shift || 'Morning',
      direction: formData.get('direction') as Direction || 'To Work',
    };

    // Map to database schema
    const dbData = {
      id: pickupData.id,
      name: pickupData.name,
      routeid: pickupData.routeId,
      time: pickupData.time,
      shift: pickupData.shift,
      direction: pickupData.direction,
    };

    try {
      if (editingPickup) {
        const { error } = await supabase.from('pickups').update({
          name: dbData.name,
          routeid: dbData.routeid,
          time: dbData.time,
          shift: dbData.shift,
          direction: dbData.direction
        }).eq('id', editingPickup.id);
        if (error) throw error;
        setPickups(pickups.map(p => p.id === editingPickup.id ? pickupData : p));
      } else {
        const { data, error } = await supabase.from('pickups').insert({
          id: dbData.id,
          name: dbData.name,
          routeid: dbData.routeid,
          time: dbData.time,
          shift: dbData.shift,
          direction: dbData.direction
        }).select().single();
        if (error) throw error;
        setPickups([...pickups, { ...pickupData, id: data.id }]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving pickup: ' + err.message);
      return;
    }
    setIsPickupModalOpen(false);
    setEditingPickup(null);
  };

  const handleAddTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const timeData: TimeSlot = {
      id: editingTime?.id || Math.random().toString(36).substr(2, 9),
      shift: formData.get('shift') as Shift || 'Morning',
      direction: formData.get('direction') as Direction || 'To Work',
      time: formData.get('time') as string || '',
    };

    try {
      if (editingTime) {
        const updateData: any = {
          shift: timeData.shift,
        };
        if (timeData.direction === 'To Work') {
          updateData.time_to_work = timeData.time;
        } else {
          updateData.time_home = timeData.time;
        }
        const { error } = await supabase.from('time_slots').update(updateData).eq('id', editingTime.id);
        if (error) throw error;
        setTimeSlots(timeSlots.map(t => t.id === editingTime.id ? timeData : t));
      } else {
        const insertData: any = {
          id: timeData.id,
          shift: timeData.shift,
        };
        if (timeData.direction === 'To Work') {
          insertData.time_to_work = timeData.time;
        } else {
          insertData.time_home = timeData.time;
        }
        const { data, error } = await supabase.from('time_slots').insert(insertData).select().single();
        if (error) throw error;
        setTimeSlots([...timeSlots, { ...timeData, id: data.id }]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving time: ' + err.message);
      // Optimistic update fallback for demo
      setTimeSlots(editingTime ? timeSlots.map(t => t.id === editingTime.id ? timeData : t) : [...timeSlots, timeData]);
    }
    setIsTimeModalOpen(false);
    setEditingTime(null);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const employeeData: Employee = {
      id: editingEmployee?.id || Math.random().toString(36).substr(2, 9),
      firstName: formData.get('firstName') as string || '',
      lastName: formData.get('lastName') as string || '',
      employeeId: formData.get('employeeId') as string || '',
      department: formData.get('department') as string || '',
      role: formData.get('role') as UserRole || 'Employee',
      phone: formData.get('phone') as string || '',
    };

    // Map to database schema
    const dbData = {
      id: employeeData.id,
      firstname: employeeData.firstName,
      lastname: employeeData.lastName,
      employeeid: employeeData.employeeId,
      department: employeeData.department,
      role: employeeData.role,
      phone: employeeData.phone,
    };

    try {
      if (editingEmployee) {
        const { error } = await supabase.from('employees').update({
          firstname: dbData.firstname,
          lastname: dbData.lastname,
          employeeid: dbData.employeeid,
          department: dbData.department,
          role: dbData.role,
          phone: dbData.phone
        }).eq('id', editingEmployee.id);
        if (error) throw error;
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? employeeData : emp));
      } else {
        const { data, error } = await supabase.from('employees').insert({
          id: dbData.id,
          firstname: dbData.firstname,
          lastname: dbData.lastname,
          employeeid: dbData.employeeid,
          department: dbData.department,
          role: dbData.role,
          phone: dbData.phone
        }).select().single();
        if (error) throw error;
        setEmployees([...employees, { ...employeeData, id: data.id }]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error saving employee: ' + err.message);
      return;
    }
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.routeId || !newBooking.pickupPointId) return;

    const newBookings: Booking[] = [];
    
    if (newBooking.isWeekly) {
      // Find Monday of the selected week
      const selectedDate = new Date(newBooking.date);
      const day = selectedDate.getDay();
      const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(selectedDate.setDate(diff));

      // Create bookings for Mon-Sat (6 days)
      for (let i = 0; i < 6; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        newBookings.push({
          id: Math.random().toString(36).substr(2, 9),
          employeeId: currentEmployeeId || 'e1',
          date: dateString,
          shift: newBooking.shift as Shift || 'Morning',
          direction: newBooking.direction as Direction || 'To Work',
          routeId: newBooking.routeId || '',
          pickupPointId: newBooking.pickupPointId || '',
          time: newBooking.time || '',
          status: 'Confirmed',
        });
      }
    } else {
      newBookings.push({
        id: Math.random().toString(36).substr(2, 9),
        employeeId: currentEmployeeId || 'e1',
        date: newBooking.date || '',
        shift: newBooking.shift as Shift || 'Morning',
        direction: newBooking.direction as Direction || 'To Work',
        routeId: newBooking.routeId || '',
        pickupPointId: newBooking.pickupPointId || '',
        time: newBooking.time || '',
        status: 'Confirmed',
      });
    }

    const dbBookings = newBookings.map(b => ({
      id: b.id,
      employeeid: b.employeeId,
      date: b.date,
      shift: b.shift,
      direction: b.direction,
      routeid: b.routeId,
      pickuppointid: b.pickupPointId,
      time: b.time,
      status: b.status,
    }));

    try {
      const { data, error } = await supabase.from('bookings').insert(dbBookings).select();
      if (error) {
        console.error('Supabase insert error:', error);
        alert(`Failed to save booking to database: ${error.message}. Please check your Supabase table columns.`);
        return; // Stop and don't update local state if DB fails
      }
      
      const insertedBookings = data.map((b: any) => ({
        id: b.id,
        employeeId: b.employeeid,
        date: b.date,
        shift: b.shift,
        direction: b.direction,
        routeId: b.routeid,
        pickupPointId: b.pickuppointid,
        time: b.time,
        status: b.status,
      }));

      setBookings([...bookings, ...insertedBookings]);
      setActiveTab('my-bookings');
      setNewBooking({
        date: new Date().toISOString().split('T')[0],
        shift: 'Morning',
        direction: 'To Work',
        routeId: '',
        pickupPointId: '',
        time: '',
        isWeekly: false
      });
    } catch (err: any) {
      console.error('Unexpected error:', err);
      alert(`An unexpected error occurred: ${err.message}`);
    }
  };

  const handleCancelBooking = async () => {
    if (selectedBookingToCancel) {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'Cancelled' })
          .eq('id', selectedBookingToCancel);
        if (error) throw error;
        
        setBookings(bookings.map(b => b.id === selectedBookingToCancel ? { ...b, status: 'Cancelled' } : b));
        setIsCancelModalOpen(false);
        setSelectedBookingToCancel(null);
      } catch (err: any) {
        console.error(err);
        alert('Error canceling booking: ' + err.message);
      }
    }
  };

  const handleDeleteRoute = async (id: string) => {
    try {
      // Delete associated pickups first to avoid foreign key constraint error
      const { error: pickupsError } = await supabase.from('pickups').delete().eq('routeid', id);
      if (pickupsError) throw pickupsError;

      // Delete associated bookings
      const { error: bookingsError } = await supabase.from('bookings').delete().eq('routeid', id);
      if (bookingsError) throw bookingsError;

      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;

      setRoutes(routes.filter(rt => rt.id !== id));
      setPickups(pickups.filter(pk => pk.routeId !== id));
      setBookings(bookings.filter(b => b.routeId !== id));
    } catch (err: any) {
      console.error(err);
      alert('Error deleting route: ' + err.message);
    }
  };

  const handleDeletePickup = async (id: string) => {
    try {
      // Delete associated bookings first to avoid foreign key constraint error
      const { error: bookingsError } = await supabase.from('bookings').delete().eq('pickuppointid', id);
      if (bookingsError) throw bookingsError;

      const { error } = await supabase.from('pickups').delete().eq('id', id);
      if (error) throw error;

      setPickups(pickups.filter(pk => pk.id !== id));
      setBookings(bookings.filter(b => b.pickupPointId !== id));
    } catch (err: any) {
      console.error(err);
      alert('Error deleting pickup: ' + err.message);
    }
  };

  const handleDeleteTime = async (id: string) => {
    try {
      const { error } = await supabase.from('time_slots').delete().eq('id', id);
      if (error) throw error;
      setTimeSlots(timeSlots.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Error deleting time: ' + err.message);
      setTimeSlots(timeSlots.filter(t => t.id !== id));
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return;
    
    const { id, type } = deleteConfirmation;
    setDeleteConfirmation({ isOpen: false, id: '', type: null });

    if (type === 'route') await handleDeleteRoute(id);
    else if (type === 'pickup') await handleDeletePickup(id);
    else if (type === 'time') await handleDeleteTime(id);
    else if (type === 'employee') await handleDeleteEmployee(id);
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      // Delete associated bookings first to avoid foreign key constraint error
      const { error: bookingsError } = await supabase.from('bookings').delete().eq('employeeid', id);
      if (bookingsError) throw bookingsError;

      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== id));
      setBookings(bookings.filter(b => b.employeeId !== id));
    } catch (err: any) {
      console.error(err);
      alert('Error deleting employee: ' + err.message);
    }
  };

  // --- Helpers ---

  const getRouteName = (id: string) => routes.find(r => r.id === id)?.name || t.unknownRoute;
  const getPickupName = (id: string) => pickups.find(p => p.id === id)?.name || t.unknownPoint;
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : t.unknownEmployee;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'Active').length,
    todayBookings: todayBookings.length,
    totalPickups: pickups.length,
    cumulativeBookings: bookings.length
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Bus size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.totalRoutes}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalRoutes} <span className="text-sm font-normal text-slate-400">({stats.activeRoutes} {t.active})</span></h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.todayBookings}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.todayBookings}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.pickups}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalPickups}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.cumulativeBookings}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.cumulativeBookings}</h3>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">ปริมาณการจองแต่ละสาย</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routes.map(r => ({
              name: r.name,
              bookings: bookings.filter(b => b.routeId === r.id && b.status === 'Confirmed').length
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.todayBookings}</h3>
            <Badge variant="info">{todayBookings.length} {t.booking}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.employee}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.pickupPoint}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.shift}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayBookings.length > 0 ? todayBookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{getEmployeeName(b.employeeId)}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{getPickupName(b.pickupPointId)}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <Badge variant={b.shift === 'Morning' ? 'warning' : 'info'}>{b.shift === 'Morning' ? t.morning : t.night}</Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 text-sm italic">{t.noBookingsToday}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t.allRoutesStatus}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.route}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.status}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.todayCount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{r.code}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Badge variant={r.status === 'Active' ? 'success' : 'danger'}>{r.status === 'Active' ? t.active : t.maintenance}</Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {todayBookings.filter(b => b.routeId === r.id).length} / {r.capacity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRoutes = () => {
    const filtered = routes.filter(r => 
      r.name.toLowerCase().includes(routeSearch.toLowerCase()) || 
      r.code.toLowerCase().includes(routeSearch.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchRoutes}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingRoute(null); setIsRouteModalOpen(true); }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>{t.addRoute}</span>
          </button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.routeInfo}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.type}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.capacity}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.status}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{r.code}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{r.type === 'Van' ? t.van : t.bus}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{r.capacity} {t.seats}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <Badge variant={r.status === 'Active' ? 'success' : 'danger'}>{r.status === 'Active' ? t.active : t.maintenance}</Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => { setEditingRoute(r); setIsRouteModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmation({ isOpen: true, id: r.id, type: 'route' })}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  const renderPickups = () => {
    const filtered = pickups.filter(p => 
      p.name.toLowerCase().includes(pickupSearch.toLowerCase()) ||
      getRouteName(p.routeId).toLowerCase().includes(pickupSearch.toLowerCase())
    );

    const groupedPickups = filtered.reduce((acc, p) => {
      if (!acc[p.routeId]) acc[p.routeId] = [];
      acc[p.routeId].push(p);
      return acc;
    }, {} as Record<string, PickupPoint[]>);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPickups}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
              value={pickupSearch}
              onChange={(e) => setPickupSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingPickup(null); setIsPickupModalOpen(true); }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>{t.addPickup}</span>
          </button>
        </div>

        {Object.entries(groupedPickups).map(([routeId, routePickups]) => (
          <Card key={routeId} className="overflow-hidden">
            <div 
              className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedRoutes(prev => ({ ...prev, [routeId]: !prev[routeId] }))}
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{getRouteName(routeId)}</h3>
              {expandedRoutes[routeId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedRoutes[routeId] !== false && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 font-semibold">{t.pointName}</th>
                      <th className="px-4 sm:px-6 py-3 font-semibold">{t.shift}</th>
                      <th className="px-4 sm:px-6 py-3 font-semibold">{t.direction}</th>
                      <th className="px-4 sm:px-6 py-3 font-semibold text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {routePickups.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{p.name}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.shift === 'Morning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                            {p.shift === 'Morning' ? t.morning : t.night}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.direction === 'To Work' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'}`}>
                            {p.direction === 'To Work' ? t.toWork : t.home}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => { setEditingPickup(p); setIsPickupModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmation({ isOpen: true, id: p.id, type: 'pickup' })}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderTimes = () => {
    const groupedTimes = timeSlots.reduce((acc, ts) => {
      const key = `${ts.shift}-${ts.direction}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ts);
      return acc;
    }, {} as Record<string, TimeSlot[]>);

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button 
            onClick={() => { setEditingTime(null); setIsTimeModalOpen(true); }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>{t.addTime}</span>
          </button>
        </div>
        
        {(['Morning', 'Night'] as Shift[]).map(shift => (
          <div key={shift} className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{shift === 'Morning' ? t.morning : t.night}</h3>
            {(['To Work', 'Home'] as Direction[]).map(direction => {
              const key = `${shift}-${direction}`;
              const slots = groupedTimes[key] || [];
              return (
                <Card key={key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300">{direction === 'To Work' ? t.toWork : t.home}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slots.map(ts => (
                      <div key={ts.id} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{ts.time}</span>
                        <button onClick={() => { setEditingTime(ts); setIsTimeModalOpen(true); }} className="text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteConfirmation({ isOpen: true, id: ts.id, type: 'time' })} className="text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderEmployees = () => {
    const filtered = employees.filter(e => 
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t.searchEmployees}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-slate-100"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>{t.addEmployee}</span>
          </button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.employee}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.id}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.department}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.phone}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">{t.role}</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {e.firstName?.[0] || ''}{e.lastName?.[0] || ''}
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{e.firstName} {e.lastName}</div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{e.employeeId}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{e.department}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{e.phone || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.role === 'Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {e.role}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => { setEditingEmployee(e); setIsEmployeeModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmation({ isOpen: true, id: e.id, type: 'employee' })}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderBookingForm = () => {
    const availablePickups = pickups.filter(p => 
      p.routeId === newBooking.routeId
    );

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.bookYourShuttle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.selectTravelDetails}</p>
            </div>
          </div>

          <form onSubmit={handleCreateBooking} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.travelDate}</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-slate-100"
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.shift}</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['Morning', 'Night'] as Shift[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${newBooking.shift === s ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                      onClick={() => setNewBooking({ ...newBooking, shift: s })}
                    >
                      {s === 'Morning' ? t.morning : t.night}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.direction}</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(['To Work', 'Home'] as Direction[]).map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${newBooking.direction === d ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    onClick={() => setNewBooking({ ...newBooking, direction: d })}
                  >
                    {d === 'To Work' ? t.toWork : t.home}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.selectRoute}</label>
              <div className="grid grid-cols-1 gap-2">
                {routes.filter(r => r.status === 'Active').map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className={`w-full px-4 py-2 text-sm font-medium rounded-xl transition-all border ${newBooking.routeId === r.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'}`}
                    onClick={() => setNewBooking({ ...newBooking, routeId: r.id, pickupPointId: '' })}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.pickupPoint}</label>
              <select 
                required
                disabled={!newBooking.routeId}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:text-slate-100"
                value={newBooking.pickupPointId || ''}
                onChange={(e) => setNewBooking({ ...newBooking, pickupPointId: e.target.value })}
              >
                <option value="">{newBooking.routeId ? t.choosePickup : t.selectRouteFirst}</option>
                {availablePickups.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.time}</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.filter(ts => ts.shift === newBooking.shift && ts.direction === newBooking.direction).map(ts => (
                  <button
                    key={ts.id}
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all border ${newBooking.time === ts.time ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'}`}
                    onClick={() => setNewBooking({ ...newBooking, time: ts.time })}
                  >
                    {ts.time}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={newBooking.isWeekly}
                  onChange={(e) => setNewBooking({ ...newBooking, isWeekly: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.bookWeekly}</span>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform active:scale-[0.98]"
            >
              {t.confirmBooking}
            </button>
          </form>
        </Card>
      </div>
    );
  };

  const renderMyBookings = () => {
    const myBookings = bookings.filter(b => b.employeeId === currentEmployeeId && b.status === 'Confirmed');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.myBookingHistory}</h3>
          <Badge variant="success">{myBookings.length} {t.activeBookings}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBookings.length > 0 ? myBookings.map(b => (
            <Card key={b.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{t.bookingId}: {b.id.toUpperCase()}</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{new Date(b.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <Badge variant="success">{t.confirmed}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{t.shift} & {t.direction}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {b.shift === 'Morning' ? t.morning : t.night} • {b.direction === 'To Work' ? t.toWork : t.home}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{t.route}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getRouteName(b.routeId)}</p>
                  {(() => {
                    const route = routes.find(r => r.id === b.routeId);
                    return route ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                        <p>{t.routeCode}: {route.code}</p>
                        <p>{t.driverName}: {route.driverName || '-'}</p>
                        <p>{t.driverPhone}: {route.driverPhone || '-'}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl col-span-2">
                  <p className="text-xs text-slate-400 mb-1">{t.pickupPoint}</p>
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-blue-500" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{getPickupName(b.pickupPointId)} ({b.time})</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedBookingToCancel(b.id); setIsCancelModalOpen(true); }}
                className="w-full py-2 text-rose-600 font-semibold border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                {t.cancelBooking}
              </button>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full mb-4">
                <CalendarCheck size={48} />
              </div>
              <h4 className="text-slate-800 dark:text-slate-100 font-bold">{t.noBookingsFound}</h4>
              <p className="text-slate-500 dark:text-slate-400">{t.noBookingsDesc}</p>
              <button 
                onClick={() => setActiveTab('booking')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
              >
                {t.bookNow}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDailyReport = () => {
    const dailyBookings = bookings.filter(b => b.date === selectedReportDate && b.status === 'Confirmed');
    const cancelledBookings = bookings.filter(b => b.date === selectedReportDate && b.status === 'Cancelled');
    const noShowBookings = bookings.filter(b => b.date === selectedReportDate && b.status === 'NoShow');

    const renderTable = (title: string, data: Booking[]) => (
      <Card className="p-6">
        <h4 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">{t.employee}</th>
                <th className="px-4 py-3 font-semibold">{t.department}</th>
                <th className="px-4 py-3 font-semibold">{t.shift}</th>
                <th className="px-4 py-3 font-semibold">{t.direction}</th>
                <th className="px-4 py-3 font-semibold">{t.route}</th>
                <th className="px-4 py-3 font-semibold">{t.pickupPoint}</th>
                <th className="px-4 py-3 font-semibold">{t.time}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.length > 0 ? data.map(b => {
                const emp = employees.find(e => e.id === b.employeeId);
                return (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{emp ? `${emp.firstName} ${emp.lastName}` : b.employeeId}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{emp ? emp.department : '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{b.shift === 'Morning' ? t.morning : t.night}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{b.direction === 'To Work' ? t.toWork : t.home}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{getRouteName(b.routeId)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{getPickupName(b.pickupPointId)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{b.time}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">{t.noBookingsToday}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">รายงานการจองรายวัน</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const data = dailyBookings;
                const csvContent = [
                  ['ชื่อ', 'นามสกุล', 'แผนก', 'จุดรถ รับ - ส่ง', 'หมายเหตุ(เบอร์โทร)'],
                  ...data.map(b => {
                    const emp = employees.find(e => e.id === b.employeeId);
                    return [
                      emp ? emp.firstName : b.employeeId,
                      emp ? emp.lastName : '-',
                      emp ? emp.department : '-',
                      getPickupName(b.pickupPointId),
                      emp ? (emp.phone ? `'${emp.phone}` : '-') : '-'
                    ].map(cell => `"${cell}"`).join(',');
                  })
                ].join('\n');
                const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `daily-report-${selectedReportDate}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium"
            >
              Export CSV
            </button>
            <input
              type="date"
              value={selectedReportDate}
              onChange={(e) => setSelectedReportDate(e.target.value)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
        </div>

        {renderTable(t.confirmedBookings, dailyBookings)}
        {renderTable(t.cancelledBookings, cancelledBookings)}
        {renderTable(t.noShowBookings, noShowBookings)}
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: ['Admin'] },
    { id: 'routes', label: t.routes, icon: Bus, roles: ['Admin'] },
    { id: 'pickups', label: t.pickups, icon: MapPin, roles: ['Admin'] },
    { id: 'times', label: t.times, icon: Clock, roles: ['Admin'] },
    { id: 'employees', label: t.employees, icon: Users, roles: ['Admin'] },
    { id: 'booking', label: t.booking, icon: CalendarCheck, roles: ['Admin', 'Employee'] },
    { id: 'my-bookings', label: t.myBookings, icon: Clock, roles: ['Admin', 'Employee'] },
    { id: 'daily-report', label: t.dailyReport, icon: Calendar, roles: ['Admin'] },
  ].filter(item => item.roles.includes(userRole));

  if (userRole === 'Guest') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none mb-4">
              <Bus size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.appName}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{t.selectRole}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter Employee ID"
                value={employeeIdInput}
                onChange={(e) => setEmployeeIdInput(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={() => {
                  const emp = employees.find(e => e.employeeId === employeeIdInput);
                  if (emp) {
                    const role = emp.role || 'Employee';
                    setUserRole(role);
                    setCurrentEmployeeId(emp.id);
                    setActiveTab(role === 'Admin' ? 'dashboard' : 'booking');
                    localStorage.setItem('shuttle-role', role);
                    localStorage.setItem('shuttle-employeeId', emp.id);
                  } else {
                    setLoginError('Invalid Employee ID');
                  }
                }}
                className="w-full flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all"
              >
                Login
              </button>
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
              className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors flex items-center space-x-2"
            >
              <Languages size={16} />
              <span>{lang === 'en' ? 'ภาษาไทย' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center space-x-3 border-b border-slate-50 dark:border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
              <Bus size={24} />
            </div>
            <h1 className="text-lg font-bold leading-tight text-slate-800 dark:text-slate-100">Shuttle<br/><span className="text-blue-600">Booking</span></h1>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-50 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${userRole === 'Admin' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                {userRole === 'Admin' ? 'AD' : 'EM'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {userRole === 'Admin' ? 'Administrator' : 'Employee User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userRole === 'Admin' ? t.admin : t.employee}
                </p>
              </div>
              <button 
                onClick={() => {
                  setUserRole('Guest');
                  setActiveTab('dashboard');
                }}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title={t.logout}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize truncate max-w-[150px] sm:max-w-none">
              {navItems.find(i => i.id === activeTab)?.label || activeTab}
            </h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Clock size={14} />
              <span>{new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all flex items-center space-x-2"
                title={lang === 'en' ? 'Switch to Thai' : 'เปลี่ยนเป็นภาษาอังกฤษ'}
              >
                <Languages size={18} />
                <span className="text-xs font-bold uppercase">{lang}</span>
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!navItems.find(i => i.id === activeTab) ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.accessDenied}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">{t.accessDeniedDesc}</p>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && renderDashboard()}
                  {activeTab === 'routes' && renderRoutes()}
                  {activeTab === 'pickups' && renderPickups()}
                  {activeTab === 'times' && renderTimes()}
                  {activeTab === 'employees' && renderEmployees()}
                  {activeTab === 'booking' && renderBookingForm()}
                  {activeTab === 'my-bookings' && renderMyBookings()}
                  {activeTab === 'daily-report' && renderDailyReport()}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <Modal 
        isOpen={isRouteModalOpen} 
        onClose={() => setIsRouteModalOpen(false)} 
        title={editingRoute ? t.editRoute : t.addRoute}
      >
        <form onSubmit={handleAddRoute} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.routeName}</label>
            <input name="name" defaultValue={editingRoute?.name} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="e.g. Sukhumvit Line" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.routeCode}</label>
              <input name="code" defaultValue={editingRoute?.code} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="SKV-01" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.driverName}</label>
              <input name="driverName" defaultValue={editingRoute?.driverName} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="e.g. Somchai" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.driverPhone}</label>
              <input name="driverPhone" defaultValue={editingRoute?.driverPhone} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="e.g. 081-234-5678" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.type}</label>
              <select name="type" defaultValue={editingRoute?.type} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="Van">{t.van}</option>
                <option value="Bus">{t.bus}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.capacity}</label>
              <input name="capacity" type="number" defaultValue={editingRoute?.capacity} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.status}</label>
              <select name="status" defaultValue={editingRoute?.status} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="Active">{t.active}</option>
                <option value="Maintenance">{t.maintenance}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            {editingRoute ? t.updateRoute : t.createRoute}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isPickupModalOpen} 
        onClose={() => setIsPickupModalOpen(false)} 
        title={editingPickup ? t.editPickup : t.addPickup}
      >
        <form onSubmit={handleAddPickup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.pointName}</label>
            <input name="name" defaultValue={editingPickup?.name} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="e.g. BTS On Nut" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.route}</label>
            <select name="routeId" defaultValue={editingPickup?.routeId} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
              <option value="">{t.chooseRoute}</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.shift}</label>
              <select name="shift" defaultValue={editingPickup?.shift || 'Morning'} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="Morning">{t.morning}</option>
                <option value="Night">{t.night}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.direction}</label>
              <select name="direction" defaultValue={editingPickup?.direction || 'To Work'} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="To Work">{t.toWork}</option>
                <option value="Home">{t.home}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            {editingPickup ? t.updatePoint : t.createPoint}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isTimeModalOpen} 
        onClose={() => setIsTimeModalOpen(false)} 
        title={editingTime ? t.editTime : t.addTime}
      >
        <form onSubmit={handleAddTime} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.shift}</label>
              <select name="shift" defaultValue={editingTime?.shift || 'Morning'} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="Morning">{t.morning}</option>
                <option value="Night">{t.night}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.direction}</label>
              <select name="direction" defaultValue={editingTime?.direction || 'To Work'} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="To Work">{t.toWork}</option>
                <option value="Home">{t.home}</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.time}</label>
            <input name="time" type="time" defaultValue={editingTime?.time} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            {editingTime ? t.updateTime : t.createTime}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => setIsEmployeeModalOpen(false)} 
        title={editingEmployee ? t.editEmployee : t.addEmployee}
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.firstName}</label>
              <input name="firstName" defaultValue={editingEmployee?.firstName} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.lastName}</label>
              <input name="lastName" defaultValue={editingEmployee?.lastName} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.employeeId}</label>
            <input name="employeeId" defaultValue={editingEmployee?.employeeId} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="EMP000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.department}</label>
              <input name="department" defaultValue={editingEmployee?.department} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="e.g. IT" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.phone}</label>
              <input name="phone" defaultValue={editingEmployee?.phone} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100" placeholder="08x-xxx-xxxx" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.role}</label>
              <select name="role" defaultValue={editingEmployee?.role || 'Employee'} required className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-slate-100">
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            {editingEmployee ? t.updateEmployee : t.createEmployee}
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)} 
        title={t.confirmCancellation}
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.areYouSure}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.cancelBookingDesc}</p>
          </div>
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1 py-2 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {t.noKeepIt}
            </button>
            <button 
              onClick={handleCancelBooking}
              className="flex-1 py-2 text-white font-semibold bg-rose-600 rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-200 dark:shadow-none"
            >
              {t.yesCancel}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={deleteConfirmation.isOpen} 
        onClose={() => setDeleteConfirmation({ isOpen: false, id: '', type: null })} 
        title={t.confirmDelete}
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full">
            <Trash2 size={32} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.areYouSure}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.deleteDesc}</p>
          </div>
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={() => setDeleteConfirmation({ isOpen: false, id: '', type: null })}
              className="flex-1 py-2 text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {t.noKeepIt}
            </button>
            <button 
              onClick={executeDelete}
              className="flex-1 py-2 text-white font-semibold bg-rose-600 rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-200 dark:shadow-none"
            >
              {t.yesDelete}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
