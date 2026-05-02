import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, Map, Dumbbell, Settings, LogOut, Flame, Calendar, Share2, MessageSquare, Users
} from 'lucide-react'
import Header from './Header'
import VerificationBanner from './VerificationBanner'

const navItems = [
  { id: 'dashboard', label: 'Ana Sayfa', path: '/dashboard', icon: Home },
  // { id: 'path', label: 'Path', path: '/path', icon: Map },
  { id: 'workouts', label: 'Antrenmanlar', path: '/workouts', icon: Dumbbell },
  { id: 'calendar', label: 'Takvim', path: '/calendar', icon: Calendar },
  { id: 'feed', label: 'Feed', path: '/feed', icon: Share2 },
  { id: 'users', label: 'Kullanıcılar', path: '/users', icon: Users },
  { id: 'messages', label: 'Mesajlar', path: '/messages', icon: MessageSquare },
  { id: 'settings', label: 'Ayarlar', path: '/settings', icon: Settings },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const goalProgress = user?.progress?.pathProgress || 0

  return (
    <div className="flex min-h-screen bg-mma-black">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-mma-charcoal border-r border-mma-gray flex flex-col">
        <div className="p-6 border-b border-mma-gray">
          <h1 className="font-oswald text-2xl font-bold text-white tracking-wider">
            <span className="text-mma-red">MMA</span> PATH
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-mma-gray">
          <div className="card-premium p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="text-mma-red" size={18} />
              <span className="text-sm text-gray-400">Hedefin</span>
            </div>
            <p className="text-white font-medium mb-3">{user?.goal || 'Belirtilmedi'}</p>
            <div className="relative h-2 bg-mma-gray rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-mma-red to-mma-red-light rounded-full"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <p className="text-right text-xs text-gray-500 mt-2">{goalProgress}%</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <VerificationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}