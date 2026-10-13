import React, { useState } from 'react';
import { useLibrary, SYSTEM_CURRENT_DATE, addDays, getDaysDiff } from '../context/LibraryContext';
import { INSTITUTION_INFO } from '../data/seedData';
import { LoanRecord } from '../types/library';
import {
  ArrowLeftRight,
  Search,
  BookOpen,
  User,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  X,
  CreditCard,
  FileCheck,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const CirculationPage: React.FC = () => {
  const {
    books,
    students,
    loans,
    issueBook,
    returnBook,
    renewLoan,
    stats,
  } = useLibrary();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'active' | 'issue' | 'history'>('active');

  // Issue Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [issueNotes, setIssueNotes] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Table filters
  const [loanSearch, setLoanSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue'>('all');

  // Return Modal State
  const [returningLoan, setReturningLoan] = useState<LoanRecord | null>(null);
  const [finePaidCheck, setFinePaidCheck] = useState(true);

  // Loan Receipt Slip Modal
  const [receiptLoan, setReceiptLoan] = useState<LoanRecord | null>(null);

  // Derived loans
  const activeLoans = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue');
  const returnedLoans = loans.filter((l) => l.status === 'Returned');

  const filteredActiveLoans = activeLoans.filter((l) => {
    const q = loanSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      l.bookTitle.toLowerCase().includes(q) ||
      l.studentName.toLowerCase().includes(q) ||
      l.studentMatricNo.toLowerCase().includes(q) ||
      l.bookIsbn.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = l.status === 'Active';
    if (statusFilter === 'overdue') matchesStatus = l.status === 'Overdue';

    return matchesSearch && matchesStatus;
  });

  const filteredReturnedLoans = returnedLoans.filter((l) => {
    const q = loanSearch.trim().toLowerCase();
    return (
      !q ||
      l.bookTitle.toLowerCase().includes(q) ||
      l.studentName.toLowerCase().includes(q) ||
      l.studentMatricNo.toLowerCase().includes(q)
    );
  });

  // Selected student analysis for issuance
  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentBook = books.find((b) => b.id === selectedBookId);

  const studentCurrentLoans = currentStudent
    ? loans.filter(
        (l) =>
          l.studentId === currentStudent.id &&
          (l.status === 'Active' || l.status === 'Overdue')
      )
    : [];

  const studentHasOverdue = studentCurrentLoans.some((l) => l.status === 'Overdue');
  const studentAtLimit = studentCurrentLoans.length >= INSTITUTION_INFO.maxBorrowLimit;
  const isStudentSuspended = currentStudent?.status === 'Suspended';

  const canIssue =
    currentStudent &&
    currentBook &&
    currentBook.availableCopies > 0 &&
    !studentAtLimit &&
    !studentHasOverdue &&
    !isStudentSuspended;

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canIssue || !currentStudent || !currentBook) return;

    const res = issueBook({
      studentId: currentStudent.id,
      bookId: currentBook.id,
      durationDays,
      notes: issueNotes,
    });
    if (res.success) {
      setSelectedStudentId('');
      setSelectedBookId('');
      setIssueNotes('');
      setStudentSearch('');
      setBookSearch('');
      setActiveTab('active');
    }
  };

  const handleConfirmReturn = () => {
    if (!returningLoan) return;
    returnBook({ loanId: returningLoan.id, finePaid: finePaidCheck });
    setReturningLoan(null);
  };

  // Filter students for picker
  const filteredStudentPicker = students.filter((s) => {
    const q = studentSearch.trim().toLowerCase();
    return !q || s.fullName.toLowerCase().includes(q) || s.matricNo.toLowerCase().includes(q);
  });

  // Filter books for picker
  const filteredBookPicker = books.filter((b) => {
    const q = bookSearch.trim().toLowerCase();
    return (
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      (b.courseCode && b.courseCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            Circulation Operations Desk
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#202721] tracking-tight mt-1">
            Book Loans & Returns
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1">
            Active loans ledger, checkout processing, and overdue fee reconciliation
          </p>
        </div>

        {/* Tab switchers */}
        <div className="p-1 rounded-lg bg-stone-200/70 border border-[#E5E4DE] flex items-center text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            Active Ledger ({activeLoans.length})
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'issue'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            <span>Issue Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            History Archive ({returnedLoans.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE LOANS LEDGER */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-md border border-[#E5E4DE] shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9287] stroke-[1.75]" />
              <input
                type="text"
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                placeholder="Search active loan by book title, student name, matric..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] hover:bg-[#F2F0E8] focus:bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer"
              >
                <option value="all">All Active Statuses ({activeLoans.length})</option>
                <option value="active">On Schedule ({activeLoans.filter((l) => l.status === 'Active').length})</option>
                <option value="overdue">Overdue Late ({stats.overdueLoansCount})</option>
              </select>

              <button
                onClick={() => setActiveTab('issue')}
                className="px-3 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Issue Book</span>
              </button>
            </div>
          </div>

          {/* Active Loans Table */}
          {filteredActiveLoans.length === 0 ? (
            <div className="bg-white rounded-md border border-[#E5E4DE] p-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#245747] mx-auto mb-2 stroke-[1.75]" />
              <h3 className="font-serif text-base font-semibold text-[#202721]">
                No Loans Found
              </h3>
              <p className="text-xs text-[#5A6258] mt-1 max-w-sm mx-auto">
                No active loans currently match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F2] border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                      <th className="py-2.5 px-4 font-semibold">Borrowed Book</th>
                      <th className="py-2.5 px-4 font-semibold">Student Borrower</th>
                      <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                      <th className="py-2.5 px-4 font-semibold">Due Date</th>
                      <th className="py-2.5 px-4 font-semibold">Status / Fines</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Circulation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E4DE]">
                    {filteredActiveLoans.map((loan) => {
                      const isOverdue = loan.status === 'Overdue';

                      return (
                        <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                          {/* Book */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-serif font-medium text-sm text-[#202721] line-clamp-1">
                              {loan.bookTitle}
                            </div>
                            <div className="text-[10px] font-mono text-[#5A6258] mt-0.5">
                              {loan.courseCode || 'COM'} · ISBN: {loan.bookIsbn}
                            </div>
                          </td>

                          {/* Student */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#202721]">
                              {loan.studentName}
                            </div>
                            <div className="text-[11px] font-mono text-[#5A6258] mt-0.5">
                              {loan.studentMatricNo} ({loan.studentLevel})
                            </div>
                          </td>

                          {/* Issue Date */}
                          <td className="py-3 px-4 font-mono text-[11px] text-[#5A6258]">
                            {loan.issueDate}
                          </td>

                          {/* Due Date */}
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className={isOverdue ? 'text-rose-700 font-semibold' : 'text-[#202721]'}>
                              {loan.dueDate}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {isOverdue ? (
                              <div>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  Overdue Late
                                </span>
                                <div className="text-[11px] font-mono text-rose-700 font-medium mt-0.5">
                                  Fine: ₦{loan.fineAmount}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                                Active on Loan
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => renewLoan(loan.id)}
                                title="Renew loan for 14 additional days"
                                className="px-2 py-1 text-[11px] font-medium text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded border border-[#E5E4DE] transition-colors"
                              >
                                Renew +14d
                              </button>

                              <button
                                onClick={() => setReturningLoan(loan)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded shadow-2xs transition-colors"
                              >
                                Check In
                              </button>

                              <button
                                onClick={() => setReceiptLoan(loan)}
                                title="Print circulation checkout slip"
                                className="p-1 text-stone-400 hover:text-stone-700 rounded"
                              >
                                <Printer className="w-3.5 h-3.5 stroke-[1.75]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STRUCTURED ISSUE BOOK DESK */}
      {activeTab === 'issue' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleIssueSubmit} className="space-y-6">
            {/* Step 1: Select Student Reader */}
            <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DE]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245747] text-white text-[11px] font-mono font-semibold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-serif text-base font-semibold text-[#202721]">
                    Select Student Reader
                  </h3>
                </div>
                {currentStudent && (
                  <span className="text-xs font-mono text-[#245747] font-medium">
                    Verified: {currentStudent.matricNo}
                  </span>
                )}
              </div>

              {/* Student Search & Quick Select */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Type to filter student name or matriculation number..."
                  className="w-full px-3 py-1.5 text-xs bg-[#F7F6F2] text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#E5E4DE] rounded-md">
                  {filteredStudentPicker.map((student) => {
                    const studentLoans = loans.filter(
                      (l) => l.studentId === student.id && (l.status === 'Active' || l.status === 'Overdue')
                    );
                    const isSelected = selectedStudentId === student.id;
                    const hasOverdue = studentLoans.some((l) => l.status === 'Overdue');
                    const isFull = studentLoans.length >= INSTITUTION_INFO.maxBorrowLimit;

                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => setSelectedStudentId(student.id)}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                          isSelected
                            ? 'bg-[#EAF0EC] border-[#245747] shadow-2xs'
                            : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#202721]">
                            {student.fullName}
                          </span>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-stone-100 text-stone-700">
                            {student.level}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#5A6258] mt-0.5">
                          {student.matricNo}
                        </div>
                        <div className="text-[10px] text-[#8A9287] mt-1 flex items-center justify-between">
                          <span>Quota: {studentLoans.length}/{INSTITUTION_INFO.maxBorrowLimit}</span>
                          {hasOverdue ? (
                            <span className="text-rose-700 font-semibold">Overdue active</span>
                          ) : isFull ? (
                            <span className="text-amber-700 font-semibold">Quota reached</span>
                          ) : (
                            <span className="text-[#245747]">Eligible</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student Eligibility Diagnostics Banner */}
              {currentStudent && (
                <div className={`p-3 rounded-md text-xs border ${
                  studentHasOverdue || studentAtLimit || isStudentSuspended
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-[#EAF0EC] border-[#245747]/20 text-[#1B4236]'
                }`}>
                  <div className="font-semibold">
                    {studentHasOverdue
                      ? 'Borrower Restriction: Outstanding overdue book'
                      : studentAtLimit
                      ? `Quota Reached: Already has ${studentCurrentLoans.length} books borrowed (maximum limit: ${INSTITUTION_INFO.maxBorrowLimit})`
                      : isStudentSuspended
                      ? 'Account Suspended: Reader account deactivated by librarian'
                      : `Eligible: May borrow up to ${INSTITUTION_INFO.maxBorrowLimit - studentCurrentLoans.length} more book(s)`}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Available Book */}
            <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DE]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#245747] text-white text-[11px] font-mono font-semibold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-serif text-base font-semibold text-[#202721]">
                    Select Curriculum Textbook
                  </h3>
                </div>
                {currentBook && (
                  <span className="text-xs font-mono text-[#245747] font-medium">
                    Stock: {currentBook.availableCopies} available
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Type to filter textbook title, course code (e.g. COM 211), ISBN..."
                  className="w-full px-3 py-1.5 text-xs bg-[#F7F6F2] text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#E5E4DE] rounded-md">
                  {filteredBookPicker.map((book) => {
                    const isSelected = selectedBookId === book.id;
                    const isAvailable = book.availableCopies > 0;

                    return (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => setSelectedBookId(book.id)}
                        disabled={!isAvailable}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                          isSelected
                            ? 'bg-[#EAF0EC] border-[#245747] shadow-2xs'
                            : !isAvailable
                            ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                            : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
                        }`}
                      >
                        <div className="font-serif font-medium text-xs text-[#202721] line-clamp-1">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-[#5A6258] mt-0.5 flex items-center justify-between">
                          <span>{book.author}</span>
                          <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-stone-100 text-stone-700">
                            {book.courseCode || 'COM'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8A9287] font-mono mt-1 flex items-center justify-between">
                          <span>{book.shelfLocation}</span>
                          <span className={isAvailable ? 'text-[#245747] font-medium' : 'text-rose-700'}>
                            {book.availableCopies}/{book.totalCopies} in stock
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Loan Parameters */}
            <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E5E4DE]">
                <span className="w-5 h-5 rounded-full bg-[#245747] text-white text-[11px] font-mono font-semibold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  Loan Duration & Schedule
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDurationDays(7)}
                  className={`p-3 rounded-md border text-center transition-all ${
                    durationDays === 7
                      ? 'bg-[#EAF0EC] border-[#245747] text-[#1B4236] font-semibold'
                      : 'bg-white border-[#E5E4DE] text-[#202721] hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs">Short Loan</div>
                  <div className="font-mono text-sm font-semibold mt-0.5">7 Days</div>
                  <div className="text-[10px] text-[#5A6258] mt-0.5">Due: {addDays(SYSTEM_CURRENT_DATE, 7)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationDays(14)}
                  className={`p-3 rounded-md border text-center transition-all ${
                    durationDays === 14
                      ? 'bg-[#EAF0EC] border-[#245747] text-[#1B4236] font-semibold'
                      : 'bg-white border-[#E5E4DE] text-[#202721] hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs">Standard Term</div>
                  <div className="font-mono text-sm font-semibold mt-0.5">14 Days</div>
                  <div className="text-[10px] text-[#5A6258] mt-0.5">Due: {addDays(SYSTEM_CURRENT_DATE, 14)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDurationDays(21)}
                  className={`p-3 rounded-md border text-center transition-all ${
                    durationDays === 21
                      ? 'bg-[#EAF0EC] border-[#245747] text-[#1B4236] font-semibold'
                      : 'bg-white border-[#E5E4DE] text-[#202721] hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs">Monograph / Project</div>
                  <div className="font-mono text-sm font-semibold mt-0.5">21 Days</div>
                  <div className="text-[10px] text-[#5A6258] mt-0.5">Due: {addDays(SYSTEM_CURRENT_DATE, 21)}</div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Circulation Officer Notes (Optional)
                </label>
                <input
                  type="text"
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. For ND II COM 222 lab practicals"
                  className="w-full px-3 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747]"
                />
              </div>

              {/* Final Confirmation and Action */}
              <div className="pt-3 border-t border-[#E5E4DE] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#5A6258]">
                  <span>Circulation Reference: </span>
                  <span className="font-mono font-medium text-[#202721]">{SYSTEM_CURRENT_DATE}</span>
                  <span className="mx-2">·</span>
                  <span>Due: </span>
                  <span className="font-mono font-semibold text-[#245747]">{addDays(SYSTEM_CURRENT_DATE, durationDays)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('active')}
                    className="px-3.5 py-2 text-xs text-[#5A6258] hover:text-[#202721] rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canIssue}
                    className="px-5 py-2 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>Confirm & Issue Book</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: RETURNED HISTORY ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F6F2] border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                    <th className="py-2.5 px-4 font-semibold">Book Title</th>
                    <th className="py-2.5 px-4 font-semibold">Student Reader</th>
                    <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                    <th className="py-2.5 px-4 font-semibold">Return Date</th>
                    <th className="py-2.5 px-4 font-semibold">Issued By</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E4DE]">
                  {filteredReturnedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-2.5 px-4 max-w-xs font-serif text-[#202721] line-clamp-1">
                        {loan.bookTitle}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-[#202721]">{loan.studentName}</div>
                        <div className="text-[10px] font-mono text-[#5A6258]">{loan.studentMatricNo}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#5A6258]">{loan.issueDate}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#245747] font-medium">{loan.returnDate || SYSTEM_CURRENT_DATE}</td>
                      <td className="py-2.5 px-4 text-[#5A6258]">{loan.issuedBy}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
                          Returned & Archived
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal with Fine Settlement */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A9287]">
                  Circulation Return Desk
                </span>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  Check In Library Material
                </h3>
              </div>
              <button
                onClick={() => setReturningLoan(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Textbook Title</span>
                <span className="font-serif font-medium text-sm text-[#202721]">{returningLoan.bookTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#E5E4DE]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Borrower</span>
                  <span className="text-[#202721] font-medium">{returningLoan.studentName}</span>
                  <div className="text-[10px] font-mono text-[#5A6258]">{returningLoan.studentMatricNo}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Due Schedule</span>
                  <span className="text-[#202721] font-mono">{returningLoan.dueDate}</span>
                  <div className="text-[10px] text-[#5A6258]">Check-in: {SYSTEM_CURRENT_DATE}</div>
                </div>
              </div>

              {/* Overdue fine check */}
              {returningLoan.status === 'Overdue' && (
                <div className="p-3 bg-rose-50 rounded-md border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
                    <span>Overdue Default Fine: ₦{returningLoan.fineAmount}</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    This book was due on {returningLoan.dueDate}. Fine accrued at standard ₦{INSTITUTION_INFO.dailyFineRate}/day rate.
                  </p>
                  <label className="flex items-center gap-2 text-xs text-rose-900 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={finePaidCheck}
                      onChange={(e) => setFinePaidCheck(e.target.checked)}
                      className="rounded text-[#245747]"
                    />
                    <span>Mark fine as settled / paid in full</span>
                  </label>
                </div>
              )}

              <p className="text-[11px] text-[#5A6258]">
                Returning this book will automatically increment available shelf stock and release the student's borrowing quota.
              </p>
            </div>

            <div className="p-3 border-t border-[#E5E4DE] bg-stone-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturningLoan(null)}
                className="px-3 py-1.5 text-xs text-[#5A6258] hover:text-[#202721]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Return & Shelve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circulation Checkout Receipt Slip Modal */}
      {receiptLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-sm w-full overflow-hidden p-6 font-mono text-xs space-y-4">
            <div className="text-center border-b border-dashed border-stone-300 pb-3">
              <div className="font-bold text-sm tracking-tight font-serif">{INSTITUTION_INFO.name}</div>
              <div className="text-[10px] text-stone-500 uppercase">{INSTITUTION_INFO.department}</div>
              <div className="text-[10px] text-stone-500">Circulation Checkout Slip</div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Loan Slip ID:</span>
                <span className="font-semibold">{receiptLoan.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Matric No:</span>
                <span className="font-semibold">{receiptLoan.studentMatricNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Borrower:</span>
                <span>{receiptLoan.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Issue Date:</span>
                <span>{receiptLoan.issueDate}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-stone-300 pt-1.5">
                <span className="text-stone-900 font-bold">DUE DATE:</span>
                <span className="font-bold text-[#245747]">{receiptLoan.dueDate}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-3">
              <div className="text-[10px] text-stone-500">Item Checked Out:</div>
              <div className="font-medium text-[#202721] text-xs mt-0.5">{receiptLoan.bookTitle}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">ISBN: {receiptLoan.bookIsbn}</div>
            </div>

            <div className="text-center border-t border-dashed border-stone-300 pt-3 text-[10px] text-stone-500">
              Please return on or before due date. Overdue fines accrue at ₦50 per diem.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setReceiptLoan(null)}
                className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded font-sans"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
