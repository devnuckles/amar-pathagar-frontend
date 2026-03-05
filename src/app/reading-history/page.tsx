'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { booksAPI } from '@/lib/api'

export default function ReadingHistoryPage() {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [history, setHistory] = useState<any[]>([])
  const [holdingBooks, setHoldingBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'reading'>('all')

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadHistory()
      loadHoldingBooks()
    }
  }, [isAuthenticated, _hasHydrated, router])

  const loadHistory = async () => {
    try {
      const response = await booksAPI.getMyReadingHistory()
      const historyData = response.data.data || response.data || []
      setHistory(Array.isArray(historyData) ? historyData : [])
    } catch (error) {
      console.error('Failed to load reading history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  const loadHoldingBooks = async () => {
    try {
      const response = await booksAPI.getMyBooksOnHold()
      const booksData = response.data.data || response.data || []
      setHoldingBooks(Array.isArray(booksData) ? booksData : [])
    } catch (error) {
      console.error('Failed to load holding books:', error)
      setHoldingBooks([])
    }
  }

  const filteredHistory = history.filter(h => {
    if (filter === 'completed') return h.end_date
    if (filter === 'reading') return !h.end_date
    return true
  })

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute top-0 right-0 text-9xl opacity-5">📚</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📖</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">Reading History</h1>
                <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Your Literary Journey</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">{history.length}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Total Books</p>
              </div>
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">
                  {history.filter(h => h.end_date).length}
                </p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Completed</p>
              </div>
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">
                  {history.filter(h => !h.end_date).length}
                </p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Reading</p>
              </div>
              <div className="border-2 bg-yellow-100 p-4 text-center" style={{ borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">{holdingBooks.length}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Holding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Currently Holding Section */}
        {holdingBooks.length > 0 && (
          <div className="border-4 border-yellow-600 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-[6px_6px_0px_0px_rgba(202,138,4,0.3)]">
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white p-4 border-b-4 border-yellow-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <h2 className="text-xl font-bold uppercase tracking-wider">Currently Holding</h2>
              </div>
              <span className="px-3 py-1 text-yellow-600 text-xs font-bold rounded" style={{ backgroundColor: 'var(--card)' }}>
                {holdingBooks.length}
              </span>
            </div>

            <div className="p-4">
              <p className="text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                Books you've completed and are holding until someone requests them
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holdingBooks.map((book: any) => (
                  <div
                    key={book.id}
                    className="border-2 border-yellow-600 p-4 transition-all cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(202,138,4,0.3)] hover:border-yellow-700" style={{ backgroundColor: 'var(--card)' }}
                    onClick={() => router.push(`/books/${book.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">📖</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold uppercase text-sm mb-1 truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                          {book.author}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 border border-yellow-600 text-yellow-700 text-xs font-bold uppercase">
                            On Hold
                          </span>
                          {book.category && (
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {book.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Books', icon: '📚' },
              { key: 'completed', label: 'Completed', icon: '✓' },
              { key: 'reading', label: 'Currently Reading', icon: '📖' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-bold uppercase text-xs tracking-wider transition-all
                  ${filter === tab.key
                    ? 'bg-old-ink text-old-paper border-old-ink'
                    : 'bg-white text-old-ink border-old-border hover:border-old-ink'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-4 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold uppercase tracking-wider">
              {filter === 'all' ? 'All Books' : filter === 'completed' ? 'Completed Books' : 'Currently Reading'}
            </h2>
            <span className="px-2 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
              {filteredHistory.length}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="text-5xl mb-3 block">📚</span>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>No books in this category</p>
                <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>Start your reading journey!</p>
                <button
                  onClick={() => router.push('/books')}
                  className="px-6 py-3 border-4 hover:bg-gray-800 font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                >
                  Browse Books
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item: any) => {
                  const duration = calculateDuration(item.start_date, item.end_date)
                  const isCompleted = !!item.end_date

                  return (
                    <div
                      key={item.id}
                      className={`border-2 p-4 transition-all cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]
                        ${isCompleted 
                          ? 'border-green-200 bg-gradient-to-r from-green-50 to-white hover:border-green-600' 
                          : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white hover:border-blue-600'
                        }`}
                      onClick={() => router.push(`/books/${item.book_id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{isCompleted ? '✓' : '📖'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold uppercase text-lg mb-1 truncate">
                            {item.book?.title || 'Unknown Book'}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                            {item.book?.author || 'Unknown Author'}
                          </p>

                          {/* Timeline */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="border-l-4 pl-3" style={{ borderColor: 'var(--border)' }}>
                              <p className="uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Started</p>
                              <p className="font-mono">
                                {new Date(item.start_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>

                            {isCompleted && (
                              <div className="border-l-4 border-green-600 pl-3">
                                <p className="uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Completed</p>
                                <p className="font-mono">
                                  {new Date(item.end_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}

                            <div className={`border-l-4 pl-3 ${isCompleted ? 'border-green-600' : 'border-blue-600'}`}>
                              <p className="uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Duration</p>
                              <p className="font-mono">
                                {duration} {duration === 1 ? 'day' : 'days'}
                                {!isCompleted && ' (ongoing)'}
                              </p>
                            </div>
                          </div>

                          {/* Rating & Notes */}
                          {item.rating && (
                            <div className="mt-3 pt-3 border-t-2" style={{ borderColor: 'var(--border)' }}>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-500">{'⭐'.repeat(item.rating)}</span>
                                <span className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>
                                  {item.rating}/5 Rating
                                </span>
                              </div>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-2 p-3 border-2" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                              <p className="text-xs uppercase font-bold mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
