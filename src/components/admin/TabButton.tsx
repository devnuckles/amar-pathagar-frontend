interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

export default function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 font-bold uppercase text-sm tracking-wider transition-all whitespace-nowrap"
      style={{
        backgroundColor: active ? 'var(--primary)' : 'var(--card)',
        color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--muted)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--card)';
        }
      }}
    >
      {label}
    </button>
  )
}
