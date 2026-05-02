/*
  localStorage auth - MVP/DEMO ONLY
  Bu localStorage tabanlı sistem SADECE MVP/_demo amaçlıdır.
  Gerçek bir uygulamada sunucu tarafında kimlik doğrulama kullanılmalıdır.
*/

const USERS_KEY = 'mma_path_users'
const CURRENT_USER_KEY = 'mma_path_current_user'
const USER_DATA_KEY = 'mma_path_user_data'

export const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const findUserByEmail = (email) => {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export const registerUser = (userData) => {
  const users = getUsers()
  
  if (findUserByEmail(userData.email)) {
    return { error: 'Bu e-posta adresi zaten kayıtlı.' }
  }
  
  if (userData.password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' }
  }
  
  const newUser = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email.toLowerCase(),
    password: userData.password,
    goal: userData.goal,
    level: userData.level,
    createdAt: new Date().toISOString(),
    progress: {
      totalTrainingMinutes: 0,
      completedWorkouts: 0,
      techniquesPracticed: 0,
      lessonsCompleted: 0,
      pathProgress: 0,
      dailyGoalsCompleted: []
    },
    lessons: [
      { id: '2.1', progress: 100, status: 'completed' },
      { id: '2.2', progress: 60, status: 'active' },
      { id: '2.3', progress: 0, status: 'locked' },
      { id: '2.4', progress: 0, status: 'locked' }
    ],
    workouts: [],
    techniques: []
  }
  
  users.push(newUser)
  saveUsers(users)
  
  return { user: newUser }
}

export const loginUser = (email, password) => {
  const user = findUserByEmail(email)
  
  if (!user) {
    return { error: 'E-posta veya şifre hatalı.' }
  }
  
  if (user.password !== password) {
    return { error: 'E-posta veya şifre hatalı.' }
  }
  
  return { user }
}

export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export const updateUserData = (userId, updates) => {
  const users = getUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return null
  
  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser
  saveUsers(users)
  
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(updatedUser)
  }
  
  return updatedUser
}

export const updateLessonProgress = (userId, lessonId, progress, status) => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.id !== userId) return null
  
  const lessons = currentUser.lessons.map(lesson => {
    if (lesson.id === lessonId) {
      return { ...lesson, progress, status }
    }
    return lesson
  })
  
  const completedCount = lessons.filter(l => l.status === 'completed').length
  const totalLessons = lessons.length
  const pathProgress = Math.round((completedCount / totalLessons) * 100)
  
  const progressUpdates = {
    lessons,
    progress: {
      ...currentUser.progress,
      lessonsCompleted: completedCount,
      pathProgress
    }
  }
  
  return updateUserData(userId, progressUpdates)
}

export const addCompletedWorkout = (userId, workout) => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.id !== userId) return null
  
  const workouts = [...currentUser.workouts, { 
    ...workout, 
    completedAt: new Date().toISOString() 
  }]
  
  const totalMinutes = currentUser.progress.totalTrainingMinutes + workout.duration
  const completedWorkouts = currentUser.progress.completedWorkouts + 1
  
  return updateUserData(userId, {
    workouts,
    progress: {
      ...currentUser.progress,
      totalTrainingMinutes: totalMinutes,
      completedWorkouts
    }
  })
}

export const markTechniquePracticed = (userId, techniqueId) => {
  const currentUser = getCurrentUser()
  if (!currentUser || currentUser.id !== userId) return null
  
  if (currentUser.techniques.includes(techniqueId)) {
    return currentUser
  }
  
  const techniques = [...currentUser.techniques, techniqueId]
  const techniquesPracticed = currentUser.progress.techniquesPracticed + 1
  
  return updateUserData(userId, {
    techniques,
    progress: {
      ...currentUser.progress,
      techniquesPracticed
    }
  })
}