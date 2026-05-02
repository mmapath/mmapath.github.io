import { 
  doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, collection, query, where 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

function getInstanceId(eventId, date) {
  return `${eventId}_${date}`
}

export async function updateAttendance(userId, eventId, date, status) {
  const instanceId = getInstanceId(eventId, date)
  const attendanceRef = doc(db, 'users', userId, 'attendance', instanceId)
  
  await setDoc(attendanceRef, {
    instanceId,
    eventId,
    date,
    status,
    updatedAt: new Date().toISOString()
  })
}

export async function getAttendance(userId, eventId, date) {
  const instanceId = getInstanceId(eventId, date)
  const attendanceRef = doc(db, 'users', userId, 'attendance', instanceId)
  const snap = await getDoc(attendanceRef)
  
  if (snap.exists()) {
    return snap.data()
  }
  return null
}

export async function getAttendanceForRange(userId, startDate, endDate) {
  const attendanceRef = collection(db, 'users', userId, 'attendance')
  const snapshot = await getDocs(attendanceRef)
  
  const results = []
  snapshot.forEach(doc => {
    const data = doc.data()
    if (data.date >= startDate && data.date <= endDate) {
      results.push(data)
    }
  })
  
  return results
}

export async function getWeeklyStats(userId) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1)
  const startStr = startOfWeek.toISOString().split('T')[0]
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  const endStr = endOfWeek.toISOString().split('T')[0]
  
  const attendance = await getAttendanceForRange(userId, startStr, endStr)
  
  const attended = attendance.filter(a => a.status === 'attended').length
  const total = attendance.length
  
  return { attended, total, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 }
}

export async function getMonthlyStats(userId) {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startStr = startOfMonth.toISOString().split('T')[0]
  
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const endStr = endOfMonth.toISOString().split('T')[0]
  
  const attendance = await getAttendanceForRange(userId, startStr, endStr)
  
  const attended = attendance.filter(a => a.status === 'attended').length
  const total = attendance.length
  
  return { attended, total, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 }
}