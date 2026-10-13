import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Book,
  Student,
  LoanRecord,
  UserProfile,
  ActivePage,
  ToastMessage,
  UserRole,
} from '../types/library';
import {
  INITIAL_BOOKS,
  INITIAL_STUDENTS,
  INITIAL_LOANS,
  INITIAL_USERS,
  INSTITUTION_INFO,
} from '../data/seedData';

// Reference date for simulation consistency
export const SYSTEM_CURRENT_DATE = '2026-10-13';

interface LibraryContextType {
  books: Book[];
  students: Student[];
  loans: LoanRecord[];
  currentUser: UserProfile | null;
  activePage: ActivePage;
  toasts: ToastMessage[];
  isAdmin: boolean;
  isStudent: boolean;
  currentStudentProfile: Student | null;
  myLoans: LoanRecord[];
  setActivePage: (page: ActivePage) => void;
  login: (credential: string) => boolean;
  quickLogin: (userId: string) => void;
  quickSwitchRole: (targetRole: UserRole) => void;
  logout: () => void;
  addBook: (bookData: Omit<Book, 'id' | 'availableCopies'>) => void;
  updateBook: (id: string, bookData: Partial<Book>) => void;
  deleteBook: (id: string) => { success: boolean; message: string };
  addStudent: (studentData: Omit<Student, 'id' | 'registeredDate' | 'borrowedCount'>) => void;
  updateStudent: (id: string, studentData: Partial<Student>) => void;
  deleteStudent: (id: string) => { success: boolean; message: string };
  issueBook: (params: {
    bookId: string;
    studentId: string;
    durationDays: number;
    notes?: string;
  }) => { success: boolean; message: string };
  returnBook: (params: { loanId: string; finePaid?: boolean }) => { success: boolean; message: string };
  renewLoan: (loanId: string, extensionDays?: number) => { success: boolean; message: string };
  reserveBook: (bookId: string) => { success: boolean; message: string };
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;
  stats: {
    totalTitles: number;
    totalPhysicalBooks: number;
    activeLoansCount: number;
    overdueLoansCount: number;
    totalFineAccrued: number;
    totalStudents: number;
    availableCopiesTotal: number;
    nd1StudentsCount: number;
    nd2StudentsCount: number;
  };
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function getDaysDiff(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('fpe_cs_books');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BOOKS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('fpe_cs_students');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_STUDENTS;
  });

  const [loans, setLoans] = useState<LoanRecord[]>(() => {
    const saved = localStorage.getItem('fpe_cs_loans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_LOANS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fpe_cs_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default to Administrator (Engr. Adeyemi) for immediate rich view
    return INITIAL_USERS[0];
  });

  const [activePage, _setActivePage] = useState<ActivePage>(() => {
    return currentUser?.role === 'Student' ? 'student-portal' : 'dashboard';
  });

  const setActivePage = (page: ActivePage) => {
    if (currentUser?.role === 'Student') {
      // Students can only access student pages
      if (page === 'dashboard' || page === 'books' || page === 'students' || page === 'circulation' || page === 'reports') {
        _setActivePage('student-portal');
        return;
      }
    } else if (currentUser?.role === 'Administrator') {
      // Administrators can only access admin operations pages
      if (page === 'student-portal' || page === 'student-catalog' || page === 'student-id') {
        _setActivePage('dashboard');
        return;
      }
    }
    _setActivePage(page);
  };

  useEffect(() => {
    if (currentUser?.role === 'Student') {
      if (activePage !== 'student-portal' && activePage !== 'student-catalog' && activePage !== 'student-id') {
        _setActivePage('student-portal');
      }
    } else if (currentUser?.role === 'Administrator') {
      if (activePage !== 'dashboard' && activePage !== 'books' && activePage !== 'students' && activePage !== 'circulation' && activePage !== 'reports') {
        _setActivePage('dashboard');
      }
    }
  }, [currentUser]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem('fpe_cs_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('fpe_cs_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('fpe_cs_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fpe_cs_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fpe_cs_user');
    }
  }, [currentUser]);

  // Synchronize dynamic status and fine on loans based on current reference date
  useEffect(() => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.status === 'Returned') return loan;

        const isOverdue = loan.dueDate < SYSTEM_CURRENT_DATE;
        if (isOverdue) {
          const daysOver = Math.max(0, getDaysDiff(loan.dueDate, SYSTEM_CURRENT_DATE));
          const fine = daysOver * INSTITUTION_INFO.dailyFineRate;
          return {
            ...loan,
            status: 'Overdue',
            fineAmount: fine,
          };
        } else {
          return {
            ...loan,
            status: 'Active',
            fineAmount: 0,
          };
        }
      })
    );
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (credential: string): boolean => {
    const clean = credential.trim().toLowerCase();
    const matched = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.staffOrMatricId.toLowerCase() === clean ||
        u.name.toLowerCase().includes(clean)
    );

    if (matched) {
      setCurrentUser(matched);
      setActivePage(matched.role === 'Student' ? 'student-portal' : 'dashboard');
      addToast({
        type: 'success',
        title: `${matched.role} Login Successful`,
        message: `Welcome, ${matched.name} (${matched.staffOrMatricId})`,
      });
      return true;
    }

    // Fallback: check if credential matches a student matric in students list
    const studentMatch = students.find(
      (s) => s.matricNo.toLowerCase() === clean || s.email.toLowerCase() === clean
    );
    if (studentMatch) {
      const studentUser: UserProfile = {
        id: studentMatch.id,
        name: studentMatch.fullName,
        role: 'Student',
        email: studentMatch.email,
        staffOrMatricId: studentMatch.matricNo,
        avatarInitials: studentMatch.fullName.slice(0, 2).toUpperCase(),
        level: studentMatch.level,
        department: studentMatch.department,
      };
      setCurrentUser(studentUser);
      setActivePage('student-portal');
      addToast({
        type: 'success',
        title: 'Student Authentication Verified',
        message: `Welcome, ${studentMatch.fullName} (${studentMatch.level} Computer Science)`,
      });
      return true;
    }

    addToast({
      type: 'error',
      title: 'Authentication Failed',
      message: 'Please choose an authorized Administrator or Student demo account.',
    });
    return false;
  };

  const quickLogin = (userId: string) => {
    const user = INITIAL_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActivePage(user.role === 'Student' ? 'student-portal' : 'dashboard');
      addToast({
        type: 'success',
        title: `Switched to ${user.role} View`,
        message: `Active session: ${user.name} (${user.staffOrMatricId})`,
      });
    }
  };

  const quickSwitchRole = (targetRole: UserRole) => {
    if (targetRole === 'Administrator') {
      const admin = INITIAL_USERS.find((u) => u.role === 'Administrator') || INITIAL_USERS[0];
      setCurrentUser(admin);
      setActivePage('dashboard');
      addToast({
        type: 'info',
        title: 'Administrator Console Active',
        message: 'You have full circulation and catalog management privileges.',
      });
    } else {
      const student = INITIAL_USERS.find((u) => u.role === 'Student') || INITIAL_USERS[2];
      setCurrentUser(student);
      setActivePage('student-portal');
      addToast({
        type: 'info',
        title: 'Student Portal Active',
        message: `Logged in as student: ${student.name} (${student.staffOrMatricId}).`,
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    addToast({
      type: 'info',
      title: 'Session Terminated',
      message: 'You have been safely logged out of FPE Computer Science Library System.',
    });
  };

  const addBook = (bookData: Omit<Book, 'id' | 'availableCopies'>) => {
    const id = `b-${Date.now()}`;
    const newBook: Book = {
      ...bookData,
      id,
      availableCopies: bookData.totalCopies,
    };
    setBooks((prev) => [newBook, ...prev]);
    addToast({
      type: 'success',
      title: 'Textbook Cataloged',
      message: `"${bookData.title}" accessioned to Computer Science library.`,
    });
  };

  const updateBook = (id: string, bookData: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        
        let newTotal = bookData.totalCopies !== undefined ? bookData.totalCopies : b.totalCopies;
        const checkedOutCount = loans.filter(
          (l) => l.bookId === id && (l.status === 'Active' || l.status === 'Overdue')
        ).length;
        
        const newAvailable = Math.max(0, newTotal - checkedOutCount);

        return {
          ...b,
          ...bookData,
          totalCopies: newTotal,
          availableCopies: newAvailable,
        };
      })
    );
    addToast({
      type: 'success',
      title: 'Catalog Record Updated',
      message: 'Book details and physical copy counts saved.',
    });
  };

  const deleteBook = (id: string): { success: boolean; message: string } => {
    const book = books.find((b) => b.id === id);
    if (!book) return { success: false, message: 'Book not found' };

    const activeBookLoans = loans.filter(
      (l) => l.bookId === id && (l.status === 'Active' || l.status === 'Overdue')
    );

    if (activeBookLoans.length > 0) {
      const msg = `Cannot remove "${book.title}" because ${activeBookLoans.length} student copies are currently on loan. Return copies first.`;
      addToast({
        type: 'error',
        title: 'Action Blocked',
        message: msg,
      });
      return { success: false, message: msg };
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    addToast({
      type: 'info',
      title: 'Book De-accessioned',
      message: `"${book.title}" removed from the catalog.`,
    });
    return { success: true, message: 'Book deleted successfully' };
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'registeredDate' | 'borrowedCount'>) => {
    const exists = students.some(
      (s) => s.matricNo.trim().toUpperCase() === studentData.matricNo.trim().toUpperCase()
    );
    if (exists) {
      addToast({
        type: 'error',
        title: 'Duplicate Matric Number',
        message: `Student with matriculation number ${studentData.matricNo} is already registered.`,
      });
      return;
    }

    const id = `s-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
      registeredDate: SYSTEM_CURRENT_DATE,
      borrowedCount: 0,
    };
    setStudents((prev) => [newStudent, ...prev]);
    addToast({
      type: 'success',
      title: 'Student Registered',
      message: `${studentData.fullName} (${studentData.matricNo}) added to CS Department registry.`,
    });
  };

  const updateStudent = (id: string, studentData: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...studentData } : s))
    );
    addToast({
      type: 'success',
      title: 'Student Profile Updated',
      message: 'Student details saved successfully.',
    });
  };

  const deleteStudent = (id: string): { success: boolean; message: string } => {
    const student = students.find((s) => s.id === id);
    if (!student) return { success: false, message: 'Student not found' };

    const activeStudentLoans = loans.filter(
      (l) => l.studentId === id && (l.status === 'Active' || l.status === 'Overdue')
    );

    if (activeStudentLoans.length > 0) {
      const msg = `Cannot remove ${student.fullName}. Student currently has ${activeStudentLoans.length} unreturned library book(s).`;
      addToast({
        type: 'error',
        title: 'Action Blocked',
        message: msg,
      });
      return { success: false, message: msg };
    }

    setStudents((prev) => prev.filter((s) => s.id !== id));
    addToast({
      type: 'info',
      title: 'Student Deregistered',
      message: `${student.fullName} removed from registry.`,
    });
    return { success: true, message: 'Student deleted successfully' };
  };

  const issueBook = (params: {
    bookId: string;
    studentId: string;
    durationDays: number;
    notes?: string;
  }): { success: boolean; message: string } => {
    const book = books.find((b) => b.id === params.bookId);
    const student = students.find((s) => s.id === params.studentId);

    if (!book) return { success: false, message: 'Selected book does not exist.' };
    if (!student) return { success: false, message: 'Selected student not found.' };

    if (student.status === 'Suspended') {
      const msg = `Student ${student.fullName} is suspended and cannot borrow books.`;
      addToast({ type: 'error', title: 'Borrowing Denied', message: msg });
      return { success: false, message: msg };
    }

    if (book.availableCopies <= 0) {
      const msg = `No copies available for "${book.title}". All copies checked out.`;
      addToast({ type: 'warning', title: 'Out of Stock', message: msg });
      return { success: false, message: msg };
    }

    const studentActiveLoans = loans.filter(
      (l) => l.studentId === student.id && (l.status === 'Active' || l.status === 'Overdue')
    );

    if (studentActiveLoans.length >= INSTITUTION_INFO.maxBorrowLimit) {
      const msg = `${student.fullName} has reached the maximum borrowing quota of ${INSTITUTION_INFO.maxBorrowLimit} books.`;
      addToast({ type: 'warning', title: 'Borrow Limit Reached', message: msg });
      return { success: false, message: msg };
    }

    const hasOverdue = studentActiveLoans.some((l) => l.status === 'Overdue');
    if (hasOverdue) {
      const msg = `${student.fullName} has overdue books and pending penalties. Clear overdue loans first.`;
      addToast({ type: 'warning', title: 'Clear Overdue First', message: msg });
      return { success: false, message: msg };
    }

    const alreadyHasThisBook = studentActiveLoans.some((l) => l.bookId === book.id);
    if (alreadyHasThisBook) {
      const msg = `${student.fullName} already has a copy of this book checked out.`;
      addToast({ type: 'warning', title: 'Duplicate Loan', message: msg });
      return { success: false, message: msg };
    }

    const issueDate = SYSTEM_CURRENT_DATE;
    const dueDate = addDays(issueDate, params.durationDays);

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      courseCode: book.courseCode,
      studentId: student.id,
      studentMatricNo: student.matricNo,
      studentName: student.fullName,
      studentDept: student.department,
      studentLevel: student.level,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'Active',
      fineAmount: 0,
      finePaid: false,
      issuedBy: currentUser?.name || 'Departmental Librarian',
      notes: params.notes,
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, borrowedCount: s.borrowedCount + 1 } : s
      )
    );

    setLoans((prev) => [newLoan, ...prev]);

    addToast({
      type: 'success',
      title: 'Book Successfully Issued',
      message: `"${book.title}" issued to ${student.fullName}. Due: ${dueDate}`,
    });

    return { success: true, message: 'Book issued successfully' };
  };

  const returnBook = (params: {
    loanId: string;
    finePaid?: boolean;
  }): { success: boolean; message: string } => {
    const loan = loans.find((l) => l.id === params.loanId);
    if (!loan) return { success: false, message: 'Loan transaction record not found' };
    if (loan.status === 'Returned') return { success: false, message: 'This book has already been returned' };

    const returnDate = SYSTEM_CURRENT_DATE;

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== params.loanId) return l;
        return {
          ...l,
          status: 'Returned',
          returnDate,
          finePaid: params.finePaid ?? (l.fineAmount === 0),
        };
      })
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === loan.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === loan.studentId
          ? { ...s, borrowedCount: Math.max(0, s.borrowedCount - 1) }
          : s
      )
    );

    addToast({
      type: 'success',
      title: 'Book Return Processed',
      message: `"${loan.bookTitle}" returned by ${loan.studentName}. Stock restored.`,
    });

    return { success: true, message: 'Book returned successfully' };
  };

  const renewLoan = (loanId: string, extensionDays = 14): { success: boolean; message: string } => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Loan record not found' };
    if (loan.status === 'Returned') return { success: false, message: 'Cannot renew a returned book' };
    if (loan.status === 'Overdue') {
      const msg = 'Overdue loans cannot be renewed online. Return the physical book to the library desk to settle penalties.';
      addToast({ type: 'warning', title: 'Renewal Denied', message: msg });
      return { success: false, message: msg };
    }

    const newDueDate = addDays(loan.dueDate, extensionDays);

    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, dueDate: newDueDate } : l))
    );

    addToast({
      type: 'success',
      title: 'Loan Extended',
      message: `"${loan.bookTitle}" renewed. New due date is ${newDueDate}.`,
    });

    return { success: true, message: 'Loan renewed successfully' };
  };

  const reserveBook = (bookId: string): { success: boolean; message: string } => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found' };

    addToast({
      type: 'success',
      title: 'Hold Request Submitted',
      message: `Reservation placed for "${book.title}". Pick up at CS Dept Library circulation desk within 48 hours.`,
    });

    return { success: true, message: 'Hold placed successfully' };
  };

  const resetToDefaultData = () => {
    setBooks(INITIAL_BOOKS);
    setStudents(INITIAL_STUDENTS);
    setLoans(INITIAL_LOANS);
    setCurrentUser(INITIAL_USERS[0]);
    setActivePage('dashboard');
    localStorage.removeItem('fpe_cs_books');
    localStorage.removeItem('fpe_cs_students');
    localStorage.removeItem('fpe_cs_loans');
    localStorage.removeItem('fpe_cs_user');
    addToast({
      type: 'info',
      title: 'System Restored',
      message: 'Federal Polytechnic Ede Computer Science Library demo data reset to default.',
    });
  };

  const isAdmin = currentUser?.role === 'Administrator';
  const isStudent = currentUser?.role === 'Student';

  // Matched student record if logged in as Student
  const currentStudentProfile = isStudent
    ? students.find(
        (s) =>
          s.matricNo.toLowerCase() === currentUser?.staffOrMatricId.toLowerCase() ||
          s.id === currentUser?.id
      ) || students[0]
    : null;

  // Loans for this student
  const myLoans = isStudent && currentStudentProfile
    ? loans.filter((l) => l.studentId === currentStudentProfile.id || l.studentMatricNo === currentStudentProfile.matricNo)
    : [];

  const activeLoans = loans.filter((l) => l.status === 'Active');
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');
  const totalFineAccrued = overdueLoans.reduce((acc, l) => acc + (l.finePaid ? 0 : l.fineAmount), 0);
  const totalPhysicalBooks = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopiesTotal = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const nd1StudentsCount = students.filter((s) => s.level === 'ND I').length;
  const nd2StudentsCount = students.filter((s) => s.level === 'ND II').length;

  const stats = {
    totalTitles: books.length,
    totalPhysicalBooks,
    activeLoansCount: activeLoans.length,
    overdueLoansCount: overdueLoans.length,
    totalFineAccrued,
    totalStudents: students.length,
    availableCopiesTotal,
    nd1StudentsCount,
    nd2StudentsCount,
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        students,
        loans,
        currentUser,
        activePage,
        toasts,
        isAdmin,
        isStudent,
        currentStudentProfile,
        myLoans,
        setActivePage,
        login,
        quickLogin,
        quickSwitchRole,
        logout,
        addBook,
        updateBook,
        deleteBook,
        addStudent,
        updateStudent,
        deleteStudent,
        issueBook,
        returnBook,
        renewLoan,
        reserveBook,
        addToast,
        removeToast,
        resetToDefaultData,
        stats,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
