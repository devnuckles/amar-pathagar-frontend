'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { ToastContainer } from './toast'
import NotificationBell from './notification.bell'
import { Logo } from './common/logo'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { toasts, removeToast } = useToastStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize mobile state only once
  useEffect(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    setSidebarOpen(!mobile) // Start collapsed on mobile, expanded on desktop
    setIsInitialized(true)
  }, [])

  // Only track window resize for mobile detection, don't change sidebar state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const handleNavClick = () => {
    // Only close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false)
    }
    // On desktop, keep the sidebar state as-is (don't change it)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen old-paper-texture">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <main className="w-full px-4 py-8">
          {children}
        </main>
      </div>
    )
  }

  // Prevent flash of incorrect sidebar state during initialization
  if (!isInitialized) {
    return null
  }

  return (
    <div className="flex min-h-screen old-paper-texture">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50
        style={{ backgroundImage: 'linear-gradient(to bottom, var(--background), var(--card), var(--background))' }}
        border-r-4 border-old-ink 
        shadow-[8px_0_16px_rgba(0,0,0,0.15)]
        transition-all duration-300 ease-in-out
        flex flex-col
        ${sidebarOpen ? 'w-72' : 'w-20'}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className={`
          relative overflow-hidden
          border-b-4 border-old-ink 
          style={{ backgroundImage: 'linear-gradient(to bottom right, var(--primary), var(--secondary), var(--primary))' }}
          ${sidebarOpen ? 'p-6' : 'p-4'}
        `}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)'
            }} />
          </div>
          
          <div className="relative z-10 flex items-start justify-between">
            {sidebarOpen ? (
              <div className="flex-1">
                <Logo size="footer" variant="light" />
              </div>
            ) : (
              <Link href="/dashboard" className="flex justify-center flex-1" onClick={handleNavClick}>
                <div className="text-5xl filter drop-shadow-lg">📚</div>
              </Link>
            )}
            
            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 border-2 border-old-paper hover: hover:border-white transition-all duration-200 shadow-md hover:shadow-lg group flex-shrink-0" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className={`
            border-b-2 border-old-border
            style={{ backgroundImage: 'linear-gradient(to bottom right, var(--card), var(--muted))' }}
            ${sidebarOpen ? 'p-4' : 'p-3'}
          `}>
            <button
              onClick={() => { 
                router.push('/profile/edit'); 
                if (isMobile) setSidebarOpen(false);
              }}
              className={`
                w-full text-left 
                hover:bg-old-paper transition-all duration-200
                border-2 border-transparent hover:border-old-ink
                ${sidebarOpen ? 'p-3' : 'p-2'}
                group
              `}
            >
              {sidebarOpen ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 bg-gradient-to-br from-old-paper to-amber-100 flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow" style={{ borderColor: 'var(--border)' }}>
                      👤
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" 
                         title="Online" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate group-hover:text-black" style={{ color: 'var(--foreground)' }}>
                      {user.full_name || user.username}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Score:</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{user.success_score}</span>
                      {user.role === 'admin' && (
                        <span className="px-1.5 py-0.5 text-xs font-bold uppercase" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-4 h-4 group-hover: transition-colors" style={{ color: 'var(--muted-foreground)' }} 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 bg-gradient-to-br from-old-paper to-amber-100 flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow" style={{ borderColor: 'var(--border)' }}>
                      👤
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Maximize Button - Only visible when collapsed on desktop */}
        {!sidebarOpen && !isMobile && (
          <div className="px-2 py-3 border-b-2 style={{ backgroundImage: 'linear-gradient(to bottom right, var(--card), var(--muted))' }}" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full p-3 border-2 hover: hover: transition-all duration-200 shadow-md hover:shadow-lg group flex justify-center" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              title="Expand sidebar"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <SidebarLink 
            href="/dashboard" 
            icon="🏠" 
            label="Dashboard" 
            active={isActive('/dashboard')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/books" 
            icon="📚" 
            label="Books" 
            active={isActive('/books')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/my-library" 
            icon="📖" 
            label="My Library" 
            active={isActive('/my-library')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/reading-history" 
            icon="📜" 
            label="History" 
            active={isActive('/reading-history')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/reviews" 
            icon="⭐" 
            label="Reviews" 
            active={isActive('/reviews')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/leaderboard" 
            icon="🏆" 
            label="Leaderboard" 
            active={isActive('/leaderboard')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/donations" 
            icon="🎁" 
            label="Donations" 
            active={isActive('/donations')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          <SidebarLink 
            href="/handover" 
            icon="🔄" 
            label="Handovers" 
            active={isActive('/handover')}
            collapsed={!sidebarOpen}
            onClick={handleNavClick}
          />
          
          {user?.role === 'admin' && (
            <>
              <div className={`my-3 border-t-2 border-old-border ${!sidebarOpen && 'mx-2'}`} />
              <SidebarLink 
                href="/admin" 
                icon="⚙️" 
                label="Admin Panel" 
                active={isActive('/admin')}
                collapsed={!sidebarOpen}
                onClick={handleNavClick}
                isAdmin
              />
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t-4 style={{ backgroundImage: 'linear-gradient(to bottom right, var(--card), var(--muted))' }} p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
          {sidebarOpen ? (
            <>
              <div className="px-2 py-2 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--muted-foreground)' }}>Notifications</span>
                <NotificationBell />
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 border-3 font-bold uppercase text-xs tracking-wider hover: hover: transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center py-2">
                <NotificationBell />
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-3 border-3 hover: hover: transition-all duration-200 shadow-md hover:shadow-lg flex justify-center group" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                title="Logout"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden border-b-4 shadow-md sticky top-0 z-30" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border-3 hover: hover: transition-all duration-200 shadow-md" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <h1 className="text-xl font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
                Amar Pathagar
              </h1>
            </Link>
            <div className="w-10" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-black mt-auto" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <div className="text-left">
                  <p className="font-bold uppercase tracking-wider text-base">Amar Pathagar</p>
                  <p className="text-xs opacity-75">Est. 2026</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs">
                <span className="uppercase tracking-wider opacity-75 hover:opacity-100 transition-opacity">Trust-Based</span>
                <span className="opacity-30">|</span>
                <span className="uppercase tracking-wider opacity-75 hover:opacity-100 transition-opacity">Knowledge Over Hoarding</span>
                <span className="opacity-30">|</span>
                <span className="uppercase tracking-wider opacity-75 hover:opacity-100 transition-opacity">Reputation Through Contribution</span>
              </div>

              <div className="text-xs text-center md:text-right">
                <p className="opacity-75 mb-1">
                  by{' '}
                  <a 
                    href="https://github.com/NesoHQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold hover:underline hover:opacity-100 transition-opacity"
                  >
                    NesoHQ
                  </a>
                </p>
                <a 
                  href="https://github.com/NesoHQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:opacity-100 opacity-60 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-old-paper border-opacity-10">
              <p className="text-xs opacity-50">
                © 2026 Amar Pathagar. A Trust-Based Reading Network.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function SidebarLink({ 
  href, 
  icon, 
  label, 
  active, 
  collapsed,
  onClick,
  isAdmin = false
}: { 
  href: string
  icon: string
  label: string
  active: boolean
  collapsed: boolean
  onClick?: () => void
  isAdmin?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 
        font-bold uppercase text-xs tracking-wider 
        transition-all duration-200
        ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
        ${active 
          ? 'bg-old-ink text-old-paper shadow-lg border-l-4 border-old-paper' 
          : `text-old-ink hover:bg-gradient-to-r ${isAdmin ? 'hover:from-red-50 hover:to-orange-50' : 'hover:from-old-paper hover:to-amber-50'} hover:border-l-4 hover:border-old-ink`
        }
      `}
      title={collapsed ? label : undefined}
    >
      <span className={`text-xl transition-transform group-hover:scale-110 ${active && 'scale-110'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="flex-1">{label}</span>
      )}
      {!collapsed && active && (
        <span className="" style={{ color: 'var(--primary-foreground)' }}>●</span>
      )}
    </Link>
  )
}
