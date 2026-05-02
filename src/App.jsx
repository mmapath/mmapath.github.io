import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
// import Path from './pages/Path'
import Workouts from './pages/Workouts'
import Techniques from './pages/Techniques'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import Calendar from './pages/Calendar'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import UsersPage from './pages/Users'
import Messages from './pages/Messages'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-mma-black flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-mma-red border-t-transparent rounded-full" />
    </div>
  )
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* <Route path="path" element={<Path />} /> */}
        <Route path="workouts" element={<Workouts />} />
        <Route path="techniques" element={<Techniques />} />
        <Route path="progress" element={<Progress />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="feed" element={<Feed />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:chatId" element={<Messages />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return <AppRoutes />
}