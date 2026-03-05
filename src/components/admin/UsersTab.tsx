interface UsersTabProps {
  users: any[]
  onAdjustScore: (userId: string, username: string) => void
  onUpdateRole: (userId: string, username: string, currentRole: string) => void
}

export default function UsersTab({ users, onAdjustScore, onUpdateRole }: UsersTabProps) {
  const userList = Array.isArray(users) ? users : []
  
  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-2" style={{ borderColor: 'var(--border)' }}>
          <thead className="" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <tr>
              <th className="px-4 py-2 text-left uppercase text-xs">Username</th>
              <th className="px-4 py-2 text-left uppercase text-xs">Email</th>
              <th className="px-4 py-2 text-center uppercase text-xs">Role</th>
              <th className="px-4 py-2 text-center uppercase text-xs">Score</th>
              <th className="px-4 py-2 text-center uppercase text-xs">Books</th>
              <th className="px-4 py-2 text-center uppercase text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user: any) => (
              <tr key={user.id} className="border-t-2 hover:" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 font-bold">{user.username}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted-foreground)' }}>{user.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-bold uppercase ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold">{user.success_score}</td>
                <td className="px-4 py-3 text-center text-sm">{user.books_shared}/{user.books_received}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onAdjustScore(user.id, user.username)}
                      className="px-2 py-1 border text-xs font-bold hover: hover: transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                      title="Adjust score"
                    >
                      ±
                    </button>
                    <button
                      onClick={() => onUpdateRole(user.id, user.username, user.role)}
                      className="px-2 py-1 border text-xs font-bold hover: hover: transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
                      title="Toggle role"
                    >
                      ⚡
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {userList.map((user: any) => (
          <div key={user.id} className="border-2 p-4 hover: transition-all" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{user.username}</h3>
                <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold uppercase flex-shrink-0 ml-2 ${
                user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b-2" style={{ borderColor: 'var(--border)' }}>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.success_score}</p>
                <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.books_shared}</p>
                <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Shared</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{user.books_received}</p>
                <p className="text-xs uppercase" style={{ color: 'var(--muted-foreground)' }}>Received</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAdjustScore(user.id, user.username)}
                className="flex-1 px-4 py-2 border-2 hover: hover: font-bold uppercase text-xs transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              >
                ± Adjust Score
              </button>
              <button
                onClick={() => onUpdateRole(user.id, user.username, user.role)}
                className="flex-1 px-4 py-2 border-2 hover: hover: font-bold uppercase text-xs transition-all" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}
              >
                ⚡ Toggle Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
