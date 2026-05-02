import { doc, getDoc, setDoc, getDocs, collection, deleteDoc, serverTimestamp, writeBatch, onSnapshot, query, orderBy, limit, addDoc } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import { getUserProfile } from './userService'

export async function sendFollowRequest(targetUid) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid || currentUid === targetUid) {
    console.error("sendFollowRequest: Geçersiz istek")
    throw new Error('Geçersiz istek')
  }
  
  try {
    const targetRef = doc(db, 'users', targetUid, 'followRequests', currentUid)
    const snapshot = await getDoc(targetRef)
    if (snapshot.exists()) {
      return { status: 'already_sent' }
    }
    
    const currentProfile = await getUserProfile(currentUid)
    if (!currentProfile) {
      throw new Error('Profil bulunamadı')
    }
    
    await setDoc(targetRef, {
      requesterUid: currentUid,
      requesterUsername: currentProfile.username || '',
      requesterDisplayName: currentProfile.displayName || '',
      targetUid,
      status: 'pending',
      createdAt: serverTimestamp()
    })
    
    const notifRef = collection(db, 'users', targetUid, 'notifications')
    await addDoc(notifRef, {
      type: 'follow_request',
      fromUserId: currentUid,
      fromUsername: currentProfile.username || '',
      message: `${currentProfile.username || currentUid} sana takip isteği gönderdi.`,
      read: false,
      createdAt: serverTimestamp()
    })
    
    console.log("sendFollowRequest: İstek gönderildi", targetUid)
    return { status: 'sent' }
  } catch (error) {
    console.error("sendFollowRequest error:", error.code, error.message, error)
    throw error
  }
}

export async function getFollowStatus(targetUid) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid) return { status: 'none' }
  
  try {
    if (currentUid === targetUid) return { status: 'self' }
    
    const followingRef = doc(db, 'users', currentUid, 'following', targetUid)
    const followingSnap = await getDoc(followingRef)
    if (followingSnap.exists()) return { status: 'following' }
    
    const followersRef = doc(db, 'users', targetUid, 'followers', currentUid)
    const followersSnap = await getDoc(followersRef)
    if (followersSnap.exists()) return { status: 'follower' }
    
    const requestRef = doc(db, 'users', targetUid, 'followRequests', currentUid)
    const requestSnap = await getDoc(requestRef)
    if (requestSnap.exists()) return { status: 'pending' }
    
    return { status: 'none' }
  } catch (error) {
    console.error("getFollowStatus error:", error.code, error.message, error)
    return { status: 'none' }
  }
}

export async function acceptFollowRequest(requesterUid, targetUid) {
  if (!targetUid || !requesterUid) {
    console.error("acceptFollowRequest: Geçersiz parametreler")
    throw new Error('Geçersiz parametreler')
  }
  
  try {
    const batch = writeBatch(db)
    
    const requesterProfile = await getUserProfile(requesterUid)
    const targetProfile = await getUserProfile(targetUid)
    
    batch.delete(doc(db, 'users', targetUid, 'followRequests', requesterUid))
    
    batch.set(doc(db, 'users', targetUid, 'followers', requesterUid), {
      uid: requesterUid,
      username: requesterProfile?.username || '',
      displayName: requesterProfile?.displayName || '',
      followedAt: serverTimestamp()
    })
    
    batch.set(doc(db, 'users', requesterUid, 'following', targetUid), {
      uid: targetUid,
      username: targetProfile?.username || '',
      displayName: targetProfile?.displayName || '',
      followedAt: serverTimestamp()
    })
    
    const targetUserRef = doc(db, 'users', targetUid)
    const targetUserSnap = await getDoc(targetUserRef)
    const currentFollowers = targetUserSnap.data()?.followersCount || 0
    batch.update(targetUserRef, { followersCount: currentFollowers + 1 })
    
    const requesterUserRef = doc(db, 'users', requesterUid)
    const requesterUserSnap = await getDoc(requesterUserRef)
    const currentFollowing = requesterUserSnap.data()?.followingCount || 0
    batch.update(requesterUserRef, { followingCount: currentFollowing + 1 })
    
    await batch.commit()
    
    const notifRef = collection(db, 'users', requesterUid, 'notifications')
    await addDoc(notifRef, {
      type: 'follow_accepted',
      fromUserId: targetUid,
      fromUsername: targetProfile?.username || '',
      message: `${targetProfile?.username || targetUid} takip isteğini kabul etti.`,
      read: false,
      createdAt: serverTimestamp()
    })
    
    console.log("acceptFollowRequest: Kabul edildi", requesterUid, targetUid)
  } catch (error) {
    console.error("acceptFollowRequest error:", error.code, error.message, error)
    throw error
  }
}

export async function rejectFollowRequest(requesterUid, targetUid) {
  if (!targetUid || !requesterUid) {
    console.error("rejectFollowRequest: Geçersiz parametreler")
    throw new Error('Geçersiz parametreler')
  }
  
  try {
    await deleteDoc(doc(db, 'users', targetUid, 'followRequests', requesterUid))
    console.log("rejectFollowRequest: Reddedildi", requesterUid, targetUid)
  } catch (error) {
    console.error("rejectFollowRequest error:", error.code, error.message, error)
    throw error
  }
}

export async function unfollowUser(targetUid) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid || !targetUid) {
    console.error("unfollowUser: Geçersiz parametreler")
    throw new Error('Geçersiz parametreler')
  }
  
  try {
    const batch = writeBatch(db)
    
    batch.delete(doc(db, 'users', currentUid, 'following', targetUid))
    batch.delete(doc(db, 'users', targetUid, 'followers', currentUid))
    
    const targetUserRef = doc(db, 'users', targetUid)
    const targetUserSnap = await getDoc(targetUserRef)
    const currentFollowers = targetUserSnap.data()?.followersCount || 0
    if (currentFollowers > 0) {
      batch.update(targetUserRef, { followersCount: currentFollowers - 1 })
    }
    
    const currentUserRef = doc(db, 'users', currentUid)
    const currentUserSnap = await getDoc(currentUserRef)
    const currentFollowing = currentUserSnap.data()?.followingCount || 0
    if (currentFollowing > 0) {
      batch.update(currentUserRef, { followingCount: currentFollowing - 1 })
    }
    
    await batch.commit()
    console.log("unfollowUser: Takip bırakıldı", targetUid)
  } catch (error) {
    console.error("unfollowUser error:", error.code, error.message, error)
    throw error
  }
}

export async function getFollowersList(uid, limitCount = 20) {
  try {
    const followersRef = collection(db, 'users', uid, 'followers')
    const snapshot = await getDocs(followersRef)
    const list = []
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list.slice(0, limitCount)
  } catch (error) {
    console.error("getFollowersList error:", error.code, error.message, error)
    return []
  }
}

export async function getFollowingList(uid, limitCount = 20) {
  try {
    const followingRef = collection(db, 'users', uid, 'following')
    const snapshot = await getDocs(followingRef)
    const list = []
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() })
    })
    return list.slice(0, limitCount)
  } catch (error) {
    console.error("getFollowingList error:", error.code, error.message, error)
    return []
  }
}

export function subscribeToFollowRequests(userUid, callback) {
  const requestsRef = collection(db, 'users', userUid, 'followRequests')
  const q = query(requestsRef, orderBy('createdAt', 'desc'), limit(20))
  return onSnapshot(q, (snapshot) => {
    const requests = []
    snapshot.forEach(docSnap => {
      requests.push({ id: docSnap.id, ...docSnap.data() })
    })
    callback(requests)
  }, (error) => {
    console.error("subscribeToFollowRequests listener error:", error.code, error.message, error)
    callback([])
  })
}