import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Book } from '../types/library';
import { ConfirmModal } from '../components/common/ConfirmModal';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Filter,
  Layers,
  MapPin,
  Barcode,
  X,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  BookMarked,
  CheckCircle2,
  Users,
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Algorithms & Data Structures',
  'Database Systems',
  'Programming & Software Dev',
  'Networking & Operating Systems',
  'Computer Architecture & Hardware',
  'Web Technologies & Internet Systems',
  'ND Project Monographs & Research',
  'Software Applications',
  'General Studies (GNS)',
];

export const BooksPage: React.FC = () => {
  const { books, loans, addBook, updateBook, deleteBook, addToast } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'available'>('title');

  // Modals & Drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [inspectBorrowersBook, setInspectBorrowersBook] = useState<Book | null>(null);

  // Form State
  const initialForm = {
    title: '',
    author: '',
    isbn: '',
    courseCode: 'COM 222',
    category: 'Algorithms & Data Structures',
    shelfLocation: 'Shelf CS-01',
    publisher: 'Ibadan University Press',
    publicationYear: 2024,
    totalCopies: 5,
    edition: '1st Edition',
    callNumber: 'QA 76.9 .C65 2024',
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter and sort books
  const filteredBooks = books
    .filter((book) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        (book.courseCode && book.courseCode.toLowerCase().includes(q)) ||
        book.shelfLocation.toLowerCase().includes(q) ||
        book.callNumber.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All Categories' || book.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = book.availableCopies > 0;
      if (stockFilter === 'low') matchesStock = book.availableCopies > 0 && book.availableCopies <= 2;
      if (stockFilter === 'out') matchesStock = book.availableCopies === 0;

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return b.publicationYear - a.publicationYear;
      if (sortBy === 'available') return b.availableCopies - a.availableCopies;
      return 0;
    });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author name is required';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required';
    if (!formData.shelfLocation.trim()) errors.shelfLocation = 'Shelf location is required';
    if (!formData.callNumber.trim()) errors.callNumber = 'Call number / Classification is required';
    if (formData.totalCopies < 1) errors.totalCopies = 'Must have at least 1 copy';
    if (formData.publicationYear < 1950 || formData.publicationYear > 2030) {
      errors.publicationYear = 'Invalid publication year';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      courseCode: book.courseCode || 'COM 111',
      category: book.category,
      shelfLocation: book.shelfLocation,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      totalCopies: book.totalCopies,
      edition: book.edition || '1st Edition',
      callNumber: book.callNumber,
      description: book.description || '',
    });
    setFormErrors({});
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingBook) {
      // Calculate adjusted available copies if total was changed
      const diff = formData.totalCopies - editingBook.totalCopies;
      const newAvailable = Math.max(0, editingBook.availableCopies + diff);

      updateBook(editingBook.id, {
        ...formData,
        availableCopies: newAvailable,
      });
      setEditingBook(null);
    } else {
      addBook(formData);
      setIsAddOpen(false);
    }
  };

  // Find active borrowers for a book
  const currentBorrowers = inspectBorrowersBook
    ? loans.filter(
        (l) =>
          l.bookId === inspectBorrowersBook.id &&
          (l.status === 'Active' || l.status === 'Overdue')
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E5E4DE]">
        <div>
          <div className="text-xs font-mono text-[#5A6258] uppercase tracking-wider">
            Collection Management
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#202721] tracking-tight mt-1">
            Course Textbooks & Research Monographs
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6258] mt-1">
            Departmental cataloguing desk · {books.length} registered titles · Showing {filteredBooks.length} items
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-3 rounded-md border border-[#E5E4DE] shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9287] stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, course code (e.g. COM 211), ISBN..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] hover:bg-[#F2F0E8] focus:bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] focus:ring-1 focus:ring-[#245747] transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer"
          >
            <option value="all">All Copies Status</option>
            <option value="in_stock">Available in Stock</option>
            <option value="low">Low Stock (≤ 2 left)</option>
            <option value="out">Checked Out (0 left)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-white text-[#202721] rounded-md border border-[#E5E4DE] focus:outline-none focus:border-[#245747] cursor-pointer font-mono"
          >
            <option value="title">Sort: Title (A-Z)</option>
            <option value="year">Sort: Year (Newest)</option>
            <option value="available">Sort: Available Copies</option>
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
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#202721] shadow-2xs font-semibold'
                  : 'text-[#5A6258] hover:text-[#202721]'
              }`}
              title="Shelf Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-md border border-[#E5E4DE] p-12 text-center">
          <BookOpen className="w-8 h-8 text-[#8A9287] mx-auto mb-2 stroke-[1.75]" />
          <h3 className="font-serif text-base font-semibold text-[#202721]">
            No Curriculum Books Found
          </h3>
          <p className="text-xs text-[#5A6258] mt-1 max-w-sm mx-auto">
            No textbooks match your current filter criteria. Try adjusting the search term or category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setStockFilter('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs text-[#245747] bg-[#EAF0EC] hover:bg-[#d8e5dc] rounded-md font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Editorial Table */
        <div className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F7F6F2] border-b border-[#E5E4DE] text-[10px] font-mono uppercase tracking-wider text-[#8A9287]">
                  <th className="py-2.5 px-4 font-semibold">Title & Author</th>
                  <th className="py-2.5 px-4 font-semibold">Classification & Shelf</th>
                  <th className="py-2.5 px-4 font-semibold">Curriculum Category</th>
                  <th className="py-2.5 px-4 font-semibold">Stock Availability</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DE]">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  const isLow = book.availableCopies > 0 && book.availableCopies <= 2;
                  const activeLoanCount = book.totalCopies - book.availableCopies;

                  return (
                    <tr key={book.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Title & Author */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-serif font-medium text-sm text-[#202721] line-clamp-1">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-[#5A6258] mt-0.5">
                          {book.author} · <span className="font-mono text-[10px] text-[#8A9287]">{book.publicationYear}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {book.courseCode && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                              {book.courseCode}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-[#8A9287]">
                            ISBN: {book.isbn}
                          </span>
                        </div>
                      </td>

                      {/* Shelf & Call Number */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#202721] flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#245747] stroke-[1.75]" />
                          <span>{book.shelfLocation}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#5A6258] mt-0.5">
                          {book.callNumber}
                        </div>
                        {book.edition && (
                          <div className="text-[10px] text-[#8A9287]">
                            {book.edition}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-[#202721] font-medium block truncate max-w-[180px]">
                          {book.category}
                        </span>
                        <span className="text-[10px] text-[#5A6258] block truncate max-w-[180px]">
                          {book.publisher}
                        </span>
                      </td>

                      {/* Stock Fraction & Progress */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#202721]">
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                          <span className="text-[10px] text-[#5A6258]">available</span>
                        </div>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                            className={`h-full rounded-full ${
                              book.availableCopies === 0
                                ? 'bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-[#245747]'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {book.availableCopies === 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Checked Out
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingBook(book)}
                            title="View bibliographic record"
                            className="p-1 text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                          </button>

                          {activeLoanCount > 0 && (
                            <button
                              onClick={() => setInspectBorrowersBook(book)}
                              title={`Inspect ${activeLoanCount} active borrowers`}
                              className="p-1 text-[#245747] hover:bg-[#EAF0EC] rounded"
                            >
                              <Users className="w-3.5 h-3.5 stroke-[1.75]" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(book)}
                            title="Edit book details"
                            className="p-1 text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                          >
                            <Edit className="w-3.5 h-3.5 stroke-[1.75]" />
                          </button>

                          <button
                            onClick={() => setDeletingBook(book)}
                            title="Remove title from catalogue"
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
        /* Shelf Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const isLow = book.availableCopies > 0 && book.availableCopies <= 2;
            const activeLoanCount = book.totalCopies - book.availableCopies;

            return (
              <div
                key={book.id}
                className="bg-white rounded-md border border-[#E5E4DE] shadow-2xs p-4 flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#5A6258] pb-2 border-b border-[#E5E4DE]">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {book.courseCode || 'COM 111'}
                    </span>
                    <span className="font-mono text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#245747] stroke-[1.75]" />
                      <span>{book.shelfLocation}</span>
                    </span>
                  </div>

                  <h3 className="font-serif font-medium text-base text-[#202721] mt-2.5 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#5A6258] mt-1">
                    {book.author} · {book.publicationYear}
                  </p>

                  <div className="text-[11px] text-[#8A9287] font-mono mt-2">
                    Call: {book.callNumber}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#E5E4DE] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#202721]">
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                    <span className="text-[11px] text-[#5A6258] ml-1">in stock</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingBook(book)}
                      className="px-2 py-1 text-[11px] text-[#5A6258] hover:text-[#202721] hover:bg-stone-100 rounded"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenEdit(book)}
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

      {/* Add / Edit Book Modal */}
      {(isAddOpen || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#202721]">
                  {editingBook ? 'Edit Book Record' : 'Accession New Curriculum Text'}
                </h3>
                <p className="text-xs text-[#5A6258]">
                  Federal Polytechnic Ede · Department of Computer Science
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingBook(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Data Structures and Algorithm Analysis in C++"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                />
                {formErrors.title && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Primary Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Mark Allen Weiss"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  />
                  {formErrors.author && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.author}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Course Code (NBTE Curriculum)
                  </label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="e.g. COM 211, COM 222, COM 299"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="e.g. 978-0134460789"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                  />
                  {formErrors.isbn && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.isbn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Call Classification Number *
                  </label>
                  <input
                    type="text"
                    value={formData.callNumber}
                    onChange={(e) => setFormData({ ...formData, callNumber: e.target.value })}
                    placeholder="e.g. QA 76.73 .C153 2024"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                  />
                  {formErrors.callNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.callNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Discipline Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Shelf Location *
                  </label>
                  <input
                    type="text"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    placeholder="e.g. Shelf CS-02 (South Wing)"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Total Copies *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={formData.publicationYear}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 2024 })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202721] mb-1">
                    Edition
                  </label>
                  <input
                    type="text"
                    value={formData.edition}
                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                    placeholder="e.g. 4th Edition"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202721] mb-1">
                  Publisher / Press
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="e.g. Pearson Higher Education / Ibadan University Press"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E4DE] rounded-md focus:outline-none focus:border-[#245747]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E4DE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-[#5A6258] hover:text-[#202721] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-[#245747] hover:bg-[#1B4236] text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  {editingBook ? 'Save Changes' : 'Accession Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bibliographic Detail Modal */}
      {viewingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A9287]">
                  Bibliographic Card
                </span>
                <h3 className="font-serif text-base font-semibold text-[#202721]">
                  {viewingBook.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingBook(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Author</span>
                  <span className="text-[#202721] font-medium">{viewingBook.author}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Course Code</span>
                  <span className="text-[#202721] font-mono font-medium">{viewingBook.courseCode || 'COM'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Shelf Location</span>
                  <span className="text-[#202721] font-medium">{viewingBook.shelfLocation}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Call Number</span>
                  <span className="text-[#202721] font-mono">{viewingBook.callNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">ISBN</span>
                  <span className="text-[#202721] font-mono">{viewingBook.isbn}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8A9287] block">Discipline</span>
                  <span className="text-[#202721]">{viewingBook.category}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F6F2] rounded-md border border-[#E5E4DE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8A9287] block">Inventory Status</span>
                  <span className="font-mono text-sm font-semibold text-[#202721]">
                    {viewingBook.availableCopies} available of {viewingBook.totalCopies} physical copies
                  </span>
                </div>
                <button
                  onClick={() => {
                    setInspectBorrowersBook(viewingBook);
                    setViewingBook(null);
                  }}
                  className="text-xs font-medium text-[#245747] hover:underline"
                >
                  View Borrowers →
                </button>
              </div>
            </div>

            <div className="p-3 border-t border-[#E5E4DE] bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setViewingBook(null)}
                className="px-3 py-1.5 text-xs text-[#202721] bg-white border border-[#E5E4DE] rounded-md hover:bg-stone-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Borrowers Modal */}
      {inspectBorrowersBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202721]/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-[#E5E4DE] max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-[#E5E4DE] bg-[#F7F6F2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8A9287]">
                  Active Loan Audit
                </span>
                <h3 className="font-serif text-base font-semibold text-[#202721] line-clamp-1">
                  Borrowers: {inspectBorrowersBook.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectBorrowersBook(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto divide-y divide-[#E5E4DE]">
              {currentBorrowers.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#5A6258]">
                  All copies of this title are currently resting on shelf.
                </div>
              ) : (
                currentBorrowers.map((loan) => (
                  <div key={loan.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="font-medium text-[#202721]">
                        {loan.studentName}
                      </div>
                      <div className="text-[11px] text-[#5A6258] font-mono">
                        {loan.studentMatricNo} ({loan.studentLevel})
                      </div>
                      <div className="text-[10px] text-[#8A9287] mt-0.5 font-mono">
                        Issued: {loan.issueDate} · Due: {loan.dueDate}
                      </div>
                    </div>
                    <div>
                      {loan.status === 'Overdue' ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Overdue (₦{loan.fineAmount})
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EAF0EC] text-[#1B4236] border border-[#245747]/20">
                          On Loan
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[#E5E4DE] bg-stone-50 flex items-center justify-end">
              <button
                onClick={() => setInspectBorrowersBook(null)}
                className="px-3 py-1.5 text-xs text-[#202721] bg-white border border-[#E5E4DE] rounded-md hover:bg-stone-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBook}
        title="Remove Textbook from Catalogue?"
        message={`Are you sure you want to remove "${deletingBook?.title}" from the departmental library? This record will be decommissioned.`}
        confirmLabel="Remove Title"
        isDestructive={true}
        onConfirm={() => {
          if (deletingBook) deleteBook(deletingBook.id);
          setDeletingBook(null);
        }}
        onCancel={() => setDeletingBook(null)}
      />
    </div>
  );
};
