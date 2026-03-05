'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { reviewsAPI, booksAPI } from '@/lib/api'

export default function ReviewsPage() {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const { success, error } = useToastStore()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [myCurrentBooks, setMyCurrentBooks] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({
    reviewee_id: '',
    book_id: '',
    behavior_rating: 5,
    book_condition_rating: 5,
    communication_rating: 5,
    comment: '',
  })

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadMyCurrentBooks()
    }
  }, [isAuthenticated, _hasHydrated, router])

  const loadMyCurrentBooks = async () => {
    try {
      const response = await booksAPI.getAll()
      const books = response.data.data || []
      // Get books user currently has or has returned
      // For now, we'll show books the user currently has
      const myBooks = books.filter((b: any) => b.current_holder_id === user?.id)
      console.log('My current books:', myBooks)
      setMyCurrentBooks(myBooks)
    } catch (err) {
      console.error('Failed to load books:', err)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reviewForm.book_id) {
      error('Please select a book to review')
      return
    }

    if (!reviewForm.reviewee_id) {
      error('Unable to determine who to review for this book. The book may not have owner information.')
      return
    }

    console.log('Submitting review:', reviewForm)

    try {
      await reviewsAPI.create(reviewForm)
      success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewForm({
        reviewee_id: '',
        book_id: '',
        behavior_rating: 5,
        book_condition_rating: 5,
        communication_rating: 5,
        comment: '',
      })
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to submit review')
    }
  }

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl">⭐</span>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider">Reviews</h1>
                <p className="text-xs md:text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Rate Your Experience</p>
              </div>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border-4 hover:bg-gray-800 font-bold uppercase text-xs md:text-sm tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
            >
              {showReviewForm ? 'Cancel' : '+ Write Review'}
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 md:p-4 border-b-4" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">Write a Review</h2>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Select Book */}
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Select Book
                </label>
                <select
                  value={reviewForm.book_id}
                  onChange={(e) => {
                    const selectedBook = myCurrentBooks.find(b => b.id === e.target.value)
                    console.log('Selected book:', selectedBook)
                    // The reviewee should be the person who gave you the book
                    // For now, use created_by or donated_by as fallback
                    const revieweeId = selectedBook?.created_by || selectedBook?.donated_by || ''
                    console.log('Reviewee ID:', revieweeId)
                    setReviewForm({
                      ...reviewForm,
                      book_id: e.target.value,
                      reviewee_id: revieweeId
                    })
                  }}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 focus: outline-none text-sm md:text-base" style={{ borderColor: 'var(--border)' }}
                  required
                >
                  <option value="">Choose a book you've read...</option>
                  {myCurrentBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
                {myCurrentBooks.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ You don't have any books to review yet. Request a book first!
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                  💡 You can review books you currently have
                </p>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                    Behavior Rating
                  </label>
                  <select
                    value={reviewForm.behavior_rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, behavior_rating: parseInt(e.target.value) })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 focus: outline-none text-sm md:text-base" style={{ borderColor: 'var(--border)' }}
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>
                        {'⭐'.repeat(rating)} ({rating}/5)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                    Book Condition
                  </label>
                  <select
                    value={reviewForm.book_condition_rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, book_condition_rating: parseInt(e.target.value) })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 focus: outline-none text-sm md:text-base" style={{ borderColor: 'var(--border)' }}
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>
                        {'⭐'.repeat(rating)} ({rating}/5)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                    Communication
                  </label>
                  <select
                    value={reviewForm.communication_rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, communication_rating: parseInt(e.target.value) })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 focus: outline-none text-sm md:text-base" style={{ borderColor: 'var(--border)' }}
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>
                        {'⭐'.repeat(rating)} ({rating}/5)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs md:text-sm font-bold uppercase tracking-wider mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 focus: outline-none text-sm md:text-base resize-none" style={{ borderColor: 'var(--border)' }}
                  placeholder="Share your experience..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full px-4 md:px-6 py-3 border-4 hover:bg-gray-800 font-bold uppercase text-sm md:text-base tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              >
                Submit Review
              </button>
            </div>
          </form>
        )}

        {/* Info Card */}
        <div className="border-4 border-blue-600 bg-gradient-to-br from-blue-50 to-white p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]">
          <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
            <span className="text-3xl md:text-4xl">💡</span>
            <div>
              <h3 className="font-bold uppercase text-base md:text-lg mb-2">About Reviews</h3>
              <ul className="space-y-2 text-xs md:text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>• Reviews help build trust in the community</li>
                <li>• Rate behavior, book condition, and communication</li>
                <li>• Positive reviews increase the upline user's success score</li>
                <li>• Be honest and constructive in your feedback</li>
              </ul>
            </div>
          </div>
        </div>

        {/* View My Reviews Received */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 md:p-4 border-b-4" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">My Reviews</h2>
          </div>
          <div className="p-4 md:p-6 text-center">
            <button
              onClick={() => router.push(`/users/${user.id}`)}
              className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border-4 hover: hover: font-bold uppercase text-xs md:text-sm tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
            >
              View My Profile & Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
