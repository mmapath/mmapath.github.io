import { Calendar } from 'lucide-react'
import { getCurrentUser } from '../utils/storage'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import Avatar from './Avatar'

function Header() {
  const { user: firebaseUser, userProfile } = useAuth()
  const localUser = getCurrentUser()
  const username = userProfile?.username || userProfile?.displayName || localUser?.username || firebaseUser?.displayName || 'Fighter'
  const avatarUrl = userProfile?.avatarUrl || localUser?.avatarUrl || ''
  
  return (
    <header className="h-20 bg-mma-charcoal border-b border-mma-gray flex items-center justify-between px-6">
      <div>
        <h1 className="font-oswald text-3xl font-bold text-white, mb-3">
          
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="flex items-center gap-3 px-4 py-2 bg-mma-dark rounded-xl border border-mma-gray">
          <Avatar 
            src={avatarUrl} 
            name={username}
            size="sm"
          />
          <span className="text-white font-medium">Merhaba, {username}</span>
        </div>
      </div>
    </header>
  )
}

export default Header