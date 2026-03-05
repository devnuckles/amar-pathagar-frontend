type TabType = 'overview' | 'requests' | 'users' | 'books'

interface OverviewTabProps {
  stats: any
  onNavigate: (tab: TabType) => void
}

export default function OverviewTab({ stats, onNavigate }: OverviewTabProps) {
  if (!stats) return <p className="text-center" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="border-2 p-4"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)'
          }}
        >
          <h3 className="font-bold uppercase tracking-wider mb-4 text-lg" style={{ color: 'var(--foreground)' }}>📊 System Health</h3>
          <div className="space-y-3">
            <MetricRow label="Available Books" value={stats.available_books || 0} total={stats.total_books || 0} />
            <MetricRow label="Avg Success Score" value={Math.round(stats.avg_success_score || 0)} total={100} />
            <MetricRow label="Total Donations" value={stats.total_donations || 0} />
            <MetricRow label="Total Ideas" value={stats.total_ideas || 0} />
            <MetricRow label="Total Reviews" value={stats.total_reviews || 0} />
          </div>
        </div>

        <div 
          className="border-2 p-4"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--card)'
          }}
        >
          <h3 className="font-bold uppercase tracking-wider mb-4 text-lg" style={{ color: 'var(--foreground)' }}>🎯 Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => onNavigate('users' as TabType)}
              className="w-full px-4 py-2 border-2 transition-all font-bold uppercase text-sm"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
            >
              👥 Manage Users
            </button>
            <button 
              onClick={() => onNavigate('requests' as TabType)}
              className="w-full px-4 py-2 border-2 transition-all font-bold uppercase text-sm"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
            >
              📬 View Requests
            </button>
            <button 
              onClick={() => onNavigate('books' as TabType)}
              className="w-full px-4 py-2 border-2 transition-all font-bold uppercase text-sm"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
            >
              📚 Manage Books
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, total }: { label: string; value: number; total?: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
      <span className="font-bold" style={{ color: 'var(--foreground)' }}>
        {value}{total && ` / ${total}`}
      </span>
    </div>
  )
}
