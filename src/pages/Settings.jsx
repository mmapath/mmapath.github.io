import { useState, useEffect } from 'react'
import { User, Mail, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, updateUserProfile, checkUsernameAvailable, updateUsername as updateUsernameService } from '../services/userService'

export default function Settings() {
  const { user: firebaseUser, userProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    title: '',
    trainingSince: '',
    mainDiscipline: '',
    gymName: '',
    location: '',
    avatarUrl: '',
    coverUrl: ''
  })

  useEffect(() => {
    loadProfile()
  }, [firebaseUser?.uid])

  const loadProfile = async () => {
    if (!firebaseUser?.uid) return
    setLoading(true)
    try {
      const profile = await getUserProfile(firebaseUser.uid)
      if (profile) {
        setFormData({
          username: profile.username || '',
          displayName: profile.displayName || '',
          bio: profile.bio || '',
          title: profile.title || '',
          trainingSince: profile.trainingSince || '',
          mainDiscipline: profile.mainDiscipline || '',
          gymName: profile.gymName || '',
          location: profile.location || '',
          avatarUrl: profile.avatarUrl || '',
          coverUrl: profile.coverUrl || ''
        })
      }
    } catch (err) {
      console.error('Load profile error:', err)
    }
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setError('')
  }

  const handleCheckUsername = async () => {
    const username = formData.username.toLowerCase().trim()
    if (username.length < 3) {
      setError('Kullanıcı adı min 3 karakter olmalı.')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError('Sadece küçük harf, rakam ve underscore kullanılabilir.')
      return
    }
    setUsernameChecking(true)
    const available = await checkUsernameAvailable(username)
    setUsernameChecking(false)
    if (!available) {
      setError('Bu kullanıcı adı zaten alınmış.')
    }
  }

  const handleSave = async () => {
    if (!firebaseUser?.uid) return
    
    const username = formData.username.toLowerCase().trim()
    
    if (username && username.length >= 3) {
      if (!/^[a-z0-9_]+$/.test(username)) {
        setError('Kullanıcı adı sadece küçük harf, rakam ve underscore içermeli.')
        return
      }
      
      const available = await checkUsernameAvailable(username)
      if (!available && userProfile?.username !== username) {
        setError('Bu kullanıcı adı zaten alınmış.')
        setSaving(false)
        return
      }
    }
    
    setSaving(true)
    setError('')
    
    try {
      if (username && username !== userProfile?.username) {
        const result = await updateUsernameService(firebaseUser.uid, username)
        if (result.error) {
          setError(result.error)
          setSaving(false)
          return
        }
      }
      
      const fieldsToUpdate = {
        displayName: formData.displayName,
        bio: formData.bio.slice(0, 160),
        title: formData.title.slice(0, 50),
        trainingSince: formData.trainingSince,
        mainDiscipline: formData.mainDiscipline,
        gymName: formData.gymName,
        location: formData.location,
        avatarUrl: formData.avatarUrl,
        coverUrl: formData.coverUrl
      }
      
      await updateUserProfile(firebaseUser.uid, fieldsToUpdate)
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save error:', err)
      setError('Kaydedilirken hata oluştu.')
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mma-black flex items-center justify-center">
        <Loader2 className="animate-spin text-mma-red" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">Profil Ayarları</h2>
        <p className="text-gray-400">
          Profil bilgilerini güncelle.
        </p>
      </div>

      <div className="card-premium p-6 max-w-xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Kullanıcı Adı *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                onBlur={handleCheckUsername}
                className="w-full pl-12 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                placeholder="steamy"
                minLength={3}
              />
              {usernameChecking && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-mma-red" size={18} />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min 3 karakter, sadece küçük harf, rakam ve underscore.
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Görünen Ad</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="Steamy"
              maxLength={40}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ünvan</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="MMA Fighter"
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Biyografi</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none resize-none h-20"
              placeholder="Hakkında..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/160</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ana Branş</label>
            <input
              type="text"
              value={formData.mainDiscipline}
              onChange={(e) => handleChange('mainDiscipline', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="Boks, BJJ, Muay Thai..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Salon</label>
            <input
              type="text"
              value={formData.gymName}
              onChange={(e) => handleChange('gymName', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="Team Alpha Gym"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Konum</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="İstanbul, Türkiye"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Antrenmana Başlama Tarihi</label>
            <input
              type="text"
              value={formData.trainingSince}
              onChange={(e) => handleChange('trainingSince', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="2020"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Profil Fotoğrafı URL'si</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleChange('avatarUrl', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="https://example.com/avatar.jpg"
            />
            {formData.avatarUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img 
                  src={formData.avatarUrl} 
                  alt="Önizleme" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <span className="text-xs text-gray-500">Önizleme</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Kapak Resmi URL</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => handleChange('coverUrl', e.target.value)}
              className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
              placeholder="https://..."
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} />
                {saved ? 'Kaydedildi!' : 'Kaydet'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}