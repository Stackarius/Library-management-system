import React, { useState, useRef, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { INSTITUTION_INFO } from '../../data/seedData';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  User,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile, onOpenSearch }) => {
  const {
    activePage,
    setActivePage,
    currentUser,
    isAdmin,
    isStudent,
    logout,
    loans,
    resetToDefaultData,
  } = useLibrary();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const overdueLoans = loans.filter((l) => l.status === 'Overdue');

  const pageTitles: Record<string, { title: string; subtitle: string; category: string }> = {
    dashboard: {
      category: 'Overview',
      title: 'Circulation & Operations',
      subtitle: 'Departmental library throughput & status ledger',
    },
    books: {
      category: 'Collection',
      title: 'Course Textbooks & Monographs',
      subtitle: 'Curriculum texts, shelf classifications, and stock status',
    },
    students: {
      category: 'Community',
      title: 'Student Reader Directory',
      subtitle: 'Registered ND I and ND II student borrower profiles',
    },
    circulation: {
      category: 'Circulation',
      title: 'Issue & Returns Desk',
      subtitle: 'Book loans, return processing, renewals, and overdue fines',
    },
    reports: {
      category: 'Insights',
      title: 'Audit & Circulation Reports',
      subtitle: 'Departmental circulation ledgers and official audit sheets',
    },
    'student-portal': {
      category: 'Student Portal',
      title: 'Active Loans & Renewals',
      subtitle: 'Your borrowed materials, due dates, and fine accounts',
    },
    'student-catalog': {
      category: 'Student Portal',
      title: 'Departmental Catalogue (OPAC)',
      subtitle: 'Search and check availability of Computer Science books',
    },
    'student-id': {
      category: 'Student Portal',
      title: 'Digital Library Card',
      subtitle: 'Official Federal Polytechnic Ede student credential',
    },
  };

  const currentInfo = pageTitles[activePage] || {
    category: 'Operations',
    title: 'Computer Science Library',
    subtitle: 'Federal Polytechnic Ede',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-[#E5E4DE] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 text-[#5A6258] hover:text-[#202721] rounded-md hover:bg-stone-200/50 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 stroke-[1.75]" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#5A6258] truncate">
            <span className="font-medium text-[#202721]">{INSTITUTION_INFO.shortName}</span>
            <span className="text-stone-300">/</span>
            <span className="hidden sm:inline">Computer Science</span>
            <span className="hidden sm:inline text-stone-300">/</span>
            <span className="text-[#245747] font-medium">
              {isAdmin ? currentInfo.category : 'Student Portal'}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-[#202721] tracking-tight truncate flex items-center gap-2">
            <span>{currentInfo.title}</span>
          </h1>
        </div>
      </div>

      {/* Zone 2: Global Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1 text-xs text-[#5A6258] bg-[#F2F0E8] hover:bg-[#EAE7DC] rounded-md border border-[#E5E4DE] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#5A6258] stroke-[1.75]" />
          <span className="hidden md:inline">
            {isAdmin ? 'Search collection or students...' : 'Search OPAC catalogue...'}
          </span>
          <span className="md:hidden">Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono text-[#5A6258] bg-white rounded border border-[#E5E4DE]">
            /
          </kbd>
        </button>

        {/* Notifications Dropdown (Overdue circulation alerts) */}
        {isAdmin && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-1.5 text-[#5A6258] hover:text-[#202721] hover:bg-stone-200/50 rounded-md transition-colors"
              title="Overdue circulation alerts"
              aria-label="Circulation notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.75]" />
              {overdueLoans.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-[#E5E4DE] overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#202721]">
                      Overdue Loans ({overdueLoans.length})
                    </h4>
                    <p className="text-[11px] text-[#5A6258]">
                      Pending returns requiring circulation action
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('circulation');
                      setNotifDropdownOpen(false);
                    }}
                    className="text-xs font-medium text-[#245747] hover:underline"
                  >
                    Open Desk
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E4DE]">
                  {overdueLoans.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#5A6258]">
                      All active loans are on schedule. No overdue books.
                    </div>
                  ) : (
                    overdueLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="p-3 hover:bg-stone-50 transition-colors flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[1.75]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#202721] truncate">
                            {loan.bookTitle}
                          </p>
                          <p className="text-[11px] text-[#5A6258] mt-0.5">
                            Borrower: <span className="text-[#202721]">{loan.studentName}</span> ({loan.studentMatricNo})
                          </p>
                          <p className="text-[11px] text-rose-700 font-mono mt-0.5 font-medium">
                            Due: {loan.dueDate} · Fine: ₦{loan.fineAmount}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zone 3: User Profile Menu with Persona Switcher */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-md border border-[#E5E4DE] bg-white hover:bg-stone-50 transition-colors text-left shadow-2xs"
          >
            <div className="w-6 h-6 rounded bg-[#245747] text-white font-medium text-xs flex items-center justify-center shrink-0">
              {currentUser?.avatarInitials || 'FP'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-[#202721] leading-tight truncate max-w-[120px]">
                {currentUser?.name || 'User'}
              </div>
              <div className="text-[10px] text-[#5A6258] leading-tight truncate">
                {currentUser?.role}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#5A6258] hidden sm:block stroke-[1.75]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[#E5E4DE] overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-3 bg-[#F7F6F2] border-b border-[#E5E4DE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#202721]">
                    {currentUser?.name}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20 uppercase">
                    {currentUser?.role}
                  </span>
                </div>
                <div className="text-[11px] text-[#5A6258] font-mono mt-0.5">
                  ID: {currentUser?.staffOrMatricId}
                </div>
                <div className="text-[10px] text-[#8A9287]">
                  {INSTITUTION_INFO.shortName} · {INSTITUTION_INFO.department}
                </div>
              </div>

              <div className="p-3 text-xs text-[#5A6258] space-y-1.5 border-b border-[#E5E4DE]">
                <div className="flex justify-between items-center">
                  <span>Authorized Role:</span>
                  <span className="font-semibold text-[#202721] font-mono">
                    {currentUser?.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Institution ID:</span>
                  <span className="font-mono text-[#202721]">
                    {currentUser?.staffOrMatricId}
                  </span>
                </div>
                {isStudent && currentUser?.level && (
                  <div className="flex justify-between items-center">
                    <span>Academic Cohort:</span>
                    <span className="font-mono text-[#202721]">{currentUser.level}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Scope of Study:</span>
                  <span className="text-[#202721]">Computer Science</span>
                </div>
              </div>

              <div className="p-2 space-y-0.5">
                {isAdmin && (
                  <button
                    onClick={() => {
                      resetToDefaultData();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded-md flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                    <span>Restore Benchmark Dataset</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-md flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
