import { create } from 'zustand';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent';
}

export interface PayrollRecord {
  id: string;
  employeeName: string;
  period: string;
  grossPay: string;
  netPay: string;
  status: 'Paid' | 'Processing' | 'Failed';
}

interface MockDataState {
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  approveLeave: (id: string) => void;
}

const initialEmployees: Employee[] = [
  { id: '1', name: 'John Doe', email: 'john.doe@symbiosis.com', department: 'Engineering', role: 'Software Engineer', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@symbiosis.com', department: 'HR', role: 'HR Manager', status: 'Active' },
  { id: '3', name: 'Robert Johnson', email: 'robert.j@symbiosis.com', department: 'Finance', role: 'Accountant', status: 'On Leave' },
  { id: '4', name: 'Emily Davis', email: 'emily.d@symbiosis.com', department: 'Sales', role: 'Sales Rep', status: 'Active' },
];

const initialLeaves: LeaveRequest[] = [
  { id: '1', employeeName: 'Robert Johnson', type: 'Annual Leave', startDate: '2026-06-21', endDate: '2026-06-25', status: 'Approved' },
  { id: '2', employeeName: 'Emily Davis', type: 'Sick Leave', startDate: '2026-06-19', endDate: '2026-06-20', status: 'Pending' },
];

const initialAttendance: AttendanceRecord[] = [
  { id: '1', employeeName: 'John Doe', date: '2026-06-19', checkIn: '08:55 AM', checkOut: '05:05 PM', status: 'Present' },
  { id: '2', employeeName: 'Jane Smith', date: '2026-06-19', checkIn: '09:15 AM', checkOut: '05:30 PM', status: 'Late' },
  { id: '3', employeeName: 'Emily Davis', date: '2026-06-19', checkIn: '--:--', checkOut: '--:--', status: 'Absent' },
];

const initialPayroll: PayrollRecord[] = [
  { id: '1', employeeName: 'John Doe', period: 'May 2026', grossPay: '$8,500', netPay: '$6,250', status: 'Paid' },
  { id: '2', employeeName: 'Jane Smith', period: 'May 2026', grossPay: '$7,200', netPay: '$5,400', status: 'Paid' },
  { id: '3', employeeName: 'Robert Johnson', period: 'May 2026', grossPay: '$6,800', netPay: '$5,100', status: 'Paid' },
];

export const useMockDataStore = create<MockDataState>((set) => ({
  employees: initialEmployees,
  leaves: initialLeaves,
  attendance: initialAttendance,
  payroll: initialPayroll,
  addEmployee: (emp) => set((state) => ({ 
    employees: [...state.employees, { ...emp, id: Math.random().toString(36).substr(2, 9) }] 
  })),
  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter(e => e.id !== id)
  })),
  approveLeave: (id) => set((state) => ({
    leaves: state.leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l)
  }))
}));
