interface StatCardProps {
  icon: string
  label: string
  value: number
  color: 'blue' | 'green' | 'orange' | 'purple'
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = {
    blue: { border: '#2563eb', bgFrom: '#dbeafe', bgTo: '#bfdbfe' },
    green: { border: '#16a34a', bgFrom: '#dcfce7', bgTo: '#bbf7d0' },
    orange: { border: '#ea580c', bgFrom: '#ffedd5', bgTo: '#fed7aa' },
    purple: { border: '#9333ea', bgFrom: '#f3e8ff', bgTo: '#e9d5ff' },
  }
  
  return (
    <div 
      className="border-4 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
      style={{
        borderColor: colors[color].border,
        backgroundImage: `linear-gradient(to bottom right, ${colors[color].bgFrom}, ${colors[color].bgTo})`
      }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{value}</p>
        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      </div>
    </div>
  )
}
