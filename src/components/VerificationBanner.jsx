import { useState } from 'react'
import { AlertTriangle, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VerificationBanner() {
  const { user, resendVerificationEmail } = useAuth()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user || user.emailVerified) {
    return null
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setSent(false)
    
    try {
      await resendVerificationEmail()
      setSent(true)
    } catch (err) {
      console.error('Resend verification error:', err.code, err.message)
      if (err.code === 'auth/too-many-requests') {
        setError('Çok fazla deneme yaptın. Bir süre sonra tekrar dene.')
      } else if (err.code === 'auth/user-not-found') {
        setError('Kullanıcı bulunamadı.')
      } else {
        setError('Doğrulama maili gönderilemedi.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-400 flex-shrink-0" size={20} />
          <div>
            <p className="text-yellow-400 font-medium">
              Email adresini doğrula. Bazı özellikler doğrulama sonrası açılacak.
            </p>
            <p className="text-yellow-400/70 text-sm">
              Doğrulama maili: {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sent ? (
            <span className="text-green-400 text-sm">Doğrulama maili tekrar gönderildi.</span>
          ) : error ? (
            <span className="text-red-400 text-sm">{error}</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
            >
              <Mail size={16} />
              Doğrulama mailini tekrar gönder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}