interface RequestsTabProps {
  requests: any[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export default function RequestsTab({ requests, onApprove, onReject }: RequestsTabProps) {
  const requestList = Array.isArray(requests) ? requests : []
  
  if (requestList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>No pending requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requestList.map((req: any) => (
        <div key={req.id} className="border-2 p-4 hover: transition-all bg-gradient-to-r from-white to-gray-50" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-4">
            {/* Book Info */}
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">📚</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold uppercase text-base md:text-lg mb-1 truncate">{req.book?.title || 'Unknown Book'}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>by {req.book?.author || 'Unknown'}</p>
                
                {/* User & Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm">
                  <div className="border-l-4 pl-2" style={{ borderColor: 'var(--border)' }}>
                    <p className="uppercase font-bold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>User</p>
                    <p className="font-bold truncate">{req.user?.username || req.user?.full_name}</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-2">
                    <p className="uppercase font-bold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Score</p>
                    <p className="font-bold">{req.user?.success_score || 0}</p>
                  </div>
                  <div className="border-l-4 border-green-600 pl-2">
                    <p className="uppercase font-bold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Priority</p>
                    <p className="font-bold">{req.priority_score?.toFixed(1) || 0}</p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-2">
                    <p className="uppercase font-bold mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Requested</p>
                    <p className="font-bold">{new Date(req.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t-2" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => onApprove(req.id)}
                className="flex-1 px-4 py-2 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold uppercase text-xs transition-all"
              >
                ✓ Approve Request
              </button>
              <button
                onClick={() => onReject(req.id)}
                className="flex-1 px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase text-xs transition-all"
              >
                ✗ Reject Request
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
