import { 
  addDoc, collection, doc, getDoc, getDocs, 
  serverTimestamp, setDoc, updateDoc, increment, query, orderBy, limit, onSnapshot, deleteDoc
} from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'

export async function createNotification(userId, type, data) {
  if (!userId || userId === data?.fromUserId) return
  
  try {
    const notifRef = collection(db, 'users', userId, 'notifications')
    await addDoc(notifRef, {
      type,
      fromUserId: data.fromUserId || '',
      fromUsername: data.fromUsername || '',
      chatId: data.chatId || null,
      postId: data.postId || null,
      message: data.message || '',
      read: false,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('createNotification error:', error.code, error.message, error)
  }
}

export async function createTagNotification(fromUserId, fromUsername, postId, taggedUserIds, taggedUserUsernames) {
  for (let i = 0; i < taggedUserIds.length; i++) {
    const userId = taggedUserIds[i]
    const username = taggedUserUsernames[i]
    
    if (userId !== fromUserId) {
      await createNotification(userId, 'tag', {
        fromUserId,
        fromUsername,
        postId,
        message: `${fromUsername} seni bir gönderide etiketledi.`
      })
    }
  }
}

export async function createCommentNotification(fromUserId, fromUsername, postId, postAuthorId) {
  if (fromUserId !== postAuthorId) {
    await createNotification(postAuthorId, 'comment', {
      fromUserId,
      fromUsername,
      postId,
      message: `${fromUsername} gönderine yorum yaptı.`
    })
  }
}

export async function createLikeNotification(fromUserId, fromUsername, postId, postAuthorId) {
  if (fromUserId !== postAuthorId) {
    await createNotification(postAuthorId, 'like', {
      fromUserId,
      fromUsername,
      postId,
      message: `${fromUsername} gönderini beğendi.`
    })
  }
}

export function subscribeNotifications(userId, callback) {
  const notifRef = collection(db, 'users', userId, 'notifications')
  const q = query(notifRef, orderBy('createdAt', 'desc'), limit(30))
  
  return onSnapshot(q, (snapshot) => {
    const notifications = []
    try {
      snapshot.forEach(docData => {
        notifications.push({ id: docData.id, ...docData.data() })
      })
    } catch (error) {
      console.error('subscribeNotifications query error:', error.code, error.message, error)
    }
    callback(notifications)
  })
}

export async function fetchNotifications(userId, limitCount = 10) {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications')
    const q = query(notifRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    
    const notifications = []
    snapshot.forEach(docData => {
      notifications.push({ id: docData.id, ...docData.data() })
    })
    
    return notifications
  } catch (error) {
    console.error('fetchNotifications error:', error.code, error.message, error)
    return []
  }
}

export async function getUnreadCount(userId) {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications')
    const snapshot = await getDocs(notifRef)
    
    let cnt = 0
    snapshot.forEach(docData => {
      const data = docData.data()
      if (data.read === false) cnt++
    })
    
    return cnt
  } catch (error) {
    console.error('getUnreadCount error:', error.code, error.message, error)
    return 0
  }
}

export async function markAsRead(userId, notificationId) {
  try {
    const notifRef = doc(db, 'users', userId, 'notifications', notificationId)
    await updateDoc(notifRef, { read: true })
  } catch (error) {
    console.error('markAsRead error:', error.code, error.message, error)
  }
}

export async function markAllAsRead(userId) {
  try {
    const notifRef = collection(db, 'users', userId, 'notifications')
    const q = query(notifRef)
    const snapshot = await getDocs(q)
    
    const batch = []
    snapshot.forEach(docData => {
      const data = docData.data()
      if (data.read === false) batch.push(docData.id)
    })
    
    for (const id of batch) {
      const ref = doc(db, 'users', userId, 'notifications', id)
      await updateDoc(ref, { read: true })
    }
  } catch (error) {
    console.error('markAllAsRead error:', error.code, error.message, error)
  }
}