import React, { useState } from 'react';
import { useLibrary, SYSTEM_CURRENT_DATE } from '../context/LibraryContext';
import { INSTITUTION_INFO } from '../data/seedData';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  School,
  X,
  BookOpen,
  Users,
  TrendingUp,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { books, students, loans, stats, currentUser } = useLibrary();

  const [reportType, setReportType] = useState<
    'overdue' | 'active_loans' | 'inventory' | 'clearance'
  >('overdue');

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Data sets
  const overdueLoans = loans.filter((l) => l.status === 'Overdue');
  const activeLoans = loans.filter((l) => l.status === 'Active' || l.status === 'Overdue');

  // Category counts
  const categoryStats: Record<string, { total: number; available: number; checkedOut: number }> = {};
  books.forEach((b) => {
    if (!categoryStats[b.category]) {
      categoryStats[b.category] = { total: 0, available: 0, checkedOut: 0 };
    }
    categoryStats[b.category].total += b.totalCopies;
    categoryStats[b.category].available += b.availableCopies;
    categoryStats[b.category].checkedOut += b.totalCopies - b.availableCopies;
  });

  // Clearance audit for students
  const clearanceList = students.map((s) => {
    const studentLoans = loans.filter(
      (l) => l.studentId === s.id && (l.status === 'Active' || l.status === 'Overdue')
    );
    const hasOverdue = studentLoans.some((l) => l.status === 'Overdue');
    const fines = studentLoans.reduce((sum, l) => sum + (l.finePaid ? 0 : l.fineAmount), 0);
    const isCleared = studentLoans.length === 0 && fines === 0;

    return {
      student: s,
      activeLoansCount: studentLoans.length,
      hasOverdue,
      fines,
      isCleared,
    };
  });

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `fedpoly_ede_cs_${reportType}_report_${SYSTEM_CURRENT_DATE}.csv`;

    if (reportType === 'overdue') {
      headers = [
        'Loan ID',
        'Student Name',
        'Matric Number',
        'Level',
        'Book Title',
        'Course Code',
        'ISBN',
        'Issue Date',
        'Due Date',
        'Fine Accrued (NGN)',
        'Fine Status',
      ];
      rows = overdueLoans.map((l) => [
        l.id,
        `"${l.studentName}"`,
        l.studentMatricNo,
        l.studentLevel,
        `"${l.bookTitle}"`,
        l.courseCode || 'COM',
        l.bookIsbn,
        l.issueDate,
        l.dueDate,
        String(l.fineAmount),
        l.finePaid ? 'Paid' : 'Unpaid',
      ]);
    } else if (reportType === 'active_loans') {
      headers = [
        'Loan ID',
        'Book Title',
        'Course Code',
        'Student Name',
        'Matric No',
        'Level',
        'Issue Date',
        'Due Date',
        'Status',
        'Issued By',
      ];
      rows = activeLoans.map((l) => [
        l.id,
        `"${l.bookTitle}"`,
        l.courseCode || 'COM',
        `"${l.studentName}"`,
        l.studentMatricNo,
        l.studentLevel,
        l.issueDate,
        l.dueDate,
        l.status,
        `"${l.issuedBy}"`,
      ]);
    } else if (reportType === 'inventory') {
      headers = [
        'Category / Curriculum Area',
        'Total Physical Copies',
        'Currently On Shelf',
        'Active Borrowed Copies',
        'Utilization Rate (%)',
      ];
      rows = Object.entries(categoryStats).map(([cat, data]) => [
        `"${cat}"`,
        String(data.total),
        String(data.available),
        String(data.checkedOut),
        `${Math.round((data.checkedOut / data.total) * 100)}%`,
      ]);
    } else if (reportType === 'clearance') {
      headers = [
        'Matric Number',
        'Student Full Name',
        'Level',
        'Department',
        'Active Books in Custody',
        'Outstanding Fines (NGN)',
        'Semester Exam Clearance Status',
      ];
      rows = clearanceList.map((c) => [
        c.student.matricNo,
        `"${c.student.fullName}"`,
        c.student.level,
        `"${c.student.department}"`,
        String(c.activeLoansCount),
        String(c.fines),
        c.isCleared ? 'CLEARED' : 'HELD / BLOCKED',
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            <span>Departmental Auditing</span>
            <span className="text-stone-300">·</span>
            <span>Computer Science</span>
            <span className="text-stone-300">·</span>
            <span className="text-[#245747] font-semibold">{INSTITUTION_INFO.academicSession}</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-[#202721] tracking-tight mt-1">
            Circulation & Audit Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1">
            Official operational ledgers, overdue audit sheets, and student examination clearance verification
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium bg-white hover:bg-stone-50 text-[#202721] rounded-md border border-[#E5E4DE] shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Print Audit Sheet</span>
          </button>
        </div>
      </div>

      {/* Report Selection Segment */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setReportType('overdue')}
          className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
            reportType === 'overdue'
              ? 'bg-white border-[#245747] shadow-2xs ring-1 ring-[#245747]'
              : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-serif font-medium text-[#202721]">Overdue Defaulters</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
          </div>
          <div className="text-xl font-semibold font-mono text-rose-700">
            {overdueLoans.length}
          </div>
          <div className="text-[10px] text-[#5A6258] mt-0.5">
            ₦{stats.totalFineAccrued} uncollected fines
          </div>
        </button>

        <button
          onClick={() => setReportType('active_loans')}
          className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
            reportType === 'active_loans'
              ? 'bg-white border-[#245747] shadow-2xs ring-1 ring-[#245747]'
              : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-serif font-medium text-[#202721]">Active Circulation</span>
            <FileText className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
          </div>
          <div className="text-xl font-semibold font-mono text-[#202721]">
            {activeLoans.length}
          </div>
          <div className="text-[10px] text-[#5A6258] mt-0.5">
            Active borrowed materials
          </div>
        </button>

        <button
          onClick={() => setReportType('inventory')}
          className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
            reportType === 'inventory'
              ? 'bg-white border-[#245747] shadow-2xs ring-1 ring-[#245747]'
              : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-serif font-medium text-[#202721]">Holdings & Stock</span>
            <Layers className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
          </div>
          <div className="text-xl font-semibold font-mono text-[#202721]">
            {stats.totalPhysicalBooks}
          </div>
          <div className="text-[10px] text-[#5A6258] mt-0.5">
            Physical volumes accessioned
          </div>
        </button>

        <button
          onClick={() => setReportType('clearance')}
          className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
            reportType === 'clearance'
              ? 'bg-white border-[#245747] shadow-2xs ring-1 ring-[#245747]'
              : 'bg-white border-[#E5E4DE] hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-serif font-medium text-[#202721]">Exam Clearance</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
          </div>
          <div className="text-xl font-semibold font-mono text-[#245747]">
            {clearanceList.filter((c) => c.isCleared).length}/{students.length}
          </div>
          <div className="text-[10px] text-[#5A6258] mt-0.5">
            Students eligible for exam
          </div>
        </button>
      </div>

      {/* Main Report Table Display */}
      <div className="bg-white rounded-lg border border-[#E5E4DE] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F7F6F2] border-b border-[#E5E4DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#8A9287]">
              Official Ledger Sheet
            </span>
            <h3 className="font-serif text-base font-semibold text-[#202721]">
              {reportType === 'overdue' && 'Overdue Defaulters & Penalty Ledger'}
              {reportType === 'active_loans' && 'Departmental Active Circulation Ledger'}
              {reportType === 'inventory' && 'Inventory Classification & Stock Utilization'}
              {reportType === 'clearance' && 'Student Examination Clearance Verification'}
            </h3>
          </div>
          <div className="text-xs font-mono text-[#5A6258]">
            Reference: {SYSTEM_CURRENT_DATE} · {INSTITUTION_INFO.academicSession}
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Overdue Report */}
          {reportType === 'overdue' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287] bg-stone-50/50">
                  <th className="py-2.5 px-4 font-semibold">Student Borrower</th>
                  <th className="py-2.5 px-4 font-semibold">Overdue Textbook</th>
                  <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold">Fine Amount</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {overdueLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5A6258]">
                      No active overdue loans in the department.
                    </td>
                  </tr>
                ) : (
                  overdueLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#202721]">{loan.studentName}</div>
                        <div className="text-[10px] font-mono text-[#5A6258]">{loan.studentMatricNo} ({loan.studentLevel})</div>
                      </td>
                      <td className="py-3 px-4 font-serif text-[#202721]">
                        <div>{loan.bookTitle}</div>
                        <div className="text-[10px] font-mono text-[#5A6258] font-sans">{loan.courseCode || 'COM'} · ISBN: {loan.bookIsbn}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#5A6258]">{loan.issueDate}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-rose-700 font-semibold">{loan.dueDate}</td>
                      <td className="py-3 px-4 font-mono text-xs text-rose-700 font-bold">₦{loan.fineAmount}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Penalty Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Active Loans Report */}
          {reportType === 'active_loans' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287] bg-stone-50/50">
                  <th className="py-2.5 px-4 font-semibold">Textbook Title</th>
                  <th className="py-2.5 px-4 font-semibold">Student Borrower</th>
                  <th className="py-2.5 px-4 font-semibold">Course Code</th>
                  <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Schedule</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {activeLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-serif text-[#202721] max-w-xs">{loan.bookTitle}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#202721]">{loan.studentName}</div>
                      <div className="text-[10px] font-mono text-[#5A6258]">{loan.studentMatricNo}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{loan.courseCode || 'COM'}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5A6258]">{loan.issueDate}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#245747] font-medium">{loan.dueDate}</td>
                    <td className="py-3 px-4 text-right text-[#5A6258]">{loan.issuedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Holdings Report */}
          {reportType === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287] bg-stone-50/50">
                  <th className="py-2.5 px-4 font-semibold">Curriculum Classification</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Copies</th>
                  <th className="py-2.5 px-4 font-semibold text-right">On Shelf</th>
                  <th className="py-2.5 px-4 font-semibold text-right">On Loan</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Utilization Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {Object.entries(categoryStats).map(([cat, data]) => {
                  const utilRate = Math.round((data.checkedOut / data.total) * 100);
                  return (
                    <tr key={cat} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#202721]">{cat}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#202721] font-semibold">{data.total}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#245747]">{data.available}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#5A6258]">{data.checkedOut}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          utilRate > 50
                            ? 'bg-[#EAF0EC] text-[#1B4236]'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {utilRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Clearance Report */}
          {reportType === 'clearance' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287] bg-stone-50/50">
                  <th className="py-2.5 px-4 font-semibold">Matriculation & Name</th>
                  <th className="py-2.5 px-4 font-semibold">Programme Cohort</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Books in Custody</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Overdue Fines</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Examination Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {clearanceList.map((c) => (
                  <tr key={c.student.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#202721]">{c.student.fullName}</div>
                      <div className="text-[10px] font-mono text-[#5A6258]">{c.student.matricNo}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">{c.student.level} · Computer Science</td>
                    <td className="py-3 px-4 text-right font-mono">{c.activeLoansCount}</td>
                    <td className="py-3 px-4 text-right font-mono">₦{c.fines}</td>
                    <td className="py-3 px-4 text-right">
                      {c.isCleared ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                          <CheckCircle2 className="w-3 h-3 stroke-[1.75]" />
                          <span>CLEARED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 stroke-[1.75]" />
                          <span>HOLD ACTIVE</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Printable Institutional Audit Sheet Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-stone-300 max-w-3xl w-full p-8 my-8 text-black print:p-0">
            {/* Modal Controls (Not printed) */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
              <span className="text-xs text-stone-500 font-mono">
                Official Examination & Departmental Audit Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 rounded-md cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Institutional Letterhead */}
            <div className="text-center border-b-2 border-black pb-4 mb-6 space-y-1">
              <h2 className="font-serif text-xl font-bold tracking-tight uppercase">
                {INSTITUTION_INFO.name}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                School of Applied Sciences · {INSTITUTION_INFO.department}
              </p>
              <p className="text-[11px] text-stone-600">
                Departmental Library & E-Resource Unit · South Campus, Ede, Osun State
              </p>
              <div className="pt-2 text-xs font-bold uppercase tracking-wider">
                ND FINAL-YEAR ACADEMIC PROJECT CIRCULATION AUDIT CERTIFICATE
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-stone-300 pb-4 mb-6">
              <div>
                <div><strong>Audit Date:</strong> {SYSTEM_CURRENT_DATE}</div>
                <div><strong>Session:</strong> {INSTITUTION_INFO.academicSession}</div>
                <div><strong>Semester:</strong> {INSTITUTION_INFO.semester}</div>
              </div>
              <div className="text-right">
                <div><strong>Total Titles:</strong> {stats.totalTitles}</div>
                <div><strong>Total Volumes:</strong> {stats.totalPhysicalBooks}</div>
                <div><strong>Active Borrowers:</strong> {stats.activeLoansCount}</div>
              </div>
            </div>

            {/* Summary Certification Body */}
            <div className="space-y-4 text-xs leading-relaxed">
              <p>
                This document certifies that as of <strong>{SYSTEM_CURRENT_DATE}</strong>, the Department of Computer Science Library has audited the status of textbooks, curriculum project monographs, and student loan registers.
              </p>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                <div className="font-bold mb-1">Key Operational Audit Findings:</div>
                <ul className="list-disc list-inside space-y-1 text-stone-700">
                  <li>Total catalogue accession count stands at {stats.totalTitles} course curriculum titles.</li>
                  <li>{stats.activeLoansCount} textbooks are currently in circulation across ND I and ND II cohorts.</li>
                  <li>{overdueLoans.length} items are marked overdue with accrued penalty sum of ₦{stats.totalFineAccrued}.</li>
                  <li>Examination clearance is granted to {clearanceList.filter((c) => c.isCleared).length} of {students.length} registered students.</li>
                </ul>
              </div>
            </div>

            {/* Official Sign-off Lines */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-8 border-t border-stone-300 text-center text-xs">
              <div className="space-y-8">
                <div className="border-b border-black w-3/4 mx-auto" />
                <div>
                  <div className="font-bold">Engr. (Mrs.) Adeyemi A. B.</div>
                  <div className="text-[10px] text-stone-600">Head of Department (HOD)</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-b border-black w-3/4 mx-auto" />
                <div>
                  <div className="font-bold">Mal. Ibrahim S. O.</div>
                  <div className="text-[10px] text-stone-600">Departmental Librarian</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-b border-black w-3/4 mx-auto" />
                <div>
                  <div className="font-bold">External Project Examiner</div>
                  <div className="text-[10px] text-stone-600">NBTE Accreditation Team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
