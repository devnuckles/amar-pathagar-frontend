interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'red' | 'green' | 'blue' | 'orange'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'blue'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700 border-red-600',
    green: 'bg-green-600 hover:bg-green-700 border-green-600',
    blue: 'bg-blue-600 hover:bg-blue-700 border-blue-600',
    orange: 'bg-orange-600 hover:bg-orange-700 border-orange-600'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-md border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b-4"
          style={{
            background: 'linear-gradient(to right, var(--primary), var(--secondary))',
            color: 'var(--primary-foreground)',
            borderColor: 'var(--border)'
          }}
        >
          <h3 className="text-xl font-bold uppercase tracking-wider">{title}</h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{message}</p>
        </div>

        {/* Actions */}
        <div 
          className="p-4 border-t-2 flex gap-3 justify-end"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--muted)'
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 font-bold uppercase text-sm tracking-wider transition-all"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--foreground)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-6 py-2 border-2 text-white font-bold uppercase text-sm tracking-wider transition-all ${colorClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
