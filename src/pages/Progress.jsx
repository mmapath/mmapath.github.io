import { useState, useEffect } from 'react'
import { Clock, BookOpen, Box, Dumbbell } from 'lucide-react'
import { getCurrentUser } from '../utils/storage'
import { pathStages } from '../data/mockData'

export default function Progress() {
  const [localUser, setLocalUser] = useState(null)

  useEffect(() => {
    const savedUser = getCurrentUser()
    setLocalUser(savedUser)
  }, [])

  const stats = [
    { 
      label: 'Toplam Antrenman Süresi', 
      value: localUser?.progress?.totalTrainingMinutes || 0, 
      unit: 'dk',
      icon: Clock,
      color: 'text-mma-red'
    },
    { 
      label: 'Tamamlanan Ders', 
      value: localUser?.progress?.lessonsCompleted || 0, 
      unit: '',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    { 
      label: 'Çalışılan Teknik', 
      value: localUser?.progress?.techniquesPracticed || 0, 
      unit: '',
      icon: Box,
      color: 'text-green-400'
    },
    { 
      label: 'Tamamlanan Antrenman', 
      value: localUser?.progress?.completedWorkouts || 0, 
      unit: '',
      icon: Dumbbell,
      color: 'text-purple-400'
    },
  ]

  const pathProgress = localUser?.progress?.pathProgress || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">İlerleme</h2>
        <p className="text-gray-400">
          Genel istatistiklerini ve path ilerlemini görüntüle.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card-premium p-5 text-center">
              <Icon className={`${stat.color} mx-auto mb-3`} size={28} />
              <p className="font-oswald text-3xl font-bold text-white mb-1">
                {stat.value}{stat.unit && <span className="text-lg text-gray-500">{stat.unit}</span>}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-oswald text-xl font-bold text-white">Path İlerleme</h3>
          <span className="text-mma-red font-bold">{pathProgress}%</span>
        </div>
        
        <div className="relative h-4 bg-mma-gray rounded-full overflow-hidden mb-6">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-mma-red to-mma-red-light rounded-full transition-all duration-500"
            style={{ width: `${pathProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {pathStages.map((stage) => {
            const isCompleted = stage.status === 'completed'
            const isActive = stage.status === 'active'
            return (
              <div key={stage.id} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-mma-red text-white ring-4 ring-mma-red/30' :
                  'bg-mma-gray text-gray-500'
                }`}>
                  {isCompleted ? '✓' : stage.id}
                </div>
                <p className={`text-xs mt-2 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {stage.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}