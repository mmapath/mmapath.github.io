import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp, deleteDoc, updateDoc, writeBatch, query, where, orderBy, limit, or } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db, auth } from '../firebase/firebase'

export async function ensureUserProfile(uid, email, username = null) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    const displayName = username || email.split('@')[0]
    await setDoc(userRef, {
      uid,
      email,
      username: username || null,
      displayName,
      bio: '',
      title: '',
      trainingSince: '',
      mainDiscipline: '',
      gymName: '',
      location: '',
      avatarUrl: '',
      coverUrl: '',
      followersCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    if (username) {
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid,
        username: username.toLowerCase(),
        updatedAt: serverTimestamp()
      })
    }
  } else {
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true })
  }
}

export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }
    return null
  } catch (error) {
    console.error('getUserProfile error:', error.code, error.message, error)
    return null
  }
}

export async function getUserByUsername(username) {
  try {
    const usernameRef = doc(db, 'usernames', username.toLowerCase())
    const snap = await getDoc(usernameRef)
    if (snap.exists()) {
      return getUserProfile(snap.data().uid)
    }
    return null
  } catch (error) {
    console.error('getUserByUsername error:', error.code, error.message, error)
    return null
  }
}

export async function updateUserProfile(uid, updates) {
  try {
    const userRef = doc(db, 'users', uid)
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }
    await setDoc(userRef, updateData, { merge: true })
    return getUserProfile(uid)
  } catch (error) {
    console.error('updateUserProfile error:', error.code, error.message, error)
    throw error
  }
}

export async function checkUsernameAvailable(username) {
  try {
    const usernameRef = doc(db, 'usernames', username.toLowerCase())
    const snap = await getDoc(usernameRef)
    if (snap.exists()) {
      const data = snap.data()
      if (data.uid === auth.currentUser?.uid) return true
      return false
    }
    return true
  } catch (error) {
    console.error('checkUsernameAvailable error:', error.code, error.message, error)
    return true
  }
}

export async function updateUsername(uid, newUsername) {
  try {
    const normalized = newUsername.toLowerCase().trim()
    const usernameRegex = /^[a-z0-9_]{3,20}$/
    
    if (!usernameRegex.test(normalized)) {
      return { error: 'Kullanıcı adı 3-20 karakter olmalı. Sadece küçük harf, sayı ve alt çizgi kullanabilirsin.' }
    }
    
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    const currentData = userSnap.data()
    const oldUsername = currentData?.username
    
    const usernameRef = doc(db, 'usernames', normalized)
    const existingSnap = await getDoc(usernameRef)
    
    if (existingSnap.exists()) {
      const existing = existingSnap.data()
      if (existing.uid !== uid) {
        return { error: 'Bu kullanıcı adı zaten alınmış.' }
      }
    }
    
    const batch = writeBatch(db)
    
    if (oldUsername && oldUsername !== normalized) {
      batch.delete(doc(db, 'usernames', oldUsername))
    }
    
    batch.set(usernameRef, {
      uid,
      username: normalized,
      updatedAt: serverTimestamp()
    })
    
    batch.update(userRef, {
      username: normalized,
      displayName: normalized,
      updatedAt: serverTimestamp()
    })
    
    await batch.commit()
    
    if (auth.currentUser && auth.currentUser.uid === uid) {
      try {
        await updateProfile(auth.currentUser, { displayName: normalized })
      } catch (e) {
        console.log('Profile update error:', e)
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('updateUsername error:', error.code, error.message, error)
    return { error: 'Kullanıcı adı güncellenirken hata oluştu.' }
  }
}

export async function searchUsersByUsernameOrEmail(search) {
  if (!search || search.length < 2) return []
  
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const results = []
    const searchLower = search.toLowerCase().replace('@', '')
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data()
      const username = data.username?.toLowerCase() || ''
      const email = data.email?.toLowerCase() || ''
      
      if (username.includes(searchLower) || email.includes(searchLower)) {
        results.push({ id: docSnap.id, ...data })
      }
    })
    
    return results.slice(0, 10)
  } catch (error) {
    console.error('searchUsersByUsernameOrEmail error:', error.code, error.message, error)
    return []
  }
}

export async function getAllUsers(limitCount = 50) {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const users = []
    snapshot.forEach(docSnap => {
      users.push({ id: docSnap.id, ...docSnap.data() })
    })
    
    return users.slice(0, limitCount).filter(u => u.uid !== auth.currentUser?.uid)
  } catch (error) {
    console.error('getAllUsers error:', error.code, error.message, error)
    return []
  }
}