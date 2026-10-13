export type UserRole = 'Administrator' | 'Student';

export type StudentLevel = 'ND I' | 'ND II' | 'HND I' | 'HND II';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  courseCode?: string; // e.g. COM 211, COM 222
  category: string;
  shelfLocation: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  edition?: string;
  callNumber: string;
  description?: string;
  isProjectMonograph?: boolean;
}

export interface Student {
  id: string;
  matricNo: string;
  fullName: string;
  department: string;
  level: StudentLevel;
  phone: string;
  email: string;
  status: 'Active' | 'Suspended';
  registeredDate: string;
  borrowedCount: number;
}

export type LoanStatus = 'Active' | 'Returned' | 'Overdue';

export interface LoanRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  courseCode?: string;
  studentId: string;
  studentMatricNo: string;
  studentName: string;
  studentDept: string;
  studentLevel: StudentLevel;
  issueDate: string; // ISO date YYYY-MM-DD
  dueDate: string;   // ISO date YYYY-MM-DD
  returnDate?: string | null; // ISO date YYYY-MM-DD or null
  status: LoanStatus;
  fineAmount: number; // In Naira (₦)
  finePaid: boolean;
  issuedBy: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  staffOrMatricId: string;
  avatarInitials: string;
  level?: StudentLevel;
  department: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export type ActivePage =
  | 'dashboard'
  | 'books'
  | 'students'
  | 'circulation'
  | 'reports'
  | 'student-portal'
  | 'student-catalog'
  | 'student-id';
