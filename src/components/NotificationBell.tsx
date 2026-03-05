'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { notificationAPI } from '@/lib/notificationApi'
import { useAuthStore } from '@/store/authStore'

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll()
      const data = response.data.data || response.data || []
      const notifList = Array.isArray(data) ? data : []
      setNotifications(notifList)
      setUnreadCount(notifList.filter((n: any) => !n.is_read).length)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id)
      loadNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      loadNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  if (!isAuthenticated) return null

  const notificationPanel = showDropdown && mounted ? (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-[998]"
        onClick={() => setShowDropdown(false)}
      />
      
      {/* Notification Panel - Fixed at top right */}
      <div 
        className="fixed top-4 right-4 w-[calc(100vw-2rem)] sm:w-96 border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] z-[999] max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        <div 
          className="p-4 flex items-center justify-between border-b-4 flex-shrink-0"
          style={{
            background: 'linear-gradient(to right, var(--primary), var(--secondary))',
            color: 'var(--primary-foreground)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <h3 className="font-bold uppercase text-sm tracking-wider">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs underline hover:opacity-75 transition-opacity whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setShowDropdown(false)}
              className="p-1 transition-all rounded"
              style={{
                color: 'var(--primary-foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--primary-foreground)';
              }}
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-5xl mb-3 block">📭</span>
              <p className="text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>No notifications</p>
            </div>
          ) : (
            <div className="divide-y-2" style={{ borderColor: 'var(--border)' }}>
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-all cursor-pointer ${
                    !notif.is_read ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                  style={{
                    backgroundColor: notif.is_read ? 'transparent' : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (notif.is_read) {
                      e.currentTarget.style.background = 'linear-gradient(to right, var(--accent), var(--muted))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notif.is_read) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif.id)
                    if (notif.link) {
                      setShowDropdown(false)
                      window.location.href = notif.link
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">
                      {notif.type === 'request_approved' ? '✅' :
                       notif.type === 'book_available' ? '📚' :
                       notif.type === 'return_due' ? '⏰' :
                       notif.type === 'review_received' ? '⭐' :
                       notif.type === 'idea_vote' ? '💡' : '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm mb-1 uppercase tracking-wide" style={{ color: 'var(--foreground)' }}>{notif.title}</p>
                      <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{notif.message}</p>
                      <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(notif.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  ) : null

  return (
    <>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative px-3 py-2 border-2 transition-all"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--foreground)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary-foreground)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
        title="Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(
        notificationPanel,
        document.body
      )}
    </>
  )
}
