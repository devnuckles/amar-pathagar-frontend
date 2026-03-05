'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return { borderColor: '#16a34a', backgroundColor: '#f0fdf4', color: '#14532d' }
      case 'error':
        return { borderColor: '#b91c1c', backgroundColor: '#fef2f2', color: '#7f1d1d' }
      case 'warning':
        return { borderColor: '#ca8a04', backgroundColor: '#fefce8', color: '#713f12' }
      case 'info':
      default:
        return { borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  return (
    <div
      className="border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] p-4 mb-3 min-w-[300px] max-w-md animate-slide-in"
      style={getToastStyles()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl font-bold flex-shrink-0">{getIcon()}</span>
          <p className="font-serif text-sm leading-relaxed flex-1">{toast.message}</p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="text-xl font-bold hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}
