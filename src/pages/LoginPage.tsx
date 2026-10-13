import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { INITIAL_USERS, INSTITUTION_INFO } from '../data/seedData';
import {
  School,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  AlertCircle,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useLibrary();
  const [selectedRoleTab, setSelectedRoleTab] = useState<'admin' | 'student'>('admin');
  const [credential, setCredential] = useState('adeyemi.ab@federalpolyede.edu.ng');
  const [password, setPassword] = useState('FedPoly#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (role: 'admin' | 'student') => {
    setSelectedRoleTab(role);
    setError('');
    if (role === 'admin') {
      setCredential('adeyemi.ab@federalpolyede.edu.ng');
    } else {
      setCredential('FPE/CS/23/048');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential.trim()) {
      setError(
        selectedRoleTab === 'admin'
          ? 'Please enter your staff ID or institutional email.'
          : 'Please enter your student matriculation number (e.g. FPE/CS/23/048).'
      );
      return;
    }

    if (!password) {
      setError('Please enter your portal password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = login(credential);
      setIsLoading(false);
      if (!ok) {
        setError('Invalid login credentials. Click one of the quick persona accounts below for instant evaluation.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#202721] flex flex-col justify-between selection:bg-[#245747]/15">
      {/* Top Academic Context Banner */}
      <div className="border-b border-[#E5E4DE] bg-white px-4 py-2.5 text-xs text-[#5A6258] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#245747]" />
          <span className="font-semibold text-[#202721]">
            Academic Project Defense:
          </span>
          <span>National Diploma (ND) Final-Year Project · Department of Computer Science</span>
        </div>
        <div className="text-[11px] text-[#8A9287] font-mono hidden sm:block">
          {INSTITUTION_INFO.name} · {INSTITUTION_INFO.academicSession}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-xl border border-[#E5E4DE] shadow-xs overflow-hidden">
          {/* Left Column: Editorial Institutional Story (Linear / Notion craft) */}
          <div className="lg:col-span-5 bg-[#202721] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 space-y-6">
              {/* Institutional Crest Lockup */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#245747] text-white flex items-center justify-center font-bold shadow-xs">
                  <School className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium tracking-tight text-white">
                    Federal Polytechnic Ede
                  </h3>
                  <p className="text-xs text-stone-300">
                    Department of Computer Science
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                  Curriculum Circulation System
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-tight mt-1.5">
                  Departmental Library & E-Resource Unit
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-3 leading-relaxed">
                  A role-based operational desk for curriculum textbooks, ND project monographs, and student loan circulation for the Computer Science ND & HND programmes.
                </p>
              </div>

              {/* Quick Academic Key Points */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#4E8E76] shrink-0 mt-0.5 stroke-[1.75]" />
                  <span>Role-based access: Administrators (Librarian/HOD) and Students</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#4E8E76] shrink-0 mt-0.5 stroke-[1.75]" />
                  <span>Course text tracking from COM 111 to COM 299 monographs</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#4E8E76] shrink-0 mt-0.5 stroke-[1.75]" />
                  <span>Real-time overdue calculation at ₦50/day fine rate</span>
                </div>
              </div>
            </div>

            {/* Defense Verification Footer */}
            <div className="relative z-10 pt-8 mt-8 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
              <div>
                <span className="text-stone-300 font-medium">Session:</span> {INSTITUTION_INFO.academicSession}
              </div>
              <div className="font-mono text-[11px] text-stone-400">
                School of Applied Sciences
              </div>
            </div>
          </div>

          {/* Right Column: Refined Authentication Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto space-y-6">
              {/* Header */}
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#202721] tracking-tight">
                  Sign in to Portal
                </h2>
                <p className="text-xs text-[#5A6258] mt-1">
                  Enter your institutional credentials or select an evaluation persona.
                </p>
              </div>

              {/* Role Toggle Switcher */}
              <div className="p-1 rounded-lg bg-[#F2F0E8] border border-[#E5E4DE] flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('admin')}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-2 ${
                    selectedRoleTab === 'admin'
                      ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                      : 'text-[#5A6258] hover:text-[#202721]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                  <span>Administrator (Staff)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('student')}
                  className={`flex-1 py-1.5 px-3 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-2 ${
                    selectedRoleTab === 'student'
                      ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                      : 'text-[#5A6258] hover:text-[#202721]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                  <span>Student (ND I / ND II)</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[1.75]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1.5">
                    {selectedRoleTab === 'admin'
                      ? 'Staff ID or Institutional Email'
                      : 'Matriculation Number (or Student Email)'}
                  </label>
                  <input
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder={
                      selectedRoleTab === 'admin'
                        ? 'e.g. adeyemi.ab@federalpolyede.edu.ng'
                        : 'e.g. FPE/CS/23/048'
                    }
                    className="w-full px-3 py-2 text-xs text-[#202721] bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] focus:ring-1 focus:ring-[#245747] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#202721]">
                      Password
                    </label>
                    <span className="text-[10px] text-[#8A9287]">
                      Demo: any password accepted
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 pr-9 text-xs text-[#202721] bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] focus:ring-1 focus:ring-[#245747] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[1.75]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#245747] hover:bg-[#1B4236] text-white font-medium text-xs rounded-md shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying session...</span>
                  ) : (
                    <>
                      <span>Enter Computer Science Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Evaluation Demo Switchers */}
              <div className="pt-4 border-t border-[#E5E4DE] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8A9287]">
                  <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">
                    Quick Evaluation Personas
                  </span>
                  <span>Click to test role</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedRoleTab === 'admin' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => quickLogin('u1')}
                        className="p-2 text-left rounded-md border border-[#E5E4DE] bg-[#F7F6F2] hover:bg-[#EAE7DC] hover:border-[#245747]/40 transition-all text-[#202721]"
                      >
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-[#245747]">
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>Engr. (Mrs.) Adeyemi</span>
                        </div>
                        <div className="text-[10px] text-[#5A6258] mt-0.5 truncate">
                          Head of Dept. / Full Access
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => quickLogin('u2')}
                        className="p-2 text-left rounded-md border border-[#E5E4DE] bg-[#F7F6F2] hover:bg-[#EAE7DC] hover:border-[#245747]/40 transition-all text-[#202721]"
                      >
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-[#245747]">
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>Mr. T. K. Okonkwo</span>
                        </div>
                        <div className="text-[10px] text-[#5A6258] mt-0.5 truncate">
                          Departmental Librarian
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => quickLogin('u3')}
                        className="p-2 text-left rounded-md border border-[#E5E4DE] bg-[#F7F6F2] hover:bg-[#EAE7DC] hover:border-[#245747]/40 transition-all text-[#202721]"
                      >
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-[#202721]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                          <span>Babatunde Adeleke</span>
                        </div>
                        <div className="text-[10px] text-[#5A6258] mt-0.5 truncate font-mono">
                          FPE/CS/23/048 · ND II
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => quickLogin('u4')}
                        className="p-2 text-left rounded-md border border-[#E5E4DE] bg-[#F7F6F2] hover:bg-[#EAE7DC] hover:border-rose-400 transition-all text-[#202721]"
                      >
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-rose-800">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[1.75]" />
                          <span>Chidinma Grace Nwosu</span>
                        </div>
                        <div className="text-[10px] text-rose-700 mt-0.5 truncate font-mono">
                          FPE/CS/23/082 · ND II (Overdue)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => quickLogin('u5')}
                        className="p-2 text-left rounded-md border border-[#E5E4DE] bg-[#F7F6F2] hover:bg-[#EAE7DC] hover:border-[#245747]/40 transition-all text-[#202721] sm:col-span-2"
                      >
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-[#202721]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#245747] stroke-[1.75]" />
                          <span>Aisha Aminu Sani</span>
                        </div>
                        <div className="text-[10px] text-[#5A6258] mt-0.5 truncate font-mono">
                          FPE/CS/24/015 · ND I Student
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Academic Project Footer */}
      <footer className="border-t border-[#E5E4DE] bg-white py-3 px-6 text-xs text-[#5A6258] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#202721]">
            {INSTITUTION_INFO.shortName} · {INSTITUTION_INFO.department}
          </span>
          <span className="text-[#8A9287]">·</span>
          <span>ND Final-Year Academic Project</span>
        </div>
        <div className="text-[11px] text-[#8A9287] font-mono">
          Federal Polytechnic Ede, Osun State, Nigeria
        </div>
      </footer>
    </div>
  );
};
