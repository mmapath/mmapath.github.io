import { 
  Home, Dumbbell, Box, TrendingUp, User, Flame
} from 'lucide-react'

const navItems = [
  { id: 'ana-sayfa', label: 'Ana Sayfa', icon: 'Home' },
  { id: 'antrenmanlar', label: 'Antrenmanlar', icon: 'Dumbbell' },
  { id: 'teknikler', label: 'Teknikler', icon: 'Box' },
  { id: 'ilerleme', label: 'İlerleme', icon: 'TrendingUp' },
  { id: 'profil', label: 'Profil', icon: 'User' },
]

const iconMap = {
  Home,
  Dumbbell,
  Box,
  TrendingUp,
  User,
}

function Sidebar({ activeNav, setActiveNav, user }) {
  const goalProgress = user?.progress?.pathProgress || 0
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-mma-charcoal border-r border-mma-gray flex flex-col">
      <div className="p-6 border-b border-mma-gray">
        <h1 className="font-oswald text-2xl font-bold text-white tracking-wider">
          <span className="text-mma-red">MMA</span> PATH
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Box
          return (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
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
      </div>
    </aside>
  )
}

export default Sidebar