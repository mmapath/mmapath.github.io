import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, UserPlus, Flame, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { checkUsernameAvailable } from '../services/userService'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanları doldurunuz.')
      return
    }
    
    const username = formData.username.toLowerCase().trim()
    if (username.length < 3) {
      setError('Kullanıcı adı min 3 karakter olmalı.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Kullanıcı adı sadece küçük harf, rakam ve underscore içermeli.')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz.')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    
    setLoading(true)
    
    try {
      const available = await checkUsernameAvailable(username)
      if (!available) {
        setError('Bu kullanıcı adı zaten alınmış.')
        setLoading(false)
        return
      }
      await register(formData.email, formData.password, username)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Register error:', err.code, err.message)
      const errorCode = err.code
      if (errorCode === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kayıtlı.')
      } else if (errorCode === 'auth/invalid-email') {
        setError('Geçersiz e-posta adresi.')
      } else if (errorCode === 'auth/weak-password') {
        setError('Şifre çok zayıf.')
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Ağ hatası. İnternet bağlantınızı kontrol edin.')
      } else {
        setError('Kayıt başarısız. Lütfen tekrar deneyin.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-mma-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-mma-red/10 via-mma-black to-mma-charcoal" />
      <div className="absolute inset-0 bg-[radial_gradient(ellipse_at_top,rgba(220,38,38,0.15),transparent_50%)]" />
      
      <div className="relative w-full max-w-md">
        <div className="card-premium p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="text-mma-red" size={32} />
              <h1 className="font-oswald text-3xl font-bold text-white">
                MMA <span className="text-mma-red">PATH</span>
              </h1>
            </div>
            <p className="text-gray-400">Yeni hesap oluştur</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                Hesabın oluşturuldu. Doğrulama maili gönderildi. Yönlendiriliyorsun...
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Kullanıcı Adı *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                  className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none transition-colors"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Min 3 karakter, sadece küçük harf, rakam ve underscore.</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none transition-colors"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Şifre Tekrar</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || success}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Kayıt Ol
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Zaten hesabın var mı?{' '}
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