'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { handoverAPI } from '@/lib/handoverApi'

export default function HandoverThreadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const { success, error } = useToastStore()
  const [thread, setThread] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && params.id) {
      loadThread()
      loadMessages()
      // Poll for new messages every 10 seconds
      const interval = setInterval(loadMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, _hasHydrated, params.id, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadThread = async () => {
    try {
      const response = await handoverAPI.getUserHandoverThreads()
      const threadsData = response.data.data || response.data || []
      const threads = Array.isArray(threadsData) ? threadsData : []
      const foundThread = threads.find((t: any) => t.id === params.id)
      setThread(foundThread || null)
    } catch (err) {
      console.error('Failed to load thread:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await handoverAPI.getHandoverMessages(params.id as string)
      const messagesData = response.data.data || response.data || []
      setMessages(Array.isArray(messagesData) ? messagesData : [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      await handoverAPI.postHandoverMessage(params.id as string, newMessage.trim())
      setNewMessage('')
      loadMessages()
      success('Message sent!')
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null
  }

  if (loading) {
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center py-12">
          <p className="uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center py-12">
          <p className="uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Thread not found</p>
          <button
            onClick={() => router.push('/handover')}
            className="mt-4 px-6 py-3 border-4 hover:bg-gray-800 font-bold uppercase tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
          >
            Back to Handovers
          </button>
        </div>
      </div>
    )
  }

  const isSending = thread.current_holder_id === user.id
  const otherUser = isSending ? thread.next_holder : thread.current_holder
  const dueDate = new Date(thread.handover_due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/handover')}
          className="flex items-center gap-2 px-4 py-2 border-2 hover: hover: transition-all text-sm font-bold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
        >
          ← Back to Handovers
        </button>

        {/* Thread Header */}
        <div className="border-4 bg-gradient-to-br from-old-paper to-amber-50 p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Book Info */}
            <div className="flex items-start gap-4 flex-1">
              <span className="text-5xl md:text-6xl">📚</span>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2 leading-tight">
                  {thread.book?.title || 'Unknown Book'}
                </h1>
                <p className="text-base md:text-lg mb-4" style={{ color: 'var(--muted-foreground)' }}>{thread.book?.author || 'Unknown Author'}</p>

                {/* Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1 font-bold" style={{ color: 'var(--muted-foreground)' }}>Current Holder</p>
                    <p className="font-bold">{thread.current_holder?.full_name || thread.current_holder?.username}</p>
                    {isSending && <span className="text-xs text-blue-600 font-bold">(You)</span>}
                  </div>
                  <div className="border-2 p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-xs uppercase mb-1 font-bold" style={{ color: 'var(--muted-foreground)' }}>Next Holder</p>
                    <p className="font-bold">{thread.next_holder?.full_name || thread.next_holder?.username}</p>
                    {!isSending && <span className="text-xs text-blue-600 font-bold">(You)</span>}
                  </div>
                </div>

                {/* Due Date */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 text-sm font-bold uppercase ${
                  daysUntilDue <= 0 
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : daysUntilDue <= 3
                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                    : 'border-blue-600 bg-blue-50 text-blue-700'
                }`}>
                  <span className="text-xl">⏰</span>
                  <div>
                    <p className="text-xs opacity-75">Due Date</p>
                    <p>
                      {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' '}
                      ({daysUntilDue <= 0 ? 'Overdue!' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className={`px-4 py-2 border-2 text-sm font-bold uppercase ${
                thread.status === 'active' ? 'border-blue-600 bg-blue-100 text-blue-700' :
                thread.status === 'completed' ? 'border-green-600 bg-green-100 text-green-700' :
                'border-gray-600 bg-gray-100 text-gray-700'
              }`}>
                {thread.status}
              </span>
              <button
                onClick={() => router.push(`/books/${thread.book_id}`)}
                className="px-4 py-2 border-2 hover: hover: font-bold uppercase text-xs tracking-wider transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              >
                View Book
              </button>
            </div>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', height: '600px' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-3 md:p-4 border-b-4 flex items-center justify-between flex-shrink-0" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider">Conversation</h2>
            </div>
            <span className="px-2 py-1 text-xs font-bold" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
              {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
            </span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-3 block">💬</span>
                <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>No messages yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isMyMessage = msg.user_id === user.id
                const isSystemMessage = msg.is_system_message

                if (isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="px-4 py-2 bg-blue-50 border-2 border-blue-200 text-blue-700 text-xs md:text-sm text-center max-w-md">
                        {msg.message}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md md:max-w-lg ${isMyMessage ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isMyMessage && <span className="text-xl">👤</span>}
                        <p className="text-xs font-bold uppercase">
                          {isMyMessage ? 'You' : msg.user?.full_name || msg.user?.username || 'Unknown'}
                        </p>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className={`p-3 border-2 ${
                        isMyMessage 
                          ? 'bg-blue-50 border-blue-600 text-blue-900' 
                          : 'bg-white border-old-border text-old-ink'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {thread.status === 'active' && (
            <form onSubmit={handleSendMessage} className="border-t-4 p-4 flex-shrink-0" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 focus: outline-none text-sm md:text-base" style={{ borderColor: 'var(--border)' }}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 md:px-6 py-3 border-4 hover:bg-gray-800 font-bold uppercase text-xs md:text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
