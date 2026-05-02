import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCurrentUser, updateUserData } from '../utils/storage'
import LessonList from '../components/LessonList'
import RightPanel from '../components/RightPanel'
import { pathStages } from '../data/mockData'

const defaultStage = {
  id: 2,
  name: 'Striking',
  description: 'Duruş, yumruk teknikleri, tekme teknikleri ve kombinasyonlar üzerine odaklan.',
}

const lessonTitles = {
  '2.1': 'Duruş ve Mesafe',
  '2.2': 'Yumruk Teknikleri',
  '2.3': 'Tekme Teknikleri',
  '2.4': 'Kombinasyonlar',
}

const lessonDescriptions = {
  '2.1': "MMA'da doğru duruş pozisyonu ve mesafe yönetimi. Dövüşçünün temel duruş açısı, ayak pozisyonu ve savunma pozisyonları.",
  '2.2': 'Jab, cross, hook ve uppercut teknikleri. Doğru form, güç üretimi ve kombinasyonlar.',
  '2.3': 'Low kick, mid kick, high kick ve teqwan teknikleri. Yumrukla kombinasyonlar ve tekmeli saldırılar.',
  '2.4': 'Temel ve ileri düzey saldırı kombinasyonları. Settişme, Counter ve kombo dövüş stratejileri.',
}

const lessonDurations = {
  '2.1': '20 dk',
  '2.2': '35 dk',
  '2.3': '40 dk',
  '2.4': '45 dk',
}

export default function Dashboard() {
  const { user: firebaseUser } = useAuth()
  const [localUser, setLocalUser] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const savedUser = getCurrentUser()
    setLocalUser(savedUser)
    
    if (savedUser?.lessons) {
      setLessons(savedUser.lessons.map(l => ({
        ...l,
        title: lessonTitles[l.id] || '',
        description: lessonDescriptions[l.id] || '',
        duration: lessonDurations[l.id] || ''
      })))
    } else {
      const defaultLessons = [
        { id: '2.1', progress: 100, status: 'completed' },
        { id: '2.2', progress: 60, status: 'active' },
        { id: '2.3', progress: 0, status: 'locked' },
        { id: '2.4', progress: 0, status: 'locked' },
      ].map(l => ({
        ...l,
        title: lessonTitles[l.id],
        description: lessonDescriptions[l.id],
        duration: lessonDurations[l.id],
      }))
      setLessons(defaultLessons)
    }
  }, [])

  const handleLessonSelect = (lesson) => {
    if (lesson.status !== 'locked') {
      setSelectedLesson(lesson)
      setModalOpen(true)
    }
  }

  const handleCompleteLesson = () => {
    if (selectedLesson && localUser) {
      const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id)
      
      const updatedLessons = lessons.map((lesson, index) => {
        if (lesson.id === selectedLesson.id) {
          return { ...lesson, status: 'completed', progress: 100 }
        }
        if (index === currentIndex + 1 && lesson.status === 'locked') {
          return { ...lesson, status: 'active', progress: 0 }
        }
        return lesson
      })
      
      setLessons(updatedLessons)
      
      const completedCount = updatedLessons.filter(l => l.status === 'completed').length
      const pathProgress = Math.round((completedCount / updatedLessons.length) * 100)
      
      updateUserData(localUser.id, {
        lessons: updatedLessons,
        progress: {
          ...localUser.progress,
          lessonsCompleted: completedCount,
          pathProgress
        }
      })
      
      setLocalUser(prev => ({
        ...prev,
        lessons: updatedLessons,
        progress: {
          ...prev.progress,
          lessonsCompleted: completedCount,
          pathProgress
        }
      }))
      
      setModalOpen(false)
      setSelectedLesson(null)
    }
  }

  const completedCount = lessons.filter(l => l.status === 'completed').length
  const username = localUser?.username || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Dövüşçü'
  
  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-6">
        <div className="card-premium p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-mma-red/20 via-mma-charcoal to-mma-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_50%)]" />
          <div className="relative z-10">
            <h2 className="font-oswald text-3xl font-bold text-white mb-2">
              HOŞ GELDİN, {username.toUpperCase()}
            </h2>
            <p className="text-gray-400 max-w-xl">
              "Her dövüş bir öğrenme fırsatıdır. Bugün de tempoyu yükselt ve sınırlarını zorla."
            </p>
          </div>
        </div>

        <LessonList 
          currentStage={defaultStage}
          lessons={lessons}
          onLessonSelect={handleLessonSelect}
        />
      </div>

      <RightPanel 
        user={localUser}
        completedLessons={completedCount}
        totalLessons={lessons.length}
      />

      {modalOpen && selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 card-premium p-6">
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">
              {selectedLesson.title}
            </h2>
            <p className="text-gray-400 mb-4">{selectedLesson.description}</p>
            <div className="aspect-video rounded-xl bg-gradient-to-br from-mma-gray to-mma-dark mb-4 flex items-center justify-center">
              <span className="text-gray-500">Video Alanı</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCompleteLesson}
                className="flex-1 btn-primary"
              >
                Tamamlandı İşaretle
              </button>
              <button 
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 rounded-xl border border-mma-gray text-gray-400 hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}