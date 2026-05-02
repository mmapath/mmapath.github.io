import { doc, getDoc, setDoc, getDocs, collection, serverTimestamp, writeBatch, onSnapshot, query, orderBy, limit, where, arrayUnion, updateDoc, addDoc } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import { getUserProfile } from './userService'

function getSortedUids(uid1, uid2) {
  return uid1 < uid2 ? [uid1, uid2] : [uid2, uid1]
}

export async function createOrGetDmChat(targetUid) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid || !targetUid) {
    const error = new Error('Geçersiz kullanıcı ID')
    console.error("createOrGetDmChat error:", error.message, error)
    throw error
  }
  
  try {
    const sortedIds = [currentUid, targetUid].sort()
    const chatId = `dm_${sortedIds[0]}_${sortedIds[1]}`
    
    console.log("Creating or getting DM chat:", chatId)
    
    const chatRef = doc(db, 'chats', chatId)
    const chatSnap = await getDoc(chatRef)
    
    if (chatSnap.exists()) {
      console.log("DM already exists, returning:", chatId)
      return { id: chatId, ...chatSnap.data() }
    }
    
    const currentProfile = await getUserProfile(currentUid)
    const targetProfile = await getUserProfile(targetUid)
    
    if (!currentProfile || !targetProfile) {
      const error = new Error('Kullanıcı profili bulunamadı')
      console.error("createOrGetDmChat error:", error.message)
      throw error
    }
    
    const memberIds = [currentUid, targetUid]
    const memberUsernames = [
      currentProfile.username || currentUid,
      targetProfile.username || targetUid
    ]
    
    const memberInfo = {}
    memberInfo[currentUid] = {
      uid: currentUid,
      username: currentProfile.username || '',
      displayName: currentProfile.displayName || '',
      avatarUrl: currentProfile.avatarUrl || ''
    }
    memberInfo[targetUid] = {
      uid: targetUid,
      username: targetProfile.username || '',
      displayName: targetProfile.displayName || '',
      avatarUrl: targetProfile.avatarUrl || ''
    }
    
    console.log("DM memberIds:", memberIds)
    
    await setDoc(chatRef, {
      id: chatId,
      type: 'dm',
      memberIds,
      memberUsernames,
      memberInfo,
      createdBy: currentUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: '',
      lastMessageSenderId: '',
      lastMessageAt: null,
      unreadBy: []
    })
    
    console.log("DM created successfully:", chatId)
    return { id: chatId, type: 'dm', memberIds, memberInfo }
  } catch (error) {
    console.error("createOrGetDmChat error:", error.code, error.message, error)
    throw error
  }
}

export async function createGroupChat(groupName, memberIds) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid || !groupName || !memberIds || memberIds.length === 0) {
    const error = new Error('Eksik parametreler')
    console.error("createGroupChat error:", error.message)
    throw error
  }
  
  try {
    const allMemberIds = [...new Set([currentUid, ...memberIds])]
    const memberUsernames = []
    const memberInfo = {}
    
    for (const uid of allMemberIds) {
      const profile = await getUserProfile(uid)
      if (profile) {
        memberInfo[uid] = {
          uid: uid,
          username: profile.username || '',
          displayName: profile.displayName || '',
          avatarUrl: profile.avatarUrl || ''
        }
        if (profile.username) {
          memberUsernames.push(profile.username)
        }
      }
    }
    
    const chatRef = doc(collection(db, 'chats'))
    const groupChatId = `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    
    console.log("Creating group chat:", groupChatId, { groupName, memberIds: allMemberIds })
    
    await setDoc(chatRef, {
      id: groupChatId,
      type: 'group',
      groupName,
      memberIds: allMemberIds,
      memberUsernames,
      memberInfo,
      createdBy: currentUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: '',
      lastMessageSenderId: '',
      lastMessageAt: null
    })
    
    console.log("Group created successfully:", groupChatId)
    return { id: groupChatId, type: 'group', groupName, memberIds: allMemberIds, memberInfo }
  } catch (error) {
    console.error("createGroupChat error:", error.code, error.message, error)
    throw error
  }
}

export async function sendMessage({ chatId, text, currentUserProfile, selectedChat }) {
  if (!chatId) throw new Error("chatId missing")
  if (!selectedChat?.id) throw new Error("selectedChat missing")
  if (!currentUserProfile?.uid) throw new Error("currentUserProfile.uid missing")
  
  const trimmedText = text?.trim()
  if (!trimmedText) throw new Error("message text empty")
  
  try {
    const messageRef = doc(collection(db, "chats", chatId, "messages"))
    
    const messageData = {
      id: messageRef.id,
      chatId,
      senderId: currentUserProfile.uid,
      senderUsername: currentUserProfile.username || currentUserProfile.displayName || "unknown",
      senderDisplayName: currentUserProfile.displayName || currentUserProfile.username || "unknown",
      senderAvatarUrl: currentUserProfile.avatarUrl || "",
      text: trimmedText,
      createdAt: serverTimestamp(),
      readBy: [currentUserProfile.uid]
    }
    
    const chatRef = doc(db, "chats", chatId)
    
    const memberIds = Array.isArray(selectedChat.memberIds) ? selectedChat.memberIds : []
    const unreadBy = memberIds.filter(id => id !== currentUserProfile.uid)
    
    const chatUpdate = {
      lastMessage: trimmedText,
      lastMessageSenderId: currentUserProfile.uid,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadBy
    }
    
    const chatSnap = await getDoc(chatRef)
    
    if (chatSnap.exists()) {
      const batch = writeBatch(db)
      batch.set(messageRef, messageData)
      batch.update(chatRef, chatUpdate)
      await batch.commit()
    } else {
      await setDoc(messageRef, messageData)
      
      const chatData = {
        id: chatId,
        type: selectedChat?.type || 'dm',
        groupName: selectedChat?.groupName || '',
        memberIds: selectedChat?.memberIds || memberIds,
        memberUsernames: selectedChat?.memberUsernames || [],
        memberInfo: selectedChat?.memberInfo || {},
        createdBy: selectedChat?.createdBy || currentUserProfile.uid,
        createdAt: selectedChat?.createdAt || serverTimestamp(),
        ...chatUpdate
      }
      
      await setDoc(chatRef, chatData, { merge: true })
    }
    
    const otherMemberIds = memberIds.filter(id => id !== currentUserProfile.uid)
    for (const memberUid of otherMemberIds) {
      const notifRef = collection(db, 'users', memberUid, 'notifications')
      const messageText = selectedChat?.type === 'group' 
        ? `${currentUserProfile.username || ''} gruba mesaj gönderdi.`
        : `${currentUserProfile.username || ''} sana mesaj gönderdi.`
      
      await addDoc(notifRef, {
        type: 'message',
        fromUserId: currentUserProfile.uid,
        fromUsername: currentUserProfile.username || '',
        chatId,
        message: messageText,
        read: false,
        createdAt: serverTimestamp()
      })
    }
    
    return { id: messageRef.id, ...messageData }
  } catch (error) {
    console.error("sendMessage error:", error.code, error.message, error)
    throw error
  }
}

export async function markChatAsRead(chatId) {
  const currentUid = auth.currentUser?.uid
  if (!currentUid || !chatId) return
  
  try {
    const chatRef = doc(db, 'chats', chatId)
    const chatSnap = await getDoc(chatRef)
    if (!chatSnap.exists()) return
    
    await updateDoc(chatRef, { unreadBy: [] })
  } catch (error) {
    console.error("markChatAsRead error:", error.code, error.message, error)
  }
}

export function subscribeUserChats(userUid, callback) {
  if (!userUid) {
    callback([])
    return () => {}
  }
  
  const chatsRef = collection(db, 'chats')
  const q = query(
    chatsRef,
    where('memberIds', 'array-contains', userUid),
    orderBy('updatedAt', 'desc'),
    limit(50)
  )
  
  return onSnapshot(q, (snapshot) => {
    const chatMap = new Map()
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data()
      const chat = {
        id: docSnap.id,
        ...data
      }
      
      if (!chat.id || !chat.id.trim()) return
      if (!Array.isArray(chat.memberIds)) return
      if (!chat.memberIds.includes(userUid)) return
      if (chat.type !== 'dm' && chat.type !== 'group') return
      
      chatMap.set(chat.id, chat)
    })
    
    const chats = Array.from(chatMap.values())
    callback(chats)
  }, (error) => {
    console.error("subscribeUserChats listener error:", error.code, error.message, error)
    callback([])
  })
}

export function subscribeMessages(chatId, callback) {
  if (!chatId) {
    callback([])
    return () => {}
  }
  
  const messagesRef = collection(db, 'chats', chatId, 'messages')
  const q = query(messagesRef, orderBy('createdAt', 'asc'))
  
  return onSnapshot(q, (snapshot) => {
    const messages = []
    snapshot.forEach(docSnap => {
      messages.push({ id: docSnap.id, ...docSnap.data() })
    })
    callback(messages)
  }, (error) => {
    console.error("subscribeMessages listener error:", error.code, error.message, error)
    callback([])
  })
}

export async function getChatById(chatId) {
  try {
    const chatRef = doc(db, 'chats', chatId)
    const chatSnap = await getDoc(chatRef)
    if (chatSnap.exists()) {
      return { id: chatSnap.id, ...chatSnap.data() }
    }
    return null
  } catch (error) {
    console.error("getChatById error:", error.code, error.message, error)
    return null
  }
}