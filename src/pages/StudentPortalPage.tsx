import React, { useState } from 'react';
import { useLibrary, SYSTEM_CURRENT_DATE, getDaysDiff } from '../context/LibraryContext';
import { INSTITUTION_INFO } from '../data/seedData';
import { Book, LoanRecord } from '../types/library';
import {
  BookOpen,
  Calendar,
  Clock,
  RotateCw,
  Search,
  CreditCard,
  History,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  MapPin,
  Barcode,
  School,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  QrCode,
  GraduationCap,
} from 'lucide-react';

export const StudentPortalPage: React.FC = () => {
  const {
    books,
    currentUser,
    currentStudentProfile,
    myLoans,
    renewLoan,
    reserveBook,
    activePage,
    setActivePage,
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<'my_loans' | 'opac' | 'id_card' | 'history'>('my_loans');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');

  React.useEffect(() => {
    if (activePage === 'student-catalog') setActiveTab('opac');
    else if (activePage === 'student-id') setActiveTab('id_card');
    else if (activePage === 'student-portal') setActiveTab('my_loans');
  }, [activePage]);

  const handleTabSelect = (tab: 'my_loans' | 'opac' | 'id_card' | 'history') => {
    setActiveTab(tab);
    if (tab === 'my_loans') setActivePage('student-portal');
    else if (tab === 'opac') setActivePage('student-catalog');
    else if (tab === 'id_card') setActivePage('student-id');
  };

  const myActiveLoans = myLoans.filter((l) => l.status === 'Active' || l.status === 'Overdue');
  const myReturnedLoans = myLoans.filter((l) => l.status === 'Returned');
  const totalFineAccrued = myActiveLoans.reduce((sum, l) => sum + (l.finePaid ? 0 : l.fineAmount), 0);
  const isClearedForExam = myActiveLoans.length === 0 && totalFineAccrued === 0;

  // Filter OPAC catalog
  const filteredCatalog = books.filter((b) => {
    const q = catalogQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      (b.courseCode && b.courseCode.toLowerCase().includes(q)) ||
      b.shelfLocation.toLowerCase().includes(q);

    const matchesCourse =
      courseFilter === 'All Courses' || b.courseCode === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const availableCourses = [
    'All Courses',
    'COM 111',
    'COM 112',
    'COM 113',
    'COM 211',
    'COM 212',
    'COM 213',
    'COM 221',
    'COM 222',
    'COM 224',
    'COM 225',
    'COM 226',
    'COM 299',
    'GNS 201',
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            Student Reader Desk · Federal Polytechnic Ede
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#202721] tracking-tight mt-1">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[#202721] font-medium">
              Matric: {currentStudentProfile?.matricNo || currentUser?.staffOrMatricId}
            </span>
            <span>·</span>
            <span>Department of Computer Science</span>
            <span>·</span>
            <span className="font-mono">{currentStudentProfile?.level || currentUser?.level || 'ND II'}</span>
          </p>
        </div>

        {/* Tab switchers */}
        <div className="p-1 rounded-lg bg-stone-200/70 border border-[#E5E4DE] flex items-center text-xs self-start sm:self-auto">
          <button
            onClick={() => handleTabSelect('my_loans')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'my_loans'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            My Loans ({myActiveLoans.length})
          </button>
          <button
            onClick={() => handleTabSelect('opac')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'opac'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            Browse OPAC
          </button>
          <button
            onClick={() => handleTabSelect('id_card')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'id_card'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={() => handleTabSelect('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                : 'text-[#5A6258] hover:text-[#202721]'
            }`}
          >
            Loan History
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-md border border-[#E5E4DE] shadow-2xs">
          <div className="text-[11px] font-mono uppercase text-[#8A9287]">Active Loans</div>
          <div className="text-2xl font-semibold font-mono text-[#202721] mt-1">
            {myActiveLoans.length}
          </div>
          <div className="text-[11px] text-[#5A6258] mt-0.5">
            Quota: {myActiveLoans.length}/{INSTITUTION_INFO.maxBorrowLimit} books borrowed
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-[#E5E4DE] shadow-2xs">
          <div className="text-[11px] font-mono uppercase text-[#8A9287]">Due Soon</div>
          <div className="text-2xl font-semibold font-mono text-[#245747] mt-1">
            {myActiveLoans.filter((l) => l.status === 'Active').length}
          </div>
          <div className="text-[11px] text-[#5A6258] mt-0.5">
            Return on or before due date
          </div>
        </div>

        <div className={`p-4 rounded-md border shadow-2xs ${
          totalFineAccrued > 0 ? 'bg-white border-rose-200' : 'bg-white border-[#E5E4DE]'
        }`}>
          <div className="text-[11px] font-mono uppercase text-[#8A9287]">Overdue Fines</div>
          <div className={`text-2xl font-semibold font-mono mt-1 ${
            totalFineAccrued > 0 ? 'text-rose-700' : 'text-[#202721]'
          }`}>
            ₦{totalFineAccrued}
          </div>
          <div className="text-[11px] text-[#5A6258] mt-0.5">
            Rate: ₦{INSTITUTION_INFO.dailyFineRate}/day overdue
          </div>
        </div>

        <div className={`p-4 rounded-md border shadow-2xs ${
          isClearedForExam
            ? 'bg-[#EAF0EC] border-[#245747]/20 text-[#1B4236]'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider">Exam Clearance</div>
          <div className="text-base font-semibold mt-1 flex items-center gap-1.5">
            {isClearedForExam ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#245747] stroke-[1.75]" />
                <span>CLEARED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600 stroke-[1.75]" />
                <span>HOLD ACTIVE</span>
              </>
            )}
          </div>
          <div className="text-[11px] mt-0.5 opacity-90">
            {isClearedForExam ? 'Eligible for semester exams' : 'Return items before clearance'}
          </div>
        </div>
      </div>

      {/* TAB 1: MY ACTIVE LOANS */}
      {activeTab === 'my_loans' && (
        <div className="space-y-4">
          <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
            <div className="p-4 bg-[#F7F6F2] border-b border-[#E5E4DE] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  My Borrowed Books & Due Dates
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Textbooks currently in your custody from the departmental library
                </p>
              </div>
              <span className="text-xs font-mono text-[#5A6258]">
                Reference: {SYSTEM_CURRENT_DATE}
              </span>
            </div>

            {myActiveLoans.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5A6258]">
                <CheckCircle2 className="w-8 h-8 text-[#245747] mx-auto mb-2 stroke-[1.75]" />
                <h4 className="font-serif text-sm font-semibold text-[#202721]">
                  No Active Borrowed Books
                </h4>
                <p className="mt-1 max-w-sm mx-auto">
                  You do not currently have any books checked out. Browse the OPAC catalog to find materials for your courses.
                </p>
                <button
                  onClick={() => setActiveTab('opac')}
                  className="mt-4 px-3.5 py-1.5 text-xs font-medium bg-[#245747] text-white rounded-md"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E4DE]">
                {myActiveLoans.map((loan) => {
                  const isOverdue = loan.status === 'Overdue';
                  const daysDiff = getDaysDiff(SYSTEM_CURRENT_DATE, loan.dueDate);

                  return (
                    <div key={loan.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                            {loan.courseCode || 'COM'}
                          </span>
                          <span className="text-[10px] font-mono text-[#8A9287]">
                            Loan ID: {loan.id}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-medium text-[#202721]">
                          {loan.bookTitle}
                        </h4>

                        <div className="text-xs text-[#5A6258] flex flex-wrap items-center gap-3 font-mono">
                          <span>Issued: {loan.issueDate}</span>
                          <span>·</span>
                          <span className={isOverdue ? 'text-rose-700 font-semibold' : 'text-[#245747] font-medium'}>
                            Due: {loan.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="text-rose-700 font-semibold">
                              (Late by {Math.abs(daysDiff)} days · Fine: ₦{loan.fineAmount})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => renewLoan(loan.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-[#202721] rounded-md border border-[#E5E4DE] shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                          <span>Request Renewal (+14d)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OPAC CATALOGUE */}
      {activeTab === 'opac' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-md border border-[#E5E4DE] shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9287] stroke-[1.75]" />
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Search Computer Science books, authors, ISBN..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] hover:bg-[#F2F0E8] focus:bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747]"
              />
            </div>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer font-mono"
            >
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((book) => {
              const isAvailable = book.availableCopies > 0;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5E4DE]">
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {book.courseCode || 'COM'}
                      </span>
                      <span className="text-[11px] font-mono text-[#5A6258] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#245747] stroke-[1.75]" />
                        <span>{book.shelfLocation}</span>
                      </span>
                    </div>

                    <h4 className="font-serif font-medium text-sm text-[#202721] mt-2 line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#5A6258] mt-0.5">
                      {book.author} · {book.publicationYear}
                    </p>
                    <div className="text-[10px] text-[#8A9287] font-mono mt-2">
                      Call: {book.callNumber}
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#E5E4DE] flex items-center justify-between">
                    <div>
                      <span className={`font-mono text-xs font-semibold ${
                        isAvailable ? 'text-[#245747]' : 'text-rose-700'
                      }`}>
                        {book.availableCopies} available
                      </span>
                    </div>

                    <button
                      onClick={() => reserveBook(book.id)}
                      disabled={!isAvailable}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Reserve at Desk
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL STUDENT LIBRARY ID CARD */}
      {activeTab === 'id_card' && (
        <div className="flex justify-center py-6">
          <div className="max-w-md w-full bg-white rounded-xl border border-[#E5E4DE] shadow-lg overflow-hidden">
            {/* Card Header with Crest */}
            <div className="bg-[#245747] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white">
                  <School className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold tracking-tight uppercase">
                    {INSTITUTION_INFO.name}
                  </h3>
                  <p className="text-[10px] text-emerald-100 uppercase tracking-wider">
                    {INSTITUTION_INFO.department}
                  </p>
                  <p className="text-[9px] text-emerald-200/80">
                    Student Library Borrower Credential
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5 bg-[#FBFBFA]">
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 rounded bg-stone-200 border border-stone-300 flex flex-col items-center justify-center text-stone-500 shrink-0">
                  <GraduationCap className="w-8 h-8 text-stone-400 stroke-[1.5]" />
                  <span className="text-[9px] font-mono mt-1 uppercase text-stone-500">Student</span>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1 text-xs">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#8A9287] block">Full Name</span>
                    <span className="font-semibold text-sm text-[#202721] block truncate">
                      {currentUser?.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase text-[#8A9287] block">Matriculation Number</span>
                    <span className="font-mono font-bold text-xs text-[#245747] block">
                      {currentStudentProfile?.matricNo || currentUser?.staffOrMatricId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-[#8A9287] block">Level</span>
                      <span className="font-mono text-[#202721] font-medium">
                        {currentStudentProfile?.level || currentUser?.level || 'ND II'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-[#8A9287] block">Session</span>
                      <span className="text-[#202721]">{INSTITUTION_INFO.academicSession}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="p-3 bg-white rounded border border-[#E5E4DE] text-center space-y-1">
                <div className="font-mono text-[10px] text-[#8A9287] tracking-widest">
                  || | ||| || |||| | ||||| ||| || ||| || |||
                </div>
                <div className="text-[10px] font-mono text-[#5A6258]">
                  ID: {currentStudentProfile?.matricNo || currentUser?.staffOrMatricId} · VERIFIED ACTIVE
                </div>
              </div>

              <div className="text-[10px] text-[#8A9287] text-center leading-relaxed">
                This credential authorizes textbook loans at the Computer Science Departmental Library desk, Federal Polytechnic Ede. Non-transferable.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOAN HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
          <div className="p-4 bg-[#F7F6F2] border-b border-[#E5E4DE]">
            <h3 className="font-serif text-base font-semibold text-[#202721]">
              My Circulation History Archive
            </h3>
            <p className="text-xs text-[#5A6258]">
              Completed returns and past borrowing transactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                  <th className="py-2.5 px-4 font-semibold">Textbook Title</th>
                  <th className="py-2.5 px-4 font-semibold">Course Code</th>
                  <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                  <th className="py-2.5 px-4 font-semibold">Returned Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {myReturnedLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#5A6258]">
                      No historical returns archived for this account.
                    </td>
                  </tr>
                ) : (
                  myReturnedLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-serif text-[#202721]">{l.bookTitle}</td>
                      <td className="py-2.5 px-4 font-mono">{l.courseCode || 'COM'}</td>
                      <td className="py-2.5 px-4 font-mono text-[#5A6258]">{l.issueDate}</td>
                      <td className="py-2.5 px-4 font-mono text-[#245747] font-medium">{l.returnDate}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          Returned
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
