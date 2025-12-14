// types/index.ts

// Tipos principais
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'guardian' | 'responsible';
  phone?: string;
  enrollment?: string;
  status?: 'active' | 'inactive';
  class?: string;
  matricula?: string;
  createdAt?: string;
  updatedAt?: string;
  grades?: any[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollment: string;
  classId?: string;
  className?: string;
  birthDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  guardianId?: string;
  guardianName?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  teacherId: string;
  teacherName?: string;
  studentCount: number;
  subjectCount: number;
  schedule?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  teacherId?: string;
  teacherName?: string;
  classIds?: string[];
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  value: number;
  maxValue: number;
  weight: number;
  type: 'test' | 'assignment' | 'exam' | 'participation' | 'project';
  date: string;
  comments?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience?: ('all' | 'students' | 'teachers' | 'parents')[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'holiday' | 'meeting' | 'exam' | 'sport' | 'cultural' | 'other';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  organizer?: string;
  participants?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Relatórios
export interface FinancialReport {
  period: string;
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface DefaultersReport {
  students: Array<{
    id: string;
    name: string;
    totalDue: number;
    overdueDays: number;
    invoices: Array<{
      id: string;
      amount: number;
      dueDate: string;
      description: string;
    }>;
  }>;
}

export interface StudentHistoryReport {
  student: {
    id: string;
    name: string;
    email: string;
  };
  grades: Array<{
    subject: string;
    average: number;
    grades: Array<{
      value: number;
      type: string;
      date: string;
    }>;
  }>;
  attendance: {
    rate: number;
    totalClasses: number;
    absences: number;
  };
  invoices: Array<{
    description: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
}

// Dashboard Stats
export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeInvoices: number;
  paidInvoicesThisMonth: number;
  revenueThisMonth: number;
}

export interface TeacherDashboardStats {
  totalClasses: number;
  totalStudents: number;
  assignmentsPending: number;
  nextClass?: {
    id: string;
    name: string;
    time: string;
  };
  recentGrades?: Grade[];
}

export interface StudentDashboardStats {
  enrolledClasses: number;
  averageGrade: number;
  attendanceRate: number;
  pendingAssignments: number;
  upcomingExams?: Array<{
    subject: string;
    date: string;
  }>;
  recentGrades?: Grade[];
}

// Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
}

// Request DTOs (Data Transfer Objects)
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  access_token: string;
  user: UserProfile;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher' | 'admin' | 'guardian' | 'responsible';
  phone?: string;
  enrollment?: string;
  classId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  role?: 'admin' | 'teacher' | 'student' | 'guardian' | 'responsible';
}

export interface CreateClassDto {
  name: string;
  grade: string;
  teacherId: string;
  schedule?: string;
}

export interface UpdateClassDto {
  name?: string;
  grade?: string;
  teacherId?: string;
  schedule?: string;
  status?: 'active' | 'inactive';
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  credits: number;
  teacherId?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
  teacherId?: string;
}

export interface CreateGradeDto {
  studentId: string;
  subjectId: string;
  value: number;
  maxValue: number;
  weight: number;
  type: 'test' | 'assignment' | 'exam' | 'participation' | 'project';
  date: string;
  comments?: string;
}

export interface UpdateGradeDto {
  value?: number;
  maxValue?: number;
  weight?: number;
  type?: 'test' | 'assignment' | 'exam' | 'participation' | 'project';
  date?: string;
  comments?: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience?: ('all' | 'students' | 'teachers' | 'parents')[];
  expiresAt?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high';
  targetAudience?: ('all' | 'students' | 'teachers' | 'parents')[];
  isPublished?: boolean;
  expiresAt?: string;
}

export interface CreateInvoiceDto {
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface UpdateInvoiceDto {
  description?: string;
  amount?: number;
  dueDate?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

export interface BatchInvoiceDto {
  classId: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface CreateAttendanceDto {
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface UpdateAttendanceDto {
  status?: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  type: 'academic' | 'holiday' | 'meeting' | 'exam' | 'sport' | 'cultural' | 'other';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  organizer?: string;
  color?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  type?: 'academic' | 'holiday' | 'meeting' | 'exam' | 'sport' | 'cultural' | 'other';
  startDate?: string;
  endDate?: string;
  location?: string;
  organizer?: string;
  color?: string;
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  enrollment?: string;
}

// Filter Params
export interface FilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  role?: string;
  classId?: string;
  studentId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// Batch Operations
export interface AttendanceBatchDto {
  classId: string;
  date: string;
  attendances: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

// Calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  color?: string;
  extendedProps?: {
    description?: string;
    location?: string;
    organizer?: string;
  };
}

// Statistics
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
}

export interface ClassStatistics {
  classId: string;
  className: string;
  averageGrade: number;
  attendanceRate: number;
  studentCount: number;
}