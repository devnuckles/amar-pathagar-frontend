'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { handoverAPI } from '@/lib/handoverApi'

export default function HandoverThreadsPage() {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sending' | 'receiving'>('all')

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadThreads()
    }
  }, [isAuthenticated, _hasHydrated, router])

  const loadThreads = async () => {
    try {
      const response = await handoverAPI.getUserHandoverThreads()
      const threadsData = response.data.data || response.data || []
      // Filter to only show active threads
      const activeThreads = Array.isArray(threadsData) ? threadsData.filter((t: any) => t.status === 'active') : []
      setThreads(activeThreads)
    } catch (error) {
      console.error('Failed to load handover threads:', error)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  const filteredThreads = threads.filter(thread => {
    if (filter === 'sending') return thread.current_holder_id === user?.id
    if (filter === 'receiving') return thread.next_holder_id === user?.id
    return true
  })

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-blue-100 text-blue-700 border-blue-600'
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-600'
    return 'bg-gray-100 text-gray-700 border-gray-600'
  }

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl">🔄</span>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider">Book Handovers</h1>
              <p className="text-xs md:text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Coordinate Book Exchanges</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-4 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Handovers', icon: '🔄' },
              { key: 'sending', label: 'Sending', icon: '📤' },
              { key: 'receiving', label: 'Receiving', icon: '📥' },
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

        {/* Threads List */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 md:p-4 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">
              {filter === 'all' ? 'All Handovers' : filter === 'sending' ? 'Books I\'m Sending' : 'Books I\'m Receiving'}
            </h2>
            <span className="px-2 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
              {filteredThreads.length}
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="uppercase tracking-wider text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                <span className="text-5xl mb-3 block">📦</span>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>No handovers in progress</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Handover threads are created 7 days before the due date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredThreads.map((thread: any) => {
                  const isSending = thread.current_holder_id === user.id
                  const otherUser = isSending ? thread.next_holder : thread.current_holder
                  const dueDate = new Date(thread.handover_due_date)
                  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

                  return (
                    <div
                      key={thread.id}
                      className="border-2 p-4 hover: transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50" style={{ borderColor: 'var(--border)' }}
                      onClick={() => router.push(`/handover/${thread.id}`)}
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Book Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-4xl">📚</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold uppercase text-base md:text-lg mb-1 truncate">
                              {thread.book?.title || 'Unknown Book'}
                            </h3>
                            <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{thread.book?.author || 'Unknown Author'}</p>

                            {/* Handover Info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm mb-2">
                              <div className="flex items-center gap-2">
                                <span>{isSending ? '📤' : '📥'}</span>
                                <span className="font-bold uppercase">
                                  {isSending ? 'Sending to' : 'Receiving from'}:
                                </span>
                                <span className="" style={{ color: 'var(--muted-foreground)' }}>
                                  {otherUser?.full_name || otherUser?.username || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            {/* Due Date */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 text-xs font-bold uppercase ${
                              daysUntilDue <= 0 
                                ? 'border-red-600 bg-red-50 text-red-700'
                                : daysUntilDue <= 3
                                ? 'border-orange-600 bg-orange-50 text-orange-700'
                                : 'border-blue-600 bg-blue-50 text-blue-700'
                            }`}>
                              <span>⏰</span>
                              <span>
                                {daysUntilDue <= 0 
                                  ? 'Overdue!' 
                                  : daysUntilDue === 1
                                  ? 'Due Tomorrow'
                                  : `${daysUntilDue} days left`
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Action */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 border-2 text-xs font-bold uppercase ${getStatusColor(thread.status)}`}>
                            {thread.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/handover/${thread.id}`)
                            }}
                            className="px-4 py-2 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                          >
                            View Thread →
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="border-4 border-blue-600 bg-gradient-to-br from-blue-50 to-white p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]">
          <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
            <span className="text-3xl md:text-4xl">💡</span>
            <div>
              <h3 className="font-bold uppercase text-base md:text-lg mb-2">About Handovers</h3>
              <ul className="space-y-2 text-xs md:text-sm" style={{ color: 'var(--muted-foreground)' }}>
                <li>• Handover threads are created automatically 7 days before the due date</li>
                <li>• Use the thread to coordinate book exchange with the next reader</li>
                <li>• Mark the book as "Completed" when you're done reading</li>
                <li>• The receiver marks it as "Delivered" when they receive it</li>
                <li>• All conversations are public to build trust in the community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
