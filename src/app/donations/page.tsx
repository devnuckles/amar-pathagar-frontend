'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { donationsAPI } from '@/lib/api'

export default function DonationsPage() {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const { success, error } = useToastStore()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDonateForm, setShowDonateForm] = useState(false)
  const [donationType, setDonationType] = useState<'money' | 'book'>('money')
  const [donationForm, setDonationForm] = useState({
    amount: '',
    message: '',
  })

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadDonations()
    }
  }, [isAuthenticated, _hasHydrated, router])

  const loadDonations = async () => {
    try {
      const response = await donationsAPI.getAll()
      const data = response.data.data || response.data || []
      setDonations(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to load donations:', err)
      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: any = {
        donation_type: donationType,
        message: donationForm.message,
        is_public: true,
      }
      if (donationType === 'money') {
        data.amount = parseFloat(donationForm.amount)
        data.currency = 'USD'
      }
      await donationsAPI.create(data)
      success('Thank you for your donation!')
      setDonationForm({ amount: '', message: '' })
      setShowDonateForm(false)
      loadDonations()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to process donation')
    }
  }

  if (!_hasHydrated || !isAuthenticated) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-4 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-5xl">🎁</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">Donations</h1>
              <p className="text-white opacity-90 text-sm uppercase tracking-wider">Support Our Community</p>
            </div>
          </div>
        </div>

        {/* Donate Section */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-4 border-b-4 flex items-center justify-between" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold uppercase tracking-wider">Make a Donation</h2>
            <button
              onClick={() => setShowDonateForm(!showDonateForm)}
              className="px-4 py-2 border-2 border-old-paper hover: hover: font-bold uppercase text-sm transition-all" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            >
              {showDonateForm ? 'Cancel' : '+ Donate'}
            </button>
          </div>

          {showDonateForm && (
            <div className="p-6">
              <form onSubmit={handleSubmitDonation} className="space-y-6">
                {/* Donation Type */}
                <div>
                  <label className="block text-sm font-bold uppercase mb-3">Donation Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDonationType('money')}
                      className={`p-6 border-4 transition-all ${
                        donationType === 'money'
                          ? 'border-green-600 bg-green-50'
                          : 'border-old-border hover:border-old-ink'
                      }`}
                    >
                      <div className="text-4xl mb-2">💰</div>
                      <p className="font-bold uppercase">Money</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Financial Support</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationType('book')}
                      className={`p-6 border-4 transition-all ${
                        donationType === 'book'
                          ? 'border-green-600 bg-green-50'
                          : 'border-old-border hover:border-old-ink'
                      }`}
                    >
                      <div className="text-4xl mb-2">📚</div>
                      <p className="font-bold uppercase">Book</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Donate a Book</p>
                    </button>
                  </div>
                </div>

                {/* Amount (for money donations) */}
                {donationType === 'money' && (
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                      className="w-full px-4 py-3 border-2 focus: outline-none text-lg" style={{ borderColor: 'var(--border)' }}
                      placeholder="10.00"
                      required
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Message (Optional)</label>
                  <textarea
                    value={donationForm.message}
                    onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                    className="w-full px-4 py-3 border-2 focus: outline-none" style={{ borderColor: 'var(--border)' }}
                    rows={3}
                    placeholder="Share why you're donating..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 border-2 border-green-600 bg-green-600 text-white hover: hover:text-green-600 font-bold uppercase text-lg transition-all" style={{ backgroundColor: 'var(--card)' }}
                >
                  {donationType === 'money' ? '💰 Donate Money' : '📚 Donate Book'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Recent Donations */}
        <div className="border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="bg-gradient-to-r from-old-ink to-gray-800 p-4 border-b-4" style={{ color: 'var(--primary-foreground)', borderColor: 'var(--border)' }}>
            <h2 className="text-xl font-bold uppercase tracking-wider">Recent Donations</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="uppercase tracking-wider text-sm" style={{ color: 'var(--muted-foreground)' }}>Loading donations...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="uppercase tracking-wider text-sm" style={{ color: 'var(--muted-foreground)' }}>No donations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation: any) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="border-4 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold uppercase tracking-wider mb-3 text-lg">💡 Why Donate?</h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <p>• Help maintain and grow our community library</p>
            <p>• Enable more people to access books</p>
            <p>• Support the trust-based reading network</p>
            <p>• Earn +20 success score for book donations</p>
            <p>• Earn +10 success score for money donations</p>
            <p>• Get recognized as a community donor</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DonationCard({ donation }: any) {
  const getIcon = (type: string) => {
    return type === 'money' ? '💰' : '📚'
  }

  const getTypeColor = (type: string) => {
    return type === 'money' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
  }

  return (
    <div className="border-2 p-4 hover: transition-all" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{getIcon(donation.donation_type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-bold uppercase ${getTypeColor(donation.donation_type)}`}>
              {donation.donation_type}
            </span>
            {donation.amount && (
              <span className="font-bold text-lg">${donation.amount}</span>
            )}
          </div>
          <p className="font-bold uppercase text-sm mb-1">
            {donation.donor?.username || donation.donor?.full_name || 'Anonymous'}
          </p>
          {donation.message && (
            <p className="text-sm italic" style={{ color: 'var(--muted-foreground)' }}>"{donation.message}"</p>
          )}
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {new Date(donation.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
