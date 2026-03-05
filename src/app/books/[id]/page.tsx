'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { booksAPI, ideasAPI, reviewsAPI } from '@/lib/api'
import { handoverAPI } from '@/lib/handoverApi'
import ConfirmModal from '@/components/ConfirmModal'

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const { success, error, warning } = useToastStore()
  const [book, setBook] = useState<any>(null)
  const [ideas, setIdeas] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [ideaForm, setIdeaForm] = useState({ title: '', content: '' })
  const [isRequested, setIsRequested] = useState(false)
  const [readingStatus, setReadingStatus] = useState<any>(null)
  const [handoverThread, setHandoverThread] = useState<any>(null)
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(true)
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(true)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    confirmColor?: 'red' | 'green' | 'blue' | 'orange'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && params.id) {
      loadBook()
      loadIdeas()
      loadReviews()
      checkIfRequested()
      loadReadingStatus()
      loadHandoverThread()
    }
  }, [isAuthenticated, _hasHydrated, params.id, router])

  const loadBook = async () => {
    try {
      const response = await booksAPI.getById(params.id as string)
      setBook(response.data.data || response.data)
    } catch (error) {
      console.error('Failed to load book:', error)
    }
  }

  const checkIfRequested = async () => {
    try {
      const response = await booksAPI.checkRequested(params.id as string)
      setIsRequested(response.data.data?.requested || response.data.requested || false)
    } catch (error) {
      console.error('Failed to check request status:', error)
    }
  }

  const loadReadingStatus = async () => {
    try {
      const response = await handoverAPI.getReadingStatus(params.id as string)
      setReadingStatus(response.data.data || response.data)
    } catch (error) {
      // Not the current holder, ignore
      setReadingStatus(null)
    }
  }

  const loadHandoverThread = async () => {
    try {
      const response = await handoverAPI.getActiveHandoverThread(params.id as string)
      setHandoverThread(response.data.data || response.data)
    } catch (error) {
      setHandoverThread(null)
    }
  }

  const handleMarkCompleted = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Mark as Completed',
      message: 'Mark this book as reading completed? This will prepare it for handover.',
      confirmText: 'Mark Completed',
      confirmColor: 'green',
      onConfirm: async () => {
        try {
          await handoverAPI.markBookCompleted(params.id as string)
          success('Book marked as completed!')
          loadReadingStatus()
          loadHandoverThread()
        } catch (err: any) {
          error(err.response?.data?.error || 'Failed to mark book as completed')
        }
      }
    })
  }

  const handleMarkDelivered = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Delivery',
      message: 'Confirm that you have received this book?',
      confirmText: 'Confirm Delivery',
      confirmColor: 'green',
      onConfirm: async () => {
        try {
          await handoverAPI.markBookDelivered(params.id as string)
          success('Book marked as delivered!')
          loadReadingStatus()
          loadHandoverThread()
          loadBook()
        } catch (err: any) {
          error(err.response?.data?.error || 'Failed to mark book as delivered')
        }
      }
    })
  }

  const loadIdeas = async () => {
    try {
      const response = await ideasAPI.getByBook(params.id as string)
      const ideasData = response.data.data || response.data || []
      setIdeas(Array.isArray(ideasData) ? ideasData : [])
    } catch (error) {
      console.error('Failed to load ideas:', error)
      setIdeas([])
    }
  }

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByBook(params.id as string)
      const reviewsData = response.data.data || response.data || []
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setReviews([])
    }
  }

  const handleRequest = async () => {
    if (!user || user.success_score < 20) {
      warning('Your success score must be at least 20 to request books.')
      return
    }
    try {
      await booksAPI.request(params.id as string)
      success('Book requested successfully!')
      setIsRequested(true)
      loadBook()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to request book')
    }
  }

  const handleCancelRequest = async () => {
    try {
      await booksAPI.cancelRequest(params.id as string)
      success('Request cancelled successfully!')
      setIsRequested(false)
      loadBook()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to cancel request')
    }
  }

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await ideasAPI.create({
        book_id: params.id as string,
        ...ideaForm,
      })
      setIdeaForm({ title: '', content: '' })
      setShowIdeaForm(false)
      loadIdeas()
      success('Idea posted! +3 points')
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to post idea')
    }
  }

  const handleVote = async (ideaId: string, voteType: 'upvote' | 'downvote') => {
    try {
      await ideasAPI.vote(ideaId, voteType)
      success('Vote recorded!')
      loadIdeas()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to vote')
    }
  }

  if (!_hasHydrated || !isAuthenticated || !book) {
    return null
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-600',
      reading: 'bg-blue-600',
      requested: 'bg-orange-600',
      on_hold: 'bg-yellow-600',
    }
    return colors[status as keyof typeof colors] || colors.available
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/books')}
          className="flex items-center gap-2 px-4 py-2 border-2 hover: hover: transition-all text-sm font-bold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
        >
          ← Back to Collection
        </button>

        {/* Book Card - Retro Library Card Style */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <div className="text-9xl">📚</div>
          </div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Book Cover - Compact */}
              <div className="md:col-span-3">
                <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] relative" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="aspect-[3/4] bg-old-border flex items-center justify-center">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-7xl">📖</span>
                    )}
                  </div>
                  {/* Status Badge */}
                  <div className={`${getStatusColor(book.status)} text-white text-center py-2 font-bold uppercase text-sm tracking-wider`}>
                    {book.status}
                  </div>
                </div>
              </div>

              {/* Book Information - Library Card Style */}
              <div className="md:col-span-9 space-y-4">
                {/* Title Section */}
                <div className="border-b-4 pb-4" style={{ borderColor: 'var(--border)' }}>
                  <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-2 leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-lg md:text-xl uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    by {book.author}
                  </p>
                </div>

                {/* Metadata Grid - Retro Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Reads</p>
                    <p className="text-2xl font-bold">{book.total_reads}</p>
                  </div>
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Rating</p>
                    <p className="text-2xl font-bold">
                      {book.average_rating > 0 ? `★ ${book.average_rating.toFixed(1)}` : 'N/A'}
                    </p>
                  </div>
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Category</p>
                    <p className="text-sm font-bold uppercase truncate">{book.category || 'General'}</p>
                  </div>
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Reading Period</p>
                    <p className="text-2xl font-bold">{book.max_reading_days || 14}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>days</p>
                  </div>
                </div>

                {/* ISBN Row */}
                {book.isbn && (
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1 font-bold" style={{ color: 'var(--muted-foreground)' }}>ISBN</p>
                    <p className="text-sm font-bold">{book.isbn}</p>
                  </div>
                )}

                {/* Description */}
                {book.description && (
                  <div className="border-2 p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-2 font-bold" style={{ color: 'var(--muted-foreground)' }}>Description</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{book.description}</p>
                  </div>
                )}

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 border-2 text-xs uppercase font-bold" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {isRequested ? (
                    <>
                      <div className="flex-1 p-3 border-4 border-green-600 bg-green-50 text-center">
                        <p className="text-lg font-bold uppercase text-green-700 tracking-wider">
                          ✓ Requested
                        </p>
                      </div>
                      <button 
                        onClick={handleCancelRequest}
                        className="px-6 py-3 border-2 border-red-600 text-red-600 font-bold uppercase text-sm
                                 hover:bg-red-600 hover:text-white transition-all"
                      >
                        Cancel Request
                      </button>
                    </>
                  ) : book.status === 'available' || book.status === 'on_hold' ? (
                    <button 
                      onClick={handleRequest} 
                      className="flex-1 px-6 py-3 border-2 font-bold uppercase text-sm hover: hover: transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                    >
                      Request This Book
                    </button>
                  ) : book.status === 'reading' && book.current_holder_id === user?.id ? (
                    <button
                      onClick={handleMarkCompleted}
                      className="flex-1 px-6 py-3 border-2 border-green-600 bg-green-600 text-white 
                               hover:bg-green-700 font-bold uppercase text-sm tracking-wider transition-all"
                    >
                      ✓ Mark as Completed
                    </button>
                  ) : null}
                </div>

                {/* Current Holder */}
                {book.current_holder && (
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1 font-bold" style={{ color: 'var(--muted-foreground)' }}>Currently With</p>
                    <p className="text-sm font-bold">{book.current_holder.full_name || book.current_holder.username}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Handover Status Section - Only show if book is reading or requested */}
        {(readingStatus || handoverThread) && book.status !== 'available' && (
          <div className="border-4 border-blue-600 shadow-[6px_6px_0px_0px_rgba(37,99,235,0.3)]" style={{ backgroundColor: 'var(--card)' }}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 border-b-4 border-blue-600 flex items-center gap-2">
              <span className="text-xl">🔄</span>
              <h2 className="text-xl font-bold uppercase tracking-wider">Book Handover Status</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Reading Status for Current Holder */}
              {readingStatus && (
                <div className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold uppercase text-sm mb-2 flex items-center gap-2">
                        <span className="text-xl">📖</span>
                        Your Reading Status
                      </h3>
                      <div className="space-y-2 text-sm">
                        {readingStatus.due_date && (
                          <div className="flex items-center gap-2">
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Due Date:</span>
                            <span className="font-bold">
                              {new Date(readingStatus.due_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {new Date(readingStatus.due_date) < new Date() && (
                              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold uppercase">
                                Overdue
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="" style={{ color: 'var(--muted-foreground)' }}>Status:</span>
                          <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
                            readingStatus.is_completed 
                              ? 'bg-green-600 text-white' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            {readingStatus.is_completed ? 'Completed' : 'Reading'}
                          </span>
                        </div>
                        {readingStatus.delivery_status && (
                          <div className="flex items-center gap-2">
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Delivery:</span>
                            <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
                              readingStatus.delivery_status === 'delivered' 
                                ? 'bg-green-600 text-white'
                                : readingStatus.delivery_status === 'in_transit'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-600 text-white'
                            }`}>
                              {readingStatus.delivery_status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {readingStatus.next_reader && (
                          <div className="flex items-center gap-2">
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Next Reader:</span>
                            <span className="font-bold">
                              {readingStatus.next_reader.full_name || readingStatus.next_reader.username}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {!readingStatus.is_completed && (
                      <button
                        onClick={handleMarkCompleted}
                        className="px-4 py-2 border-2 border-green-600 bg-green-600 text-white 
                                 hover:bg-green-700 font-bold uppercase text-xs tracking-wider transition-all"
                      >
                        ✓ Mark as Completed
                      </button>
                    )}
                    {readingStatus.is_completed && readingStatus.delivery_status === 'not_started' && (
                      <div className="px-4 py-2 border-2 border-orange-600 bg-orange-50 text-orange-700 
                                    font-bold uppercase text-xs tracking-wider">
                        ⏳ Waiting for handover coordination
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Next Reader Status */}
              {!readingStatus && handoverThread && handoverThread.next_holder_id === user?.id && (
                <div className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white p-4">
                  <h3 className="font-bold uppercase text-sm mb-3 flex items-center gap-2">
                    <span className="text-xl">📬</span>
                    You're Next in Line!
                  </h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span className="" style={{ color: 'var(--muted-foreground)' }}>Current Holder:</span>
                      <span className="font-bold">
                        {handoverThread.current_holder?.full_name || handoverThread.current_holder?.username || 'Book Owner'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="" style={{ color: 'var(--muted-foreground)' }}>Delivery Status:</span>
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase ${
                        handoverThread.delivery_status === 'in_transit'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {handoverThread.delivery_status?.replace('_', ' ') || 'Not Started'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleMarkDelivered}
                    className="px-4 py-2 border-2 border-green-600 bg-green-600 text-white 
                             hover:bg-green-700 font-bold uppercase text-xs tracking-wider transition-all"
                  >
                    ✓ Confirm Delivery Received
                  </button>
                </div>
              )}

              {/* Current Holder Status (for admin/owner sending book) */}
              {!readingStatus && handoverThread && handoverThread.current_holder_id === user?.id && (
                <div className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white p-4">
                  <h3 className="font-bold uppercase text-sm mb-3 flex items-center gap-2">
                    <span className="text-xl">📤</span>
                    Sending Book
                  </h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span className="" style={{ color: 'var(--muted-foreground)' }}>Sending To:</span>
                      <span className="font-bold">
                        {handoverThread.next_holder?.full_name || handoverThread.next_holder?.username || 'Reader'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="" style={{ color: 'var(--muted-foreground)' }}>Status:</span>
                      <span className="px-2 py-0.5 text-xs font-bold uppercase bg-orange-600 text-white">
                        Waiting for delivery confirmation
                      </span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Please coordinate with the reader via the handover thread to arrange delivery.
                  </p>
                </div>
              )}

              {/* Handover Thread Link */}
              {handoverThread && handoverThread.id && (
                <div className="border-2 p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold uppercase text-sm mb-1 flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        Handover Coordination Thread
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Coordinate the book handover with the other party
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/handover/${handoverThread.id}`)}
                      className="px-4 py-2 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                    >
                      Open Thread →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book Reviews Section */}
        {reviews.length > 0 && (
          <div className="border-4 border-purple-600 shadow-[6px_6px_0px_0px_rgba(147,51,234,0.3)]" style={{ backgroundColor: 'var(--card)' }}>
            <button
              onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white p-3 border-b-4 border-purple-600 flex items-center justify-between hover:from-purple-700 hover:to-purple-900 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h2 className="text-lg font-bold uppercase tracking-wider">Reader Reviews</h2>
                <span className="px-2 py-0.5 text-purple-600 text-xs font-bold" style={{ backgroundColor: 'var(--card)' }}>
                  {reviews.length}
                </span>
              </div>
              <span className="text-xl transition-transform duration-200" style={{ transform: isReviewsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>

            {isReviewsExpanded && (
              <div className="p-4 space-y-3">
                {reviews.slice(0, 3).map((review) => {
                  const ratings = [
                    review.behavior_rating,
                    review.book_condition_rating,
                    review.communication_rating
                  ].filter(r => r != null)
                  const avgRating = ratings.length > 0 
                    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
                    : 0

                  return (
                    <div key={review.id} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white p-3">
                      {/* Compact Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border-2 border-purple-600 bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">👤</span>
                          </div>
                          <div>
                            <p className="font-bold text-xs">
                              {review.reviewer?.full_name || review.reviewer?.username || 'Anonymous'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {avgRating.toFixed(1)}
                          </div>
                          <div className="text-xs">
                            {'⭐'.repeat(Math.round(avgRating))}
                          </div>
                        </div>
                      </div>

                      {/* Compact Rating Pills */}
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {review.behavior_rating && (
                          <span className="px-2 py-1 border border-purple-200 text-xs" style={{ backgroundColor: 'var(--card)' }}>
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Behavior:</span> <span className="font-bold text-purple-600">{review.behavior_rating}/5</span>
                          </span>
                        )}
                        {review.book_condition_rating && (
                          <span className="px-2 py-1 border border-purple-200 text-xs" style={{ backgroundColor: 'var(--card)' }}>
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Condition:</span> <span className="font-bold text-purple-600">{review.book_condition_rating}/5</span>
                          </span>
                        )}
                        {review.communication_rating && (
                          <span className="px-2 py-1 border border-purple-200 text-xs" style={{ backgroundColor: 'var(--card)' }}>
                            <span className="" style={{ color: 'var(--muted-foreground)' }}>Communication:</span> <span className="font-bold text-purple-600">{review.communication_rating}/5</span>
                          </span>
                        )}
                      </div>

                      {/* Compact Comment */}
                      {review.comment && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  )
                })}

                {/* See More Button */}
                {reviews.length > 3 && (
                  <button
                    className="w-full px-4 py-2 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white 
                             font-bold uppercase text-xs tracking-wider transition-all"
                  >
                    See All {reviews.length} Reviews →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reading Ideas Section - Thread View */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <button
            onClick={() => setIsDiscussionExpanded(!isDiscussionExpanded)}
            className="w-full bg-gradient-to-r from-old-ink to-gray-800 p-4 border-b-4 flex items-center justify-between hover:from-gray-800 hover:to-black transition-all" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h2 className="text-xl font-bold uppercase tracking-wider">Discussion Thread</h2>
              <span className="px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                {ideas.length} {ideas.length === 1 ? 'Post' : 'Posts'}
              </span>
            </div>
            <span className="text-xl transition-transform duration-200" style={{ transform: isDiscussionExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>

          {isDiscussionExpanded && (
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <button
                  onClick={() => setShowIdeaForm(!showIdeaForm)}
                  className="w-full px-4 py-2 border-2 font-bold uppercase text-xs hover: hover: transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                >
                  {showIdeaForm ? 'Cancel' : '+ New Post'}
                </button>
              </div>

              {showIdeaForm && (
                <div className="mb-6 border-2 p-4" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-2xl">✍️</span>
                    <p className="font-bold uppercase text-sm">New Discussion Post</p>
                  </div>
                <form onSubmit={handleSubmitIdea} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Subject</label>
                    <input
                      type="text"
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      className="w-full px-3 py-2 border-2 focus: outline-none text-sm" style={{ borderColor: 'var(--border)' }}
                      placeholder="Enter discussion topic..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--muted-foreground)' }}>Message</label>
                    <textarea
                      value={ideaForm.content}
                      onChange={(e) => setIdeaForm({ ...ideaForm, content: e.target.value })}
                      className="w-full px-3 py-2 border-2 focus: outline-none text-sm" style={{ borderColor: 'var(--border)' }}
                      rows={4}
                      placeholder="Share your thoughts about this book..."
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-6 py-2 border-2 font-bold uppercase text-xs hover: hover: transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                  >
                    Post Message (+3 Points)
                  </button>
                </form>
              </div>
            )}

            {ideas.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="text-5xl mb-3 block">💭</span>
                <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>No posts yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Be the first to start the discussion!</p>
              </div>
            ) : (
              <div className="space-y-0">
                {ideas.map((idea, index) => (
                  <div 
                    key={idea.id} 
                    className={`border-2 border-old-border hover:bg-old-paper transition-all ${
                      index !== 0 ? '-mt-0.5' : ''
                    }`}
                  >
                    {/* Thread Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Avatar */}
                          <div className="w-10 h-10 border-2 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
                            <span className="text-lg">👤</span>
                          </div>
                          
                          {/* Post Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold uppercase text-sm mb-1 leading-tight">
                              {idea.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              <span className="font-bold">
                                {idea.user?.username || 'Anonymous'}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(idea.created_at || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span>•</span>
                              <span className="text-xs">
                                Post #{index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Vote Buttons - Compact */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleVote(idea.id, 'upvote')}
                            className="px-2 py-1 border hover:bg-green-50 hover:border-green-600 transition-all text-xs" style={{ borderColor: 'var(--border)' }}
                            title="Upvote"
                          >
                            👍 {idea.upvotes}
                          </button>
                          <button
                            onClick={() => handleVote(idea.id, 'downvote')}
                            className="px-2 py-1 border hover:bg-red-50 hover:border-red-600 transition-all text-xs" style={{ borderColor: 'var(--border)' }}
                            title="Downvote"
                          >
                            👎 {idea.downvotes}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Thread Content */}
                    <div className="p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted-foreground)' }}>
                        {idea.content}
                      </p>
                    </div>

                    {/* Thread Footer */}
                    <div className="px-4 py-2 border-t flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span>💬</span>
                          <span>0 replies</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>👁️</span>
                          <span>0 views</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border ${
                          idea.upvotes - idea.downvotes > 0 
                            ? 'border-green-600 text-green-600' 
                            : idea.upvotes - idea.downvotes < 0 
                            ? 'border-red-600 text-red-600' 
                            : 'border-old-border text-old-grey'
                        }`}>
                          Score: {idea.upvotes - idea.downvotes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
      />
    </div>
  )
}
