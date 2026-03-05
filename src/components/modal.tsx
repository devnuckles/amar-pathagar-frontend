'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return { borderColor: '#b91c1c' }
      case 'warning':
        return { borderColor: '#ca8a04' }
      case 'info':
      default:
        return { borderColor: 'var(--border)' }
    }
  }

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return { backgroundColor: '#b91c1c', color: '#ffffff', borderColor: '#b91c1c' }
      case 'warning':
        return { backgroundColor: '#ca8a04', color: '#ffffff', borderColor: '#ca8a04' }
      case 'info':
      default:
        return { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' }
    }
  }

  const getTopBorderColor = () => {
    switch (type) {
      case 'danger':
        return '#b91c1c'
      case 'warning':
        return '#ca8a04'
      default:
        return 'var(--primary)'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] max-w-md w-full animate-slide-up"
        style={{
          backgroundColor: 'var(--card)',
          ...getTypeStyles()
        }}
      >
        {/* Decorative top border */}
        <div className="h-2" style={{ backgroundColor: getTopBorderColor() }} />
        
        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 
            className="text-2xl font-bold uppercase tracking-wider mb-4 border-b-2 pb-2"
            style={{
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          >
            {title}
          </h2>
          
          {/* Message */}
          <p 
            className="leading-relaxed mb-6 font-serif"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {message}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 font-bold uppercase tracking-widest text-sm border-2 transition-all duration-200 shadow-md hover:shadow-lg"
              style={getConfirmButtonStyles()}
              onMouseEnter={(e) => {
                if (type === 'danger') {
                  e.currentTarget.style.backgroundColor = '#991b1b';
                } else if (type === 'warning') {
                  e.currentTarget.style.backgroundColor = '#a16207';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--card)';
                  e.currentTarget.style.color = 'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                const styles = getConfirmButtonStyles();
                e.currentTarget.style.backgroundColor = styles.backgroundColor;
                e.currentTarget.style.color = styles.color;
              }}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 font-bold uppercase tracking-widest text-sm border-2 transition-all duration-200"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                backgroundColor: 'var(--card)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
              }}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
