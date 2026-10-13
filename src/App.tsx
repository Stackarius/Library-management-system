/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickSearchModal } from './components/common/QuickSearchModal';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BooksPage } from './pages/BooksPage';
import { StudentsPage } from './pages/StudentsPage';
import { CirculationPage } from './pages/CirculationPage';
import { ReportsPage } from './pages/ReportsPage';
import { StudentPortalPage } from './pages/StudentPortalPage';
import { INSTITUTION_INFO } from './data/seedData';

const MainLayout: React.FC = () => {
  const { currentUser, activePage, setActivePage, isAdmin, isStudent } = useLibrary();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global keyboard shortcut '/' for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          target.tagName !== 'SELECT'
        ) {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  // If user is logged out, show LoginPage
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#202721] flex antialiased">
      {/* Persistent Editorial Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar */}
        <Header
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
        />

        {/* Dynamic Page Body based on Strict RBAC */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Student View Only */}
          {isStudent && <StudentPortalPage />}

          {/* Admin Operations Only */}
          {isAdmin && (
            <>
              {activePage === 'dashboard' && (
                <DashboardPage
                  onIssueNewBook={() => setActivePage('circulation')}
                  onAddNewBook={() => setActivePage('books')}
                  onAddStudent={() => setActivePage('students')}
                />
              )}
              {activePage === 'books' && <BooksPage />}
              {activePage === 'students' && <StudentsPage />}
              {activePage === 'circulation' && <CirculationPage />}
              {activePage === 'reports' && <ReportsPage />}
            </>
          )}
        </main>

        {/* Institutional Academic Project Footer */}
        <footer className="border-t border-[#E5E4DE] bg-[#FBFBFA] py-3.5 px-6 text-xs text-[#5A6258] flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#202721]">
              {INSTITUTION_INFO.shortName} · {INSTITUTION_INFO.department}
            </span>
            <span aria-hidden="true" className="text-[#8A9287]">·</span>
            <span>ND Final-Year Academic Project</span>
          </div>
          <div className="text-[11px] text-[#8A9287] font-mono">
            {INSTITUTION_INFO.name} ({INSTITUTION_INFO.academicSession})
          </div>
        </footer>
      </div>

      {/* Global Modals & Notifications */}
      <QuickSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <MainLayout />
    </LibraryProvider>
  );
}
