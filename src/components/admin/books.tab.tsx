interface BooksTabProps {
  books: any[]
  showAddBook: boolean
  setShowAddBook: (show: boolean) => void
  bookForm: any
  setBookForm: (form: any) => void
  onAddBook: (e: React.FormEvent) => void
}

export default function BooksTab({ 
  books, 
  showAddBook, 
  setShowAddBook, 
  bookForm, 
  setBookForm, 
  onAddBook 
}: BooksTabProps) {
  const bookList = Array.isArray(books) ? books : []
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold uppercase tracking-wider text-lg">Book Management</h3>
        <button
          onClick={() => setShowAddBook(!showAddBook)}
          className="px-4 py-2 border-2 hover: hover: font-bold uppercase text-sm transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
        >
          {showAddBook ? 'Cancel' : '+ Add Book'}
        </button>
      </div>

      {showAddBook && (
        <form onSubmit={onAddBook} className="border-4 p-6 space-y-4" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Title *</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Author *</label>
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">ISBN</label>
              <input
                type="text"
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Physical Code *</label>
              <input
                type="text"
                value={bookForm.physical_code}
                onChange={(e) => setBookForm({ ...bookForm, physical_code: e.target.value })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
                required
                placeholder="Unique identifier"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Category</label>
              <input
                type="text"
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Max Reading Days *</label>
              <input
                type="number"
                value={bookForm.max_reading_days}
                onChange={(e) => setBookForm({ ...bookForm, max_reading_days: parseInt(e.target.value) || 14 })}
                className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
                required
                min="1"
                max="365"
                placeholder="14"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>How many days can a user keep this book?</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Description</label>
            <textarea
              value={bookForm.description}
              onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
              className="w-full px-3 py-2 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
              rows={3}
            />
          </div>
          <button type="submit" className="px-6 py-3 border-2 hover: hover: font-bold uppercase transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            Add Book to Library
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookList.slice(0, 12).map((book: any) => (
          <div key={book.id} className="border-2 p-4 hover: transition-all" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-bold uppercase text-sm mb-1 truncate">{book.title}</h4>
            <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{book.author}</p>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className={`px-2 py-1 font-bold uppercase ${
                book.status === 'available' ? 'bg-green-100 text-green-700' :
                book.status === 'reading' ? 'bg-blue-100 text-blue-700' :
                book.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {book.status}
              </span>
              <span className="" style={{ color: 'var(--muted-foreground)' }}>Reads: {book.total_reads}</span>
            </div>
            <div className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
              <span>⏱️</span>
              <span>{book.max_reading_days || 14} days reading period</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
