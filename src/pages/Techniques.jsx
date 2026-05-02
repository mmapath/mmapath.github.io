import { useState, useEffect } from 'react'
import { Search, CheckCircle } from 'lucide-react'
import { getCurrentUser, updateUserData } from '../utils/storage'
import { useAuth } from '../context/AuthContext'

const techniquesData = [
  { id: 'jab', title: 'Jab', category: 'Striking', difficulty: 'Başlangıç', explanation: 'Önden direkt yumruk' },
  { id: 'cross', title: 'Cross', category: 'Striking', difficulty: 'Başlangıç', explanation: 'Arka kol direkt yumruk' },
  { id: 'hook', title: 'Hook', category: 'Striking', difficulty: 'Orta', explanation: 'Yan yumruk' },
  { id: 'uppercut', title: 'Uppercut', category: 'Striking', difficulty: 'Orta', explanation: 'Yukarı yumruk' },
  { id: 'low-kick', title: 'Low Kick', category: 'Striking', difficulty: 'Orta', explanation: 'Alttan tekme' },
  { id: 'body-kick', title: 'Body Kick', category: 'Striking', difficulty: 'İleri', explanation: 'Gövde tekmesi' },
  { id: 'high-kick', title: 'High Kick', category: 'Striking', difficulty: 'İleri', explanation: 'Yüksek tekme' },
  { id: 'guillotine', title: 'Guillotine', category: 'Grappling', difficulty: 'Başlangıç', explanation: 'Boyun boğaz kilidi' },
  { id: 'rear-naked', title: 'Rear Naked Choke', category: 'Grappling', difficulty: 'Orta', explanation: 'Arka taraf sıkma' },
  { id: 'armbar', title: 'Armbar', category: 'Grappling', difficulty: 'Orta', explanation: 'Kol kilidi' },
  { id: 'triangle', title: 'Triangle Choke', category: 'Grappling', difficulty: 'İleri', explanation: 'Üçgen kilit' },
  { id: 'takedown', title: 'Single Leg Takedown', category: 'Wrestling', difficulty: 'Orta', explanation: 'Tek bacak alma' },
]

export default function Techniques() {
  const { user: firebaseUser } = useAuth()
  const [localUser, setLocalUser] = useState(null)
  const [filter, setFilter] = useState('Tümü')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const savedUser = getCurrentUser()
    setLocalUser(savedUser)
  }, [])

  const categories = ['Tümü', 'Striking', 'Grappling', 'Wrestling', 'Defense']

  const filteredTechniques = techniquesData.filter(tech => {
    const matchesCategory = filter === 'Tümü' || tech.category === filter
    const matchesSearch = tech.title.toLowerCase().includes(search.toLowerCase()) ||
                      tech.explanation.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTogglePracticed = (techniqueId) => {
    if (!localUser) return

    const currentTechniques = localUser.techniques || []
    const isPracticed = currentTechniques.includes(techniqueId)

    let newTechniques
    let techniquesPracticed

    if (isPracticed) {
      newTechniques = currentTechniques.filter(id => id !== techniqueId)
      techniquesPracticed = Math.max(0, (localUser.progress?.techniquesPracticed || 1) - 1)
    } else {
      newTechniques = [...currentTechniques, techniqueId]
      techniquesPracticed = (localUser.progress?.techniquesPracticed || 0) + 1
    }

    updateUserData(localUser.id, {
      techniques: newTechniques,
      progress: {
        ...localUser.progress,
        techniquesPracticed
      }
    })

    setLocalUser(prev => ({
      ...prev,
      techniques: newTechniques,
      progress: {
        ...prev.progress,
        techniquesPracticed
      }
    }))
  }

  const isTechniquePracticed = (techniqueId) => {
    return localUser?.techniques?.includes(techniqueId)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Başlangıç': return 'text-green-400'
      case 'Orta': return 'text-yellow-400'
      case 'İleri': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">Teknikler</h2>
        <p className="text-gray-400">
          Tüm MMA tekniklerini öğren ve çalışıldı olarak işaretle.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-mma-charcoal border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
            placeholder="Teknik ara..."
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === category
                  ? 'bg-mma-red text-white'
                  : 'bg-mma-charcoal border border-mma-gray text-gray-400 hover:text-white hover:border-mma-light-gray'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechniques.map((tech) => {
          const practiced = isTechniquePracticed(tech.id)
          return (
            <div key={tech.id} className={`card-premium p-4 transition-all ${
              practiced 
                ? 'border-mma-red/50 bg-mma-red/5 shadow-glow' 
                : 'hover:border-mma-light-gray'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-oswald text-lg font-bold text-white">{tech.title}</h3>
                {practiced && <CheckCircle className="text-mma-red" size={18} />}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-1 rounded bg-mma-gray text-gray-400">
                  {tech.category}
                </span>
                <span className={`text-xs ${getDifficultyColor(tech.difficulty)}`}>
                  {tech.difficulty}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{tech.explanation}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePracticed(tech.id)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    practiced
                      ? 'bg-mma-red text-white hover:bg-mma-red-light'
                      : 'bg-mma-gray text-white hover:bg-mma-light-gray'
                  }`}
                >
                  {practiced ? 'Çalışıldı ✓' : 'Çalışıldı İşaretle'}
                </button>
                {practiced && (
                  <button
                    onClick={() => handleTogglePracticed(tech.id)}
                    className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-mma-dark border border-mma-gray hover:border-mma-light-gray transition-colors"
                    title="Geri al"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}