'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { bookmarksAPI } from '@/lib/api'

export default function MyLibraryPage() {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const { success, error } = useToastStore()
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bookId: string; bookTitle: string; bookmarkType: string }>({
    isOpen: false,
    bookId: '',
    bookTitle: '',
    bookmarkType: ''
  })

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadBookmarks()
    }
  }, [isAuthenticated, _hasHydrated, router])

  const loadBookmarks = async () => {
    try {
      const response = await bookmarksAPI.getAll()
      const bookmarksData = response.data.data || response.data || []
      setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : [])
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
      setBookmarks([])
    }
  }

  const openDeleteModal = (bookId: string, bookTitle: string, bookmarkType: string) => {
    setDeleteModal({ isOpen: true, bookId, bookTitle, bookmarkType })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, bookId: '', bookTitle: '', bookmarkType: '' })
  }

  const confirmDeleteBookmark = async () => {
    const { bookId, bookmarkType } = deleteModal
    closeDeleteModal()
    
    try {
      await bookmarksAPI.delete(bookId, bookmarkType)
      success('Bookmark removed successfully!')
      loadBookmarks()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to remove bookmark')
    }
  }

  const filteredBookmarks = activeTab === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.bookmark_type === activeTab)

  const getTypeIcon = (type: string) => {
    const icons = {
      like: '❤️',
      bookmark: '🔖',
      priority: '⭐'
    }
    return icons[type as keyof typeof icons] || '📚'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      like: 'border-red-400 bg-red-50',
      bookmark: 'border-blue-400 bg-blue-50',
      priority: 'border-yellow-400 bg-yellow-50'
    }
    return colors[type as keyof typeof colors] || 'border-old-border bg-white'
  }

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="absolute top-0 right-0 text-9xl opacity-5">📚</div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📖</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">My Library</h1>
                <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Personal Collection</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">{user.books_received}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Books Read</p>
              </div>
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">{user.books_shared}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Books Shared</p>
              </div>
              <div className="border-2 p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-3xl md:text-4xl font-bold">{bookmarks.length}</p>
                <p className="text-xs uppercase mt-1" style={{ color: 'var(--muted-foreground)' }}>Bookmarked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 border-b-4" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-bold uppercase tracking-wider">Filter by Type</p>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Books', icon: '📚' },
              { key: 'like', label: 'Liked', icon: '❤️' },
              { key: 'bookmark', label: 'Bookmarked', icon: '🔖' },
              { key: 'priority', label: 'Priority', icon: '⭐' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-bold uppercase text-xs tracking-wider transition-all
                  ${activeTab === tab.key
                    ? 'bg-old-ink text-old-paper border-old-ink'
                    : 'bg-white text-old-ink border-old-border hover:border-old-ink'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <span className="px-1.5 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                    {filteredBookmarks.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getTypeIcon(activeTab)}</span>
              <h2 className="text-lg font-bold uppercase tracking-wider">
                {activeTab === 'all' ? 'All Books' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
              {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>

          <div className="p-4">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="text-5xl mb-3 block">📚</span>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>No books in this category</p>
                <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>Start adding books to your library!</p>
                
                {/* Add Books Button */}
                <button
                  onClick={() => router.push('/books')}
                  className="inline-flex items-center justify-center w-20 h-20 border-4 hover: hover: transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] group" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                  title="Browse books"
                >
                  <span className="text-5xl font-bold group-hover:scale-110 transition-transform">+</span>
                </button>
                <p className="text-xs uppercase mt-4 font-bold" style={{ color: 'var(--muted-foreground)' }}>Browse Books</p>
              </div>
            ) : (
              // Table View for All Categories
              <div className="overflow-x-auto">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid md:grid-cols-12 gap-3 pb-2 mb-3 border-b-2 text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-4">Book Title</div>
                  <div className="col-span-3">Author</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {filteredBookmarks.map((bookmark: any) => (
                    <div 
                      key={bookmark.id} 
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 border-2 hover: transition-all bg-gradient-to-r from-white to-gray-50 items-center cursor-pointer" style={{ borderColor: 'var(--border)' }}
                      onClick={() => router.push(`/books/${bookmark.book_id}`)}
                    >
                      {/* Type Icon */}
                      <div className="md:col-span-1">
                        <span className="text-2xl">{getTypeIcon(bookmark.bookmark_type)}</span>
                      </div>

                      {/* Book Title */}
                      <div className="md:col-span-4">
                        <h3 className="font-bold uppercase text-sm truncate">
                          {bookmark.book?.title || 'Unknown Book'}
                        </h3>
                        <span className="text-xs uppercase md:hidden" style={{ color: 'var(--muted-foreground)' }}>
                          {bookmark.book?.author || 'Unknown Author'}
                        </span>
                      </div>

                      {/* Author - Desktop */}
                      <div className="md:col-span-3 hidden md:block">
                        <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {bookmark.book?.author || 'Unknown Author'}
                        </p>
                      </div>

                      {/* Category - Desktop */}
                      <div className="md:col-span-2 hidden md:block">
                        <span className="text-xs truncate block" style={{ color: 'var(--muted-foreground)' }}>
                          {bookmark.book?.category || 'General'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex gap-2 justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/books/${bookmark.book_id}`)
                          }}
                          className="px-3 py-1 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                          title="View book details"
                        >
                          View
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteModal(bookmark.book_id, bookmark.book?.title || 'this book', bookmark.bookmark_type)
                          }}
                          className="px-3 py-1 border-2 border-red-600 text-red-600 font-bold uppercase text-xs
                                   hover:bg-red-600 hover:text-white transition-all"
                          title="Remove bookmark"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Mobile Info */}
                      <div className="md:hidden text-xs flex items-center gap-3" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="uppercase font-bold">{bookmark.bookmark_type}</span>
                        <span>•</span>
                        <span>{bookmark.book?.category || 'General'}</span>
                        {bookmark.priority_level > 0 && (
                          <>
                            <span>•</span>
                            <span>Priority: {bookmark.priority_level}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteBookmark}
        title="Remove Bookmark"
        message={`Are you sure you want to remove "${deleteModal.bookTitle}" from your ${deleteModal.bookmarkType} list? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}
