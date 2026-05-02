import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'
import { getUserProfile } from '../services/userService'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verificationError, setVerificationError] = useState(null)

  const refreshProfile = async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid)
      setUserProfile(profile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = async (email, password, username = null) => {
    try {
      setVerificationError(null)
      
      if (!username) {
        throw { code: 'auth/username-required', message: 'Username required' }
      }
      
      const cleanUsername = username.toLowerCase().trim()
      const usernameRegex = /^[a-z0-9_]{3,20}$/
      
      if (!usernameRegex.test(cleanUsername)) {
        throw { code: 'auth/invalid-username', message: 'Kullanıcı adı 3-20 karakter olmalı. Sadece küçük harf, sayı ve alt çizgi kullanabilirsin.' }
      }
      
      const usernameRef = doc(db, 'usernames', cleanUsername)
      const usernameSnap = await getDoc(usernameRef)
      
      if (usernameSnap.exists()) {
        throw { code: 'auth/username-taken', message: 'Bu kullanıcı adı zaten alınmış.' }
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user
      
      await updateProfile(newUser, {
        displayName: cleanUsername
      })
      
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        username: cleanUsername,
        displayName: cleanUsername,
        bio: '',
        avatarUrl: '',
        followersCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      })
      
      await setDoc(doc(db, 'usernames', cleanUsername), {
        uid: newUser.uid,
        username: cleanUsername,
        updatedAt: serverTimestamp()
      })
      
      await sendEmailVerification(newUser)
      
      const profile = await getUserProfile(newUser.uid)
      setUserProfile(profile)
      
      return newUser
    } catch (error) {
      console.error('Register error:', error.code, error.message, error)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(result.user.uid)
      setUserProfile(profile)
      return result.user
    } catch (error) {
      console.error('Login error:', error.code, error.message)
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUserProfile(null)
  }

  const resendVerificationEmail = async () => {
    try {
      setVerificationError(null)
      if (!auth.currentUser) {
        const error = new Error('Kullanıcı bulunamadı.')
        error.code = 'auth/user-not-found'
        throw error
      }
      await sendEmailVerification(auth.currentUser)
    } catch (error) {
      console.error('Resend verification error:', error.code, error.message)
      if (error.code === 'auth/too-many-requests') {
        setVerificationError('Çok fazla deneme yaptın. Bir süre sonra tekrar dene.')
      } else {
        setVerificationError(error.message)
      }
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error('Reset password error:', error.code, error.message)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    verificationError,
    register,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}