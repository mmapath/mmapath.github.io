import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, KeyRound, Flame } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('E-posta adresinizi giriniz.')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz.')
      return
    }
    
    setLoading(true)
    
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      const errorCode = err.code
      if (errorCode === 'auth/user-not-found') {
        setError('Bu e-posta ile kayıtlı kullanıcı bulunmuyor.')
      } else {
        setError('Şifre sıfırlama maili gönderilemedi. Lütfen tekrar deneyin.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mma-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-mma-red/10 via-mma-black to-mma-charcoal" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.15),transparent_50%)]" />
      
      <div className="relative w-full max-w-md">
        <div className="card-premium p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="text-mma-red" size={32} />
              <h1 className="font-oswald text-3xl font-bold text-white">
                MMA <span className="text-mma-red">PATH</span>
              </h1>
            </div>
            <p className="text-gray-400">Şifremi unuttum</p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                Şifre sıfırlama maili gönderildi. E-postanızı kontrol edin.
              </div>
              <Link 
                to="/login" 
                className="block w-full btn-primary text-center"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound size={18} />
                    Şifre Sıfırlama Maili Gönder
                  </>
                )}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Giriş sayfasına dönmek için?{' '}
              <Link to="/login" className="text-mma-red hover:text-mma-red-light underline">
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}