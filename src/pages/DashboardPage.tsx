import React, { useState } from 'react';
import { useLibrary, SYSTEM_CURRENT_DATE } from '../context/LibraryContext';
import { INSTITUTION_INFO } from '../data/seedData';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  Layers,
  PlusCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  UserCheck,
  TrendingUp,
  Bookmark,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onIssueNewBook: () => void;
  onAddNewBook: () => void;
  onAddStudent: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onIssueNewBook,
  onAddNewBook,
  onAddStudent,
}) => {
  const {
    books,
    students,
    loans,
    currentUser,
    stats,
    setActivePage,
    returnBook,
    renewLoan,
  } = useLibrary();

  const overdueList = loans.filter((l) => l.status === 'Overdue');
  const recentLoans = loans.slice(0, 7);

  // Category holdings breakdown
  const categoryMap: Record<string, { total: number; available: number }> = {};
  books.forEach((b) => {
    if (!categoryMap[b.category]) {
      categoryMap[b.category] = { total: 0, available: 0 };
    }
    categoryMap[b.category].total += b.totalCopies;
    categoryMap[b.category].available += b.availableCopies;
  });

  const categoryEntries = Object.entries(categoryMap).slice(0, 6);
  const maxCategoryCopies = Math.max(...categoryEntries.map(([, data]) => data.total), 1);

  // Weekly circulation throughput data (Mon - Fri)
  const weeklyThroughput = [
    { day: 'Mon', issues: 14, returns: 11, total: 25 },
    { day: 'Tue', issues: 19, returns: 16, total: 35 },
    { day: 'Wed', issues: 24, returns: 19, total: 43 },
    { day: 'Thu', issues: 18, returns: 15, total: 33 },
    { day: 'Fri', issues: 22, returns: 20, total: 42 },
  ];
  const maxWeekly = Math.max(...weeklyThroughput.map((w) => w.total));

  // Utilization calculation
  const collectionUtilization = Math.round(
    (stats.activeLoansCount / (stats.totalPhysicalBooks || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Top Editorial Header & Operational Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            <span>{INSTITUTION_INFO.shortName}</span>
            <span className="text-stone-300">·</span>
            <span>{INSTITUTION_INFO.department}</span>
            <span className="text-stone-300">·</span>
            <span className="text-[#245747] font-semibold">{INSTITUTION_INFO.academicSession}</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-[#202721] tracking-tight mt-1">
            Operations & Circulation Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1 max-w-2xl leading-relaxed">
            Departmental library status ledger. Operating as{' '}
            <span className="font-medium text-[#202721]">{currentUser?.name}</span> ({currentUser?.role})
          </p>
        </div>

        {/* Primary and secondary operational actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onIssueNewBook}
            className="px-3.5 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={onAddNewBook}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-[#202721] rounded-md border border-[#E5E4DE] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            <span>Add Book</span>
          </button>
          <button
            onClick={onAddStudent}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-[#202721] rounded-md border border-[#E5E4DE] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Institutional Reference Bar */}
      <div className="bg-white rounded-lg border border-[#E5E4DE] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A6258]">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            <span>System Date: <strong className="text-[#202721] font-semibold">{SYSTEM_CURRENT_DATE}</strong></span>
          </div>
          <span className="text-stone-300">|</span>
          <div>
            Semester: <strong className="text-[#202721] font-semibold">{INSTITUTION_INFO.semester}</strong>
          </div>
        </div>
        <div className="text-[11px] font-mono flex items-center gap-3">
          <div>
            Standard Fine: <strong className="text-[#202721]">₦{INSTITUTION_INFO.dailyFineRate}/day</strong>
          </div>
          <span className="text-stone-300">|</span>
          <div>
            Borrower Quota: <strong className="text-[#202721]">{INSTITUTION_INFO.maxBorrowLimit} books max</strong>
          </div>
        </div>
      </div>

      {/* Asymmetric High-Hierarchy Metrics Section (Replaces repetitive 5-box card grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Focal Module: Real-time Circulation Throughput & Health */}
        <div className="lg:col-span-5 bg-[#202721] text-white rounded-lg p-5 flex flex-col justify-between border border-[#202721] shadow-2xs relative overflow-hidden">
          {/* Subtle watermark grid */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-stone-300">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-300">
                Active Circulation Pulse
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#245747]/80 text-emerald-200 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Desk
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight text-white tabular-nums">
                {stats.activeLoansCount}
              </div>
              <div className="text-xs text-stone-300">
                curriculum books currently in circulation
              </div>
            </div>

            {/* Collection Utilization Progress */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Holdings Utilization</span>
                <span className="font-mono text-white font-medium">{collectionUtilization}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(collectionUtilization, 100)}%` }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-stone-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-400">Total Physical Volumes</div>
              <div className="font-mono text-stone-100 font-medium text-sm mt-0.5">
                {stats.totalPhysicalBooks} copies
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-400">Turnaround Rate</div>
              <div className="font-mono text-emerald-300 font-medium text-sm mt-0.5">
                85.4% on-time
              </div>
            </div>
          </div>
        </div>

        {/* 4 Secondary Operations Metric Tiles (2x2 Grid) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3">
          {/* Catalog Titles */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E4DE] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#5A6258] mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Catalog Titles</span>
              <BookOpen className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#202721] font-mono tabular-nums">
                {stats.totalTitles}
              </div>
              <div className="text-[11px] text-[#5A6258] mt-1 flex items-center justify-between">
                <span>COM 111 – COM 299</span>
                <button
                  onClick={() => setActivePage('books')}
                  className="text-[#245747] font-medium hover:underline text-[11px]"
                >
                  View catalogue →
                </button>
              </div>
            </div>
          </div>

          {/* Immediate Availability */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E4DE] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#5A6258] mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Ready on Shelves</span>
              <Layers className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#202721] font-mono tabular-nums">
                {stats.availableCopiesTotal}
              </div>
              <div className="text-[11px] text-[#245747] font-medium mt-1">
                Available for instant checkout
              </div>
            </div>
          </div>

          {/* Overdue Attention */}
          <div className={`p-4 rounded-lg border shadow-2xs flex flex-col justify-between ${
            stats.overdueLoansCount > 0
              ? 'bg-[#FDF8F7] border-rose-200'
              : 'bg-white border-[#E5E4DE]'
          }`}>
            <div className="flex items-center justify-between text-[#5A6258] mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Overdue Loans</span>
              <AlertTriangle className={`w-3.5 h-3.5 stroke-[1.75] ${
                stats.overdueLoansCount > 0 ? 'text-rose-600' : 'text-[#5A6258]'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-semibold font-mono tabular-nums ${
                stats.overdueLoansCount > 0 ? 'text-rose-700' : 'text-[#202721]'
              }`}>
                {stats.overdueLoansCount}
              </div>
              <div className="text-[11px] text-rose-700 font-mono mt-1 font-medium flex items-center justify-between">
                <span>₦{stats.totalFineAccrued} accrued fines</span>
                <button
                  onClick={() => setActivePage('circulation')}
                  className="hover:underline font-sans text-[11px]"
                >
                  Manage →
                </button>
              </div>
            </div>
          </div>

          {/* Registered Readers */}
          <div className="bg-white p-4 rounded-lg border border-[#E5E4DE] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#5A6258] mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider">Active Readers</span>
              <Users className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#202721] font-mono tabular-nums">
                {stats.totalStudents}
              </div>
              <div className="text-[11px] text-[#5A6258] mt-1 flex items-center justify-between">
                <span>ND I ({stats.nd1StudentsCount}) · ND II ({stats.nd2StudentsCount})</span>
                <button
                  onClick={() => setActivePage('students')}
                  className="text-[#245747] font-medium hover:underline text-[11px]"
                >
                  Directory →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Midsection: Circulation Velocity & Urgent Overdue Attention List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Circulation Velocity Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#E5E4DE] shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E4DE]">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  Weekly Circulation Velocity
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Volume of daily loans issued vs textbooks checked back into inventory
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5A6258]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#245747]" />
                  <span>Issues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-stone-300" />
                  <span>Returns</span>
                </div>
              </div>
            </div>

            {/* Velocity Bar Distribution */}
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-5 gap-3 items-end h-36 pt-4 border-b border-[#E5E4DE]">
                {weeklyThroughput.map((item) => {
                  const issueHeight = Math.round((item.issues / maxWeekly) * 100);
                  const returnHeight = Math.round((item.returns / maxWeekly) * 100);
                  return (
                    <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                      <div className="flex items-end gap-1.5 w-full justify-center h-full">
                        {/* Issues Bar */}
                        <div
                          style={{ height: `${issueHeight}%` }}
                          title={`${item.issues} issued`}
                          className="w-3.5 sm:w-4 bg-[#245747] rounded-xs transition-all group-hover:bg-[#1B4236]"
                        />
                        {/* Returns Bar */}
                        <div
                          style={{ height: `${returnHeight}%` }}
                          title={`${item.returns} returned`}
                          className="w-3.5 sm:w-4 bg-stone-300 rounded-xs transition-all group-hover:bg-stone-400"
                        />
                      </div>
                      <span className="text-[11px] font-mono text-[#5A6258] mt-2 group-hover:text-[#202721]">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Sub-summary metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-md bg-[#F7F6F2] border border-[#E5E4DE]">
                  <div className="text-[10px] font-mono uppercase text-[#8A9287]">Total Issues</div>
                  <div className="text-sm font-semibold text-[#202721] font-mono mt-0.5">97</div>
                </div>
                <div className="p-2 rounded-md bg-[#F7F6F2] border border-[#E5E4DE]">
                  <div className="text-[10px] font-mono uppercase text-[#8A9287]">Total Returns</div>
                  <div className="text-sm font-semibold text-[#202721] font-mono mt-0.5">83</div>
                </div>
                <div className="p-2 rounded-md bg-[#F7F6F2] border border-[#E5E4DE]">
                  <div className="text-[10px] font-mono uppercase text-[#8A9287]">Turnaround Rate</div>
                  <div className="text-sm font-semibold text-[#245747] font-mono mt-0.5">85.4%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Overdue Attention List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#E5E4DE] shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE]">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#202721] flex items-center gap-2">
                  <span>Overdue Attention Desk</span>
                  {overdueList.length > 0 && (
                    <span className="text-xs px-1.5 py-0.2 rounded font-mono bg-rose-50 text-rose-700 border border-rose-200">
                      {overdueList.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Loans exceeding standard 14-day loan term
                </p>
              </div>

              <button
                onClick={() => setActivePage('circulation')}
                className="text-xs text-[#245747] font-medium hover:underline flex items-center gap-1"
              >
                <span>Full Desk</span>
                <ChevronRight className="w-3 h-3 stroke-[1.75]" />
              </button>
            </div>

            <div className="divide-y divide-[#E5E4DE] mt-1 max-h-64 overflow-y-auto">
              {overdueList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5A6258]">
                  <CheckCircle2 className="w-5 h-5 text-[#245747] mx-auto mb-1.5 stroke-[1.75]" />
                  <span>No outstanding overdue books in the department.</span>
                </div>
              ) : (
                overdueList.map((loan) => (
                  <div key={loan.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#202721] truncate">
                        {loan.bookTitle}
                      </div>
                      <div className="text-[11px] text-[#5A6258] mt-0.5 flex items-center gap-1.5">
                        <span className="text-[#202721] font-medium">{loan.studentName}</span>
                        <span>·</span>
                        <span className="font-mono">{loan.studentMatricNo}</span>
                      </div>
                      <div className="text-[10px] text-rose-700 font-mono mt-0.5">
                        Due: {loan.dueDate} · Accrued Fine: <strong>₦{loan.fineAmount}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => returnBook({ loanId: loan.id, finePaid: true })}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded transition-colors shrink-0 shadow-2xs"
                    >
                      Check In
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E4DE] text-[11px] text-[#5A6258] flex items-center justify-between">
            <span>Fine rate: ₦50/day standard</span>
            <button
              onClick={() => setActivePage('reports')}
              className="text-[#245747] hover:underline font-medium"
            >
              Export Overdue Ledger →
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Lower Section: Recent Circulation Activity Ledger & Collection Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions Ledger (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-[#E5E4DE] shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE]">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#202721]">
                Recent Circulation Activity
              </h3>
              <p className="text-xs text-[#5A6258]">
                Latest book issues, renewals, and returned loan records
              </p>
            </div>
            <button
              onClick={() => setActivePage('circulation')}
              className="text-xs font-medium text-[#245747] hover:underline"
            >
              View Circulation Desk →
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                  <th className="py-2.5 pr-3 font-semibold">Curriculum Textbook</th>
                  <th className="py-2.5 px-3 font-semibold">Student Borrower</th>
                  <th className="py-2.5 px-3 font-semibold">Due Date</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 pl-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 pr-3 max-w-[200px]">
                      <div className="font-medium text-[#202721] truncate">
                        {loan.bookTitle}
                      </div>
                      <div className="text-[10px] font-mono text-[#5A6258] mt-0.5">
                        {loan.courseCode || 'COM'} · ISBN: {loan.bookIsbn}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-[#202721] font-medium truncate">
                        {loan.studentName}
                      </div>
                      <div className="text-[10px] font-mono text-[#5A6258]">
                        {loan.studentMatricNo} ({loan.studentLevel})
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5A6258]">
                      {loan.dueDate}
                    </td>

                    <td className="py-2.5 px-3">
                      {loan.status === 'Overdue' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue (₦{loan.fineAmount})
                        </span>
                      ) : loan.status === 'Active' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                          Active Loan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
                          Returned
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 pl-3 text-right">
                      {loan.status === 'Active' || loan.status === 'Overdue' ? (
                        <button
                          onClick={() => returnBook({ loanId: loan.id, finePaid: true })}
                          className="px-2 py-1 text-[11px] font-medium text-[#245747] hover:bg-[#EAF0EC] rounded transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#8A9287]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collection Insights by Course & Category (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-[#E5E4DE] shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE]">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  Collection by Discipline
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Curriculum holdings and shelf density
                </p>
              </div>
              <button
                onClick={() => setActivePage('books')}
                className="text-xs font-medium text-[#245747] hover:underline"
              >
                Catalogue →
              </button>
            </div>

            <div className="space-y-3.5 mt-4">
              {categoryEntries.map(([cat, data]) => {
                const percent = Math.round((data.total / maxCategoryCopies) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#202721] truncate max-w-[190px]">
                        {cat}
                      </span>
                      <span className="font-mono text-[11px] text-[#5A6258]">
                        {data.available}/{data.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-[#245747] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5E4DE] text-[11px] text-[#5A6258] flex items-center justify-between">
            <span>Accessioned texts: {stats.totalTitles}</span>
            <span className="font-mono text-[10px] text-[#8A9287]">COM 111 – COM 299</span>
          </div>
        </div>
      </div>
    </div>
  );
};
