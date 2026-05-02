import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, BarChart3, MapPin } from 'lucide-react'
import { calendarDays, monthlyLabels } from '../data/mockData'
import { loadCalendarEvents, generateUpcomingEvents, getEventTypeColor } from '../utils/calendar'
import { useAuth } from '../context/AuthContext'

function RightPanel({ user, completedLessons, totalLessons }) {
  const { user: firebaseUser } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState([])
  
  const lastWorkout = user?.workouts?.length > 0 
    ? user.workouts[user.workouts.length - 1] 
    : null

  useEffect(() => {
    if (firebaseUser) {
      const data = loadCalendarEvents(firebaseUser.uid)
      if (data.events && data.events.length > 0) {
        const upcoming = generateUpcomingEvents(data.events, new Date(), 3)
        setUpcomingEvents(upcoming)
      }
    }
  }, [firebaseUser])

  return (
    <aside className="w-80 flex flex-col gap-5">
      <div className="widget">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-mma-red" size={18} />
            <h4 className="font-oswald text-lg font-bold text-white">Sıradaki Antrenmanlar</h4>
          </div>
          <Link to="/calendar" className="text-xs text-mma-red hover:text-mma-red-light">
            Takvimi Düzenle
          </Link>
        </div>
        
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz antrenman planı eklenmedi.</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="p-2 rounded-lg bg-mma-dark">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getEventTypeColor(ev.eventType)}`} />
                  <span className="text-white text-sm font-medium">{ev.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>
                    {new Date(ev.instanceDate).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {ev.startTime} - {ev.endTime}
                  </span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    {ev.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="widget">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-mma-red" size={18} />
          <h4 className="font-oswald text-lg font-bold text-white">Son Antrenman</h4>
        </div>
        
        {lastWorkout ? (
          <>
            <div className="p-3 rounded-xl bg-mma-dark border border-mma-gray mb-3">
              <p className="text-mma-red font-medium">{lastWorkout.title}</p>
              <p className="text-white">{lastWorkout.description}</p>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={14} />
              <span className="text-sm">{lastWorkout.duration} dk</span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Henüz antrenman tamamlanmadı.</p>
        )}
      </div>

      <div className="widget">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-mma-red" size={18} />
          <h4 className="font-oswald text-lg font-bold text-white">İstatistikler</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 rounded-lg bg-mma-dark">
            <span className="text-gray-400">Toplam Süre</span>
            <span className="text-white font-bold">{user?.progress?.totalTrainingMinutes || 0} dk</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-lg bg-mma-dark">
            <span className="text-gray-400">Tamamlanan Ders</span>
            <span className="text-white font-bold">{completedLessons}/{totalLessons}</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-lg bg-mma-dark">
            <span className="text-gray-400">Tamamlanan</span>
            <span className="text-white font-bold">{user?.progress?.completedWorkouts || 0}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default RightPanel