import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Search, BookOpen, User, ArrowRight, X } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook?: (bookId: string) => void;
  onSelectStudent?: (studentId: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  onSelectStudent,
}) => {
  const { books, students, setActivePage, isAdmin, isStudent } = useLibrary();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const filteredBooks = cleanQ
    ? books
        .filter(
          (b) =>
            b.title.toLowerCase().includes(cleanQ) ||
            b.author.toLowerCase().includes(cleanQ) ||
            b.isbn.toLowerCase().includes(cleanQ) ||
            (b.courseCode && b.courseCode.toLowerCase().includes(cleanQ)) ||
            b.category.toLowerCase().includes(cleanQ)
        )
        .slice(0, 5)
    : [];

  // Students must NEVER see other students' profiles or directory
  const filteredStudents = cleanQ && isAdmin
    ? students
        .filter(
          (s) =>
            s.fullName.toLowerCase().includes(cleanQ) ||
            s.matricNo.toLowerCase().includes(cleanQ) ||
            s.department.toLowerCase().includes(cleanQ)
        )
        .slice(0, 5)
    : [];

  const handleBookClick = (bookId: string) => {
    if (isStudent) {
      setActivePage('student-catalog');
    } else {
      setActivePage('books');
    }
    if (onSelectBook) onSelectBook(bookId);
    onClose();
  };

  const handleStudentClick = (studentId: string) => {
    if (isAdmin) {
      setActivePage('students');
      if (onSelectStudent) onSelectStudent(studentId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-lg shadow-2xl border border-[#E5E4DE] max-w-xl w-full overflow-hidden animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E5E4DE] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#8A9287] shrink-0 stroke-[1.75]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAdmin
                ? "Search textbook title, author, course code (COM 211), student name or matric..."
                : "Search Computer Science textbooks, course codes (e.g. COM 211), authors..."
            }
            className="flex-1 text-xs text-[#202721] bg-transparent focus:outline-none placeholder:text-stone-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-200"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#E5E4DE]">
          {!cleanQ ? (
            <div className="p-8 text-center text-xs text-[#5A6258]">
              <p>
                {isAdmin
                  ? "Type to search the Computer Science collection and reader registry."
                  : "Type to search the departmental library catalogue."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  COM 211
                </span>
                {isAdmin && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                    FPE/CS/23/048
                  </span>
                )}
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  Data Structures
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                  COM 222
                </span>
              </div>
            </div>
          ) : filteredBooks.length === 0 && filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5A6258]">
              No materials or students matched <span className="font-semibold text-[#202721]">"{query}"</span>.
            </div>
          ) : (
            <div className="p-2 space-y-3">
              {/* Books */}
              {filteredBooks.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                    Curriculum Textbooks ({filteredBooks.length})
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredBooks.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleBookClick(b.id)}
                        className="w-full text-left p-2 rounded-md hover:bg-stone-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-[#245747] shrink-0 stroke-[1.75]" />
                          <div className="min-w-0">
                            <div className="font-serif font-medium text-[#202721] truncate">
                              {b.title}
                            </div>
                            <div className="text-[10px] text-[#5A6258] mt-0.5 font-mono">
                              {b.courseCode || 'COM'} · {b.shelfLocation} · {b.availableCopies} available
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#245747] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Students */}
              {filteredStudents.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                    Student Readers ({filteredStudents.length})
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleStudentClick(s.id)}
                        className="w-full text-left p-2 rounded-md hover:bg-stone-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <User className="w-3.5 h-3.5 text-[#245747] shrink-0 stroke-[1.75]" />
                          <div className="min-w-0">
                            <div className="font-medium text-[#202721] truncate">
                              {s.fullName}
                            </div>
                            <div className="text-[10px] font-mono text-[#5A6258] mt-0.5">
                              {s.matricNo} · {s.level} · {s.department}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#245747] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
