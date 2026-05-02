export const EVENT_TYPES = [
  { id: 'grappling-class', title: 'Grappling Class', color: 'bg-blue-500' },
  { id: 'mma-sparring', title: 'MMA Sparring', color: 'bg-red-500' },
  { id: 'open-mat', title: 'Open Mat', color: 'bg-green-500' },
  { id: 'grappling-competition', title: 'Grappling Competition', color: 'bg-purple-500' },
  { id: 'striking-class', title: 'Striking Class', color: 'bg-orange-500' },
  { id: 'wrestling', title: 'Wrestling', color: 'bg-yellow-500' },
  { id: 'strength', title: 'S&C', color: 'bg-pink-500' },
  { id: 'fitness', title: 'Fitness', color: 'bg-cyan-500' },
  { id: 'cardio', title: 'Cardio', color: 'bg-rose-500' },
  { id: 'mobility', title: 'Mobility', color: 'bg-teal-500' },
  { id: 'recovery', title: 'Recovery', color: 'bg-indigo-500' },
  { id: 'custom', title: 'Custom', color: 'bg-gray-500' },
]

export const WEEKDAYS = [
  { num: 1, label: 'Pazartesi', short: 'Pzt' },
  { num: 2, label: 'Salı', short: 'Sal' },
  { num: 3, label: 'Çarşamba', short: 'Çar' },
  { num: 4, label: 'Perşembe', short: 'Per' },
  { num: 5, label: 'Cuma', short: 'Cum' },
  { num: 6, label: 'Cumartesi', short: 'Cmt' },
  { num: 7, label: 'Pazar', short: 'Paz' },
]

export function getCalendarStorageKey(userId) {
  return `mmaPath:calendar:${userId}`
}

export function loadCalendarEvents(userId) {
  const key = getCalendarStorageKey(userId)
  const data = localStorage.getItem(key)
  if (!data) return { events: [] }
  try {
    return JSON.parse(data)
  } catch {
    return { events: [] }
  }
}

export function saveCalendarEvents(userId, events) {
  const key = getCalendarStorageKey(userId)
  localStorage.setItem(key, JSON.stringify({ events }))
}

export function generateId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export function formatWeekdayList(daysOfWeek) {
  if (!daysOfWeek || daysOfWeek.length === 0) return ''
  return daysOfWeek
    .sort((a, b) => a - b)
    .map(d => WEEKDAYS.find(w => w.num === d)?.short || '')
    .join(', ')
}

export function getEventsForDate(events, date) {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay()
  const dateStr = dateObj.toISOString().split('T')[0]

  return events
    .filter(event => {
      if (!event.enabled) return false
      
      if (event.isRecurring) {
        return event.daysOfWeek?.includes(dayOfWeek)
      } else {
        return event.specificDate === dateStr
      }
    })
    .map(event => ({
      ...event,
      instanceDate: event.isRecurring ? dateStr : event.specificDate,
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function generateUpcomingEvents(events, startDate, daysCount = 14) {
  const upcoming = []
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < daysCount; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)
    const dayEvents = getEventsForDate(events, currentDate.toISOString().split('T')[0])
    
    dayEvents.forEach(event => {
      upcoming.push({
        ...event,
        instanceDate: currentDate.toISOString().split('T')[0],
      })
    })
  }

  return upcoming.sort((a, b) => {
    const dateCompare = a.instanceDate.localeCompare(b.instanceDate)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })
}

export function sortEventsByDateTime(events) {
  return [...events].sort((a, b) => {
    const dateCompare = a.instanceDate.localeCompare(b.instanceDate)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })
}

export function getMonthDays(year, month) {
  const days = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  
  return days
}

export function getEventTypeColor(eventTypeId) {
  return EVENT_TYPES.find(t => t.id === eventTypeId)?.color || 'bg-gray-500'
}

export function getEventTypeTitle(eventTypeId) {
  return EVENT_TYPES.find(t => t.id === eventTypeId)?.title || eventTypeId
}