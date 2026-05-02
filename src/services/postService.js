import { 
  addDoc, collection, doc, getDoc, getDocs, 
  serverTimestamp, setDoc, updateDoc, deleteDoc, increment,
  query, orderBy, limit 
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

export async function createPost(authorId, authorEmail, authorUsername, postData) {
  const { mediaType, mediaProvider, mediaUrl, embedUrl, caption, taggedUsers } = postData
  
  const postsRef = collection(db, 'posts')
  const postDoc = await addDoc(postsRef, {
    id: '',
    authorId,
    authorEmail,
    authorUsername: authorUsername || authorEmail.split('@')[0],
    mediaSource: 'url',
    mediaType: mediaType || 'image',
    mediaProvider: mediaProvider || 'direct',
    mediaUrl,
    embedUrl: embedUrl || null,
    storagePath: null,
    caption: caption || '',
    taggedUserIds: taggedUsers?.map(u => u.uid) || [],
    taggedUsernames: taggedUsers?.map(u => u.username) || [],
    taggedUserEmails: taggedUsers?.map(u => u.email) || [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  await updateDoc(postDoc, { id: postDoc.id })
  return postDoc.id
}

export async function fetchPosts(limitCount = 50) {
  const postsRef = collection(db, 'posts')
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(limitCount))
  const snapshot = await getDocs(q)
  
  const posts = []
  snapshot.forEach(docSnap => {
    posts.push({ id: docSnap.id, ...docSnap.data() })
  })
  
  return posts
}

export async function toggleLike(postId, userId) {
  const likeRef = doc(db, 'posts', postId, 'likes', userId)
  const likeSnap = await getDoc(likeRef)
  const postRef = doc(db, 'posts', postId)
  
  if (likeSnap.exists()) {
    await deleteDoc(likeRef)
    await updateDoc(postRef, { likesCount: increment(-1) })
    return false
  } else {
    await setDoc(likeRef, { userId, createdAt: serverTimestamp() })
    await updateDoc(postRef, { likesCount: increment(1) })
    return true
  }
}

export async function checkUserLiked(postId, userId) {
  const likeRef = doc(db, 'posts', postId, 'likes', userId)
  const likeSnap = await getDoc(likeRef)
  return likeSnap.exists()
}

export async function addComment(postId, authorId, authorEmail, authorUsername, text) {
  const commentsRef = collection(db, 'posts', postId, 'comments')
  const commentDoc = await addDoc(commentsRef, {
    authorId,
    authorEmail,
    authorUsername: authorUsername || authorEmail.split('@')[0],
    text,
    createdAt: serverTimestamp()
  })
  
  const postRef = doc(db, 'posts', postId)
  await updateDoc(postRef, { commentsCount: increment(1) })
  
  return commentDoc.id
}

export async function fetchComments(postId) {
  const commentsRef = collection(db, 'posts', postId, 'comments')
  const q = query(commentsRef, orderBy('createdAt', 'asc'))
  const snapshot = await getDocs(q)
  
  const comments = []
  snapshot.forEach(docSnap => {
    comments.push({ id: docSnap.id, ...docSnap.data() })
  })
  
  return comments
}