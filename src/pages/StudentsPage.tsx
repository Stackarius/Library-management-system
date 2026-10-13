import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Student, StudentLevel } from '../types/library';
import { INSTITUTION_INFO } from '../data/seedData';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  X,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

const LEVELS: StudentLevel[] = ['ND I', 'ND II', 'HND I', 'HND II'];

export const StudentsPage: React.FC = () => {
  const { students, loans, addStudent, updateStudent, deleteStudent, setActivePage } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form
  const initialForm = {
    matricNo: '',
    fullName: '',
    department: 'Computer Science',
    level: 'ND II' as StudentLevel,
    phone: '',
    email: '',
    status: 'Active' as 'Active' | 'Suspended',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredStudents = students.filter((student) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      student.fullName.toLowerCase().includes(q) ||
      student.matricNo.toLowerCase().includes(q) ||
      student.email.toLowerCase().includes(q) ||
      student.phone.includes(q);

    const matchesLevel =
      levelFilter === 'All Levels' || student.level === levelFilter;

    const matchesStatus =
      statusFilter === 'All Status' || student.status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.matricNo.trim()) {
      errors.matricNo = 'Matriculation number is required (e.g. FPE/CS/24/001)';
    }
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full student name is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Contact phone number is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Valid institutional email is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      matricNo: student.matricNo,
      fullName: student.fullName,
      department: student.department,
      level: student.level,
      phone: student.phone,
      email: student.email,
      status: student.status,
    });
    setFormErrors({});
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      addStudent({
        ...formData,
      });
      setIsAddOpen(false);
    }
  };

  // Get active loans for a student
  const getStudentLoans = (studentId: string) => {
    return loans.filter(
      (l) => l.studentId === studentId && (l.status === 'Active' || l.status === 'Overdue')
    );
  };

  const viewingStudentLoans = viewingStudent ? getStudentLoans(viewingStudent.id) : [];
  const viewingStudentOverdue = viewingStudentLoans.filter((l) => l.status === 'Overdue');
  const viewingStudentFines = viewingStudentOverdue.reduce((sum, l) => sum + (l.finePaid ? 0 : l.fineAmount), 0);
  const isClearedForExam = viewingStudentLoans.length === 0 && viewingStudentFines === 0;

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            Reader Registry
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#202721] tracking-tight mt-1">
            Student Reader Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1">
            Registered ND I and ND II borrowers · {students.length} students enrolled · Max loan quota: {INSTITUTION_INFO.maxBorrowLimit} books
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Register Student</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-md border border-[#E5E4DE] shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9287] stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, matriculation no (FPE/CS/...), or email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] hover:bg-[#F2F0E8] focus:bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] focus:ring-1 focus:ring-[#245747] transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer"
          >
            <option value="All Levels">All Academic Levels</option>
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer"
          >
            <option value="All Status">All Account Status</option>
            <option value="Active">Active Readers</option>
            <option value="Suspended">Suspended Borrowers</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md border border-[#E5E4DE] bg-[#F7F6F2] p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                  : 'text-[#5A6258] hover:text-[#202721]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                  : 'text-[#5A6258] hover:text-[#202721]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Card View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-md border border-[#E5E4DE] p-12 text-center">
          <Users className="w-8 h-8 text-[#8A9287] mx-auto mb-2 stroke-[1.75]" />
          <h3 className="font-serif text-base font-semibold text-[#202721]">
            No Students Found
          </h3>
          <p className="text-xs text-[#5A6258] mt-1 max-w-sm mx-auto">
            No registered reader profiles match your filter. Try adjusting the search query or level selector.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F7F6F2] border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                  <th className="py-2.5 px-4 font-semibold">Student Name & Matric</th>
                  <th className="py-2.5 px-4 font-semibold">Programme Level</th>
                  <th className="py-2.5 px-4 font-semibold">Contact Email & Phone</th>
                  <th className="py-2.5 px-4 font-semibold">Active Loans Quota</th>
                  <th className="py-2.5 px-4 font-semibold">Account Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {filteredStudents.map((student) => {
                  const studentActiveLoans = getStudentLoans(student.id);
                  const hasOverdue = studentActiveLoans.some((l) => l.status === 'Overdue');
                  const quotaUsed = studentActiveLoans.length;

                  return (
                    <tr key={student.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Matric */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#202721]">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-[#5A6258] mt-0.5">
                          {student.matricNo}
                        </div>
                      </td>

                      {/* Level & Dept */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          {student.level}
                        </span>
                        <div className="text-[10px] text-[#5A6258] mt-0.5">
                          {student.department}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-[#202721] truncate max-w-[180px]">
                          {student.email}
                        </div>
                        <div className="text-[10px] font-mono text-[#8A9287] mt-0.5">
                          {student.phone}
                        </div>
                      </td>

                      {/* Loans Quota */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs font-semibold ${
                            hasOverdue ? 'text-rose-700' : 'text-[#202721]'
                          }`}>
                            {quotaUsed} / {INSTITUTION_INFO.maxBorrowLimit}
                          </span>
                          <span className="text-[10px] text-[#5A6258]">books</span>
                        </div>
                        {hasOverdue && (
                          <div className="text-[10px] text-rose-700 font-mono mt-0.5 font-medium">
                            Has overdue loans
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {student.status === 'Active' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingStudent(student)}
                            title="Inspect student dossier & clearance"
                            className="p-1 text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="Edit student profile"
                            className="p-1 text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[1.75]" />
                          </button>

                          <button
                            onClick={() => setDeletingStudent(student)}
                            title="Remove reader record"
                            className="p-1 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
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
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const studentActiveLoans = getStudentLoans(student.id);
            const hasOverdue = studentActiveLoans.some((l) => l.status === 'Overdue');

            return (
              <div
                key={student.id}
                className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-4 flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E5E4DE]">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {student.level}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      student.status === 'Active'
                        ? 'bg-[#EAF0EC] text-[#1B4236]'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  <h3 className="font-medium text-sm text-[#202721] mt-2.5">
                    {student.fullName}
                  </h3>
                  <div className="font-mono text-xs text-[#5A6258] mt-0.5">
                    {student.matricNo}
                  </div>

                  <div className="space-y-1 text-xs text-[#5A6258] mt-3 pt-2 border-t border-[#E5E4DE]">
                    <div className="truncate text-[11px]">{student.email}</div>
                    <div className="font-mono text-[11px] text-[#8A9287]">{student.phone}</div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#E5E4DE] flex items-center justify-between">
                  <div>
                    <span className={`font-mono text-xs font-semibold ${
                      hasOverdue ? 'text-rose-700' : 'text-[#202721]'
                    }`}>
                      {studentActiveLoans.length}/{INSTITUTION_INFO.maxBorrowLimit}
                    </span>
                    <span className="text-[11px] text-[#5A6258] ml-1">loans</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingStudent(student)}
                      className="px-2 py-1 text-[11px] text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => handleOpenEdit(student)}
                      className="px-2 py-1 text-[11px] text-[#245747] hover:bg-[#EAF0EC] rounded font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-lg w-full">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#202721]">
                  {editingStudent ? 'Edit Student Details' : 'Register New Student Reader'}
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Federal Polytechnic Ede · Department of Computer Science
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingStudent(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Matriculation Number *
                </label>
                <input
                  type="text"
                  value={formData.matricNo}
                  onChange={(e) => setFormData({ ...formData, matricNo: e.target.value })}
                  placeholder="e.g. FPE/CS/24/048"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                />
                {formErrors.matricNo && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.matricNo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ibrahim Babatunde Musa"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                />
                {formErrors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Academic Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as StudentLevel })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Active' | 'Suspended' })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Institutional Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. b.musa@student.federalpolyede.edu.ng"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 0803 123 4567"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E4DE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-[#5A6258] hover:text-[#202721] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  {editingStudent ? 'Update Student' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Dossier Drawer / Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A9287]">
                  Reader Dossier & Examination Clearance
                </span>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  {viewingStudent.fullName}
                </h3>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Clearance Banner */}
              <div className={`p-3 rounded-md border flex items-center justify-between ${
                isClearedForExam
                  ? 'bg-[#EAF0EC] border-[#245747]/20 text-[#1B4236]'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  {isClearedForExam ? (
                    <CheckCircle2 className="w-4 h-4 text-[#245747] stroke-[1.75]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 stroke-[1.75]" />
                  )}
                  <div>
                    <div className="font-semibold text-xs">
                      {isClearedForExam ? 'Cleared for Examination' : 'Circulation Hold Active'}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {isClearedForExam
                        ? 'Zero unreturned books and zero outstanding fines'
                        : `${viewingStudentLoans.length} books in custody · ₦${viewingStudentFines} fines outstanding`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#E5E4DE]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Matriculation No</span>
                  <span className="font-mono text-[#202721] font-medium">{viewingStudent.matricNo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Level</span>
                  <span className="text-[#202721] font-medium">{viewingStudent.level} (Computer Science)</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Email</span>
                  <span className="text-[#202721]">{viewingStudent.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Phone</span>
                  <span className="font-mono text-[#202721]">{viewingStudent.phone}</span>
                </div>
              </div>

              {/* Active Loans */}
              <div>
                <div className="font-serif font-medium text-xs text-[#202721] mb-2 flex items-center justify-between">
                  <span>Current Books in Custody ({viewingStudentLoans.length})</span>
                  <span className="text-[10px] text-[#5A6258] font-mono">Limit: {INSTITUTION_INFO.maxBorrowLimit}</span>
                </div>

                <div className="divide-y divide-[#E5E4DE] border border-[#E5E4DE] rounded-md max-h-40 overflow-y-auto">
                  {viewingStudentLoans.length === 0 ? (
                    <div className="p-4 text-center text-[#5A6258] text-[11px]">
                      No active books currently issued to this student.
                    </div>
                  ) : (
                    viewingStudentLoans.map((loan) => (
                      <div key={loan.id} className="p-2.5 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-[#202721]">{loan.bookTitle}</div>
                          <div className="text-[10px] font-mono text-[#5A6258]">
                            Due: {loan.dueDate} · {loan.courseCode || 'COM'}
                          </div>
                        </div>
                        <div>
                          {loan.status === 'Overdue' ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Overdue (₦{loan.fineAmount})
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-[#E5E4DE] bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-3.5 py-1.5 text-xs text-[#202721] bg-white border border-[#E5E4DE] rounded-md hover:bg-stone-100"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        title="Remove Reader from Directory?"
        message={`Are you sure you want to deactivate reader profile for "${deletingStudent?.fullName}" (${deletingStudent?.matricNo})?`}
        confirmLabel="Deactivate Reader"
        isDestructive={true}
        onConfirm={() => {
          if (deletingStudent) deleteStudent(deletingStudent.id);
          setDeletingStudent(null);
        }}
        onCancel={() => setDeletingStudent(null)}
      />
    </div>
  );
};
