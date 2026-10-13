import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ActivePage } from '../../types/library';
import { INSTITUTION_INFO } from '../../data/seedData';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  FileText,
  School,
  X,
  RotateCcw,
  CreditCard,
  Search,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeAlert?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    stats,
    resetToDefaultData,
    isAdmin,
    isStudent,
    currentUser,
  } = useLibrary();

  // Navigation grouping inspired by Linear / Notion
  const adminNavGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        {
          id: 'dashboard' as ActivePage,
          label: 'Operations Ledger',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0 stroke-[1.75]" />,
        },
      ],
    },
    {
      group: 'Collection',
      items: [
        {
          id: 'books' as ActivePage,
          label: 'Book Catalogue',
          icon: <BookOpen className="w-4 h-4 shrink-0 stroke-[1.75]" />,
          badge: stats.totalTitles,
        },
      ],
    },
    {
      group: 'Circulation',
      items: [
        {
          id: 'circulation' as ActivePage,
          label: 'Issue & Returns',
          icon: <ArrowLeftRight className="w-4 h-4 stroke-[1.75] shrink-0" />,
          badge: stats.overdueLoansCount > 0 ? `${stats.overdueLoansCount} late` : undefined,
          badgeAlert: stats.overdueLoansCount > 0,
        },
      ],
    },
    {
      group: 'Community',
      items: [
        {
          id: 'students' as ActivePage,
          label: 'Students Directory',
          icon: <Users className="w-4 h-4 stroke-[1.75] shrink-0" />,
          badge: stats.totalStudents,
        },
      ],
    },
    {
      group: 'Insights',
      items: [
        {
          id: 'reports' as ActivePage,
          label: 'Reports & Audits',
          icon: <FileText className="w-4 h-4 stroke-[1.75] shrink-0" />,
        },
      ],
    },
  ];

  const studentNavGroups: NavGroup[] = [
    {
      group: 'Circulation',
      items: [
        {
          id: 'student-portal' as ActivePage,
          label: 'My Loans & Renewals',
          icon: <BookOpen className="w-4 h-4 stroke-[1.75] shrink-0" />,
        },
      ],
    },
    {
      group: 'Collection',
      items: [
        {
          id: 'student-catalog' as ActivePage,
          label: 'Browse Catalogue (OPAC)',
          icon: <Search className="w-4 h-4 stroke-[1.75] shrink-0" />,
        },
      ],
    },
    {
      group: 'Identity',
      items: [
        {
          id: 'student-id' as ActivePage,
          label: 'Digital Library Card',
          icon: <CreditCard className="w-4 h-4 stroke-[1.75] shrink-0" />,
        },
      ],
    },
  ];

  const currentNavGroups = isAdmin ? adminNavGroups : studentNavGroups;

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#202721]/30 backdrop-blur-2xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FBFBFA] text-[#202721] flex flex-col border-r border-[#E5E4DE] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#E5E4DE] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#245747] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <School className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#202721] tracking-tight truncate flex items-center gap-1.5">
                <span className="font-editorial text-[15px] font-medium">FedPoly Ede</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                  CS
                </span>
              </div>
              <p className="text-[11px] text-[#5A6258] truncate">
                Computer Science Dept.
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Static Role Identifier (Strict RBAC: No cross-role switching) */}
        <div className="px-3.5 py-2.5 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs min-w-0">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 text-[#245747] stroke-[1.75] shrink-0" />
                <span className="font-semibold text-[#202721] truncate">Administrator Console</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-[#245747] stroke-[1.75] shrink-0" />
                <span className="font-semibold text-[#202721] truncate">Student Reader Portal</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-medium shrink-0 ml-1 bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
            {isAdmin ? 'Staff' : currentUser?.level || 'Student'}
          </span>
        </div>

        {/* Grouped Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {currentNavGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-semibold text-[#8A9287] uppercase tracking-wider font-mono">
                {group.group}
              </div>

              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EAF0EC] text-[#1B4236] font-semibold'
                        : 'text-[#5A6258] hover:text-[#202721] hover:bg-[#F2F0E8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-[#245747]' : 'text-[#8A9287]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                          item.badgeAlert
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                            : isActive
                            ? 'bg-[#245747]/10 text-[#245747] font-semibold'
                            : 'bg-stone-200/70 text-stone-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Academic Session Footer Card */}
        <div className="p-3 border-t border-[#E5E4DE] bg-white/60 space-y-2">
          <div className="p-2.5 rounded-md bg-[#F7F6F2] border border-[#E5E4DE] text-[11px]">
            <div className="text-[#8A9287] text-[10px] uppercase font-semibold tracking-wider font-mono">
              Academic Operations
            </div>
            <div className="text-[#202721] font-medium mt-0.5">
              {INSTITUTION_INFO.academicSession}
            </div>
            <div className="text-[#5A6258] text-[10px] mt-0.5">
              {INSTITUTION_INFO.semester}
            </div>
          </div>

          {isAdmin ? (
            <button
              onClick={resetToDefaultData}
              title="Reset to benchmark evaluation demo data"
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded-md transition-colors border border-[#E5E4DE]"
            >
              <RotateCcw className="w-3 h-3 text-[#245747] stroke-[1.75]" />
              <span>Reset Benchmark Data</span>
            </button>
          ) : (
            <div className="text-[10px] text-center text-[#8A9287] py-1 font-mono">
              FPE Library Unit · South Campus
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
