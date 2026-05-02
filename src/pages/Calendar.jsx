import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, Plus, Trash2, Edit3, Clock, MapPin, Repeat, 
  Dumbbell, X, ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  loadCalendarEvents, saveCalendarEvents, generateId, 
  WEEKDAYS, EVENT_TYPES, generateUpcomingEvents, 
  getMonthDays, formatWeekdayList, getEventTypeColor, getEventTypeTitle
} from '../utils/calendar'

export default function CalendarPage() {
  const { user: firebaseUser } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [error, setError] = useState('')
  const [upcomingEvents, setUpcomingEvents] = useState([])

  const [form, setForm] = useState({
    title: '',
    eventType: '',
    isRecurring: true,
    daysOfWeek: [],
    specificDate: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    enabled: true
  })

  useEffect(() => {
    if (firebaseUser) {
      const data = loadCalendarEvents(firebaseUser.uid)
      setEvents(data.events || [])
    }
  }, [firebaseUser])

  useEffect(() => {
    if (events.length > 0) {
      const upcoming = generateUpcomingEvents(events, new Date(), 14)
      setUpcomingEvents(upcoming)
    } else {
      setUpcomingEvents([])
    }
  }, [events])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleDayToggle = (dayNum) => {
    setForm(prev => {
      const days = prev.daysOfWeek.includes(dayNum)
        ? prev.daysOfWeek.filter(d => d !== dayNum)
        : [...prev.daysOfWeek, dayNum].sort((a, b) => a - b)
      return { ...prev, daysOfWeek: days }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Başlık gereklidir.')
      return
    }
    if (!form.eventType) {
      setError('Etkinlik türü gereklidir.')
      return
    }
    if (form.isRecurring && form.daysOfWeek.length === 0) {
      setError('En az bir gün seçmelisiniz.')
      return
    }
    if (!form.isRecurring && !form.specificDate) {
      setError('Tarih gereklidir.')
      return
    }
    if (!form.startTime || !form.endTime) {
      setError('Başlangıç ve bitiş saati gereklidir.')
      return
    }
    if (form.endTime <= form.startTime) {
      setError('Bitiş saati başlangıç saatinden sonra olmalıdır.')
      return
    }

    let updatedEvents
    if (editingEvent) {
      updatedEvents = events.map(ev => 
        ev.id === editingEvent.id 
          ? { ...ev, ...form, id: editingEvent.id }
          : ev
      )
    } else {
      updatedEvents = [...events, { ...form, id: generateId() }]
    }

    setEvents(updatedEvents)
    saveCalendarEvents(firebaseUser.uid, updatedEvents)
    setShowModal(false)
    setEditingEvent(null)
    setForm({
      title: '', eventType: '', isRecurring: true, daysOfWeek: [],
      specificDate: '', startTime: '', endTime: '', location: '', notes: '', enabled: true
    })
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setForm({ ...event })
    setShowModal(true)
    setError('')
  }

  const handleDelete = (eventId) => {
    const updatedEvents = events.filter(ev => ev.id !== eventId)
    setEvents(updatedEvents)
    saveCalendarEvents(firebaseUser.uid, updatedEvents)
  }

  const handleToggleEnabled = (eventId) => {
    const updatedEvents = events.map(ev => 
      ev.id === eventId ? { ...ev, enabled: !ev.enabled } : ev
    )
    setEvents(updatedEvents)
    saveCalendarEvents(firebaseUser.uid, updatedEvents)
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setForm({
      title: '', eventType: '', isRecurring: true, daysOfWeek: [],
      specificDate: '', startTime: '', endTime: '', location: '', notes: '', enabled: true
    })
    setError('')
    setShowModal(true)
  }

  const monthDays = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth())
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const getEventsForMonthDay = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(ev => {
      if (!ev.enabled) return false
      if (ev.isRecurring) {
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
        return ev.daysOfWeek?.includes(dayOfWeek)
      }
      return ev.specificDate === dateStr
    })
  }

  const groupedByDay = {}
  upcomingEvents.forEach(ev => {
    if (!groupedByDay[ev.instanceDate]) {
      groupedByDay[ev.instanceDate] = []
    }
    groupedByDay[ev.instanceDate].push(ev)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">Antrenman Takvimi</h2>
            <p className="text-gray-400">
              Haftalık antrenman rutinini ve özel etkinliklerini planla.
            </p>
          </div>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Etkinlik Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-premium p-6">
          <h3 className="font-oswald text-xl font-bold text-white mb-4">Aylık Görünüm</h3>
          
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 rounded-lg hover:bg-mma-gray"
            >
              <ChevronLeft className="text-gray-400" size={20} />
            </button>
            <span className="text-white font-medium">
              {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 rounded-lg hover:bg-mma-gray"
            >
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(w => (
              <div key={w.num} className="text-center text-xs text-gray-500 py-2">
                {w.short}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array(startPadding).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {monthDays.map((date, i) => {
              const dayEvents = getEventsForMonthDay(date)
              const isToday = date.toDateString() === new Date().toDateString()
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-lg border p-1 ${
                    isToday ? 'border-mma-red' : 'border-mma-gray'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-mma-red font-bold' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((ev, j) => (
                      <div 
                        key={j}
                        className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(ev.eventType)}`}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-gray-500">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="font-oswald text-xl font-bold text-white mb-4">Yaklaşan Etkinlikler</h3>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz etkinlik planlanmadı.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {Object.entries(groupedByDay).slice(0, 14).map(([date, dayEvents]) => (
                <div key={date}>
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  {dayEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-mma-dark rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${getEventTypeColor(ev.eventType)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{ev.title}</p>
                        <p className="text-gray-500 text-xs">{ev.startTime} - {ev.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="font-oswald text-xl font-bold text-white mb-4">Etkinlik Kuralları</h3>
        
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz etkinlik eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div 
                key={ev.id} 
                className={`p-4 rounded-xl border ${
                  ev.enabled ? 'border-mma-gray bg-mma-dark' : 'border-mma-gray/30 bg-mma-dark/50 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(ev.eventType)}`} />
                    <h4 className="text-white font-medium">{ev.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEnabled(ev.id)}
                      className={`p-1 rounded ${ev.enabled ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => handleEdit(ev)} className="p-1 text-gray-400 hover:text-white">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="p-1 text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span className="px-2 py-0.5 rounded bg-mma-gray">
                    {getEventTypeTitle(ev.eventType)}
                  </span>
                  {ev.isRecurring ? (
                    <span className="flex items-center gap-1">
                      <Repeat size={12} />
                      {formatWeekdayList(ev.daysOfWeek)}
                    </span>
                  ) : (
                    <span>{ev.specificDate}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {ev.startTime} - {ev.endTime}
                  </span>
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {ev.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-lg mx-4 card-premium p-6 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-mma-gray"
              onClick={() => setShowModal(false)}
            >
              <X className="text-gray-400" size={20} />
            </button>
            
            <h2 className="font-oswald text-2xl font-bold text-white mb-4">
              {editingEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Etkinlik Adı</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                  placeholder="Grappling Class"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Etkinlik Türü</label>
                <select
                  value={form.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                >
                  <option value="">Tür seç</option>
                  {EVENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isRecurring}
                    onChange={(e) => handleChange('isRecurring', e.target.checked)}
                    className="w-4 h-4 rounded bg-mma-dark border-mma-gray"
                  />
                  <span className="text-white">Tekrarlayan</span>
                </label>
                {!form.isRecurring && (
                  <input
                    type="date"
                    value={form.specificDate}
                    onChange={(e) => handleChange('specificDate', e.target.value)}
                    className="px-4 py-2 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                  />
                )}
              </div>

              {form.isRecurring && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Günler</label>
                  <div className="flex gap-2 flex-wrap">
                    {WEEKDAYS.map(w => (
                      <button
                        key={w.num}
                        type="button"
                        onClick={() => handleDayToggle(w.num)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          form.daysOfWeek.includes(w.num)
                            ? 'bg-mma-red text-white'
                            : 'bg-mma-dark border border-mma-gray text-gray-400 hover:text-white'
                        }`}
                      >
                        {w.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bitiş Saati</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Konum (opsiyonel)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none"
                  placeholder="Gym"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Notlar (opsiyonel)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white focus:border-mma-red focus:outline-none resize-none h-20"
                  placeholder="Notlar..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary">
                  {editingEvent ? 'Güncelle' : 'Etkinlik Ekle'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl border border-mma-gray text-gray-400 hover:text-white"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}