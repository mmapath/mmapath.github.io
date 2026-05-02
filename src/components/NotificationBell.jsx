import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { 
  fetchNotifications, markAsRead, markAllAsRead, getUnreadCount 
} from '../services/notificationService'

export default function NotificationBell() {
  const { user: firebaseUser } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (firebaseUser) {
      loadNotifications()
    }
  }, [firebaseUser])

  const loadNotifications = async () => {
    if (!firebaseUser) return
    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(firebaseUser.uid, 10),
        getUnreadCount(firebaseUser.uid)
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Load notifications error:', err)
    }
    setLoading(false)
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(firebaseUser.uid, notif.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setShowDropdown(false)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead(firebaseUser.uid)
    setUnreadCount(0)
    loadNotifications()
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    })
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-3 rounded-xl bg-mma-dark border border-mma-gray hover:border-mma-light-gray transition-colors cursor-pointer relative"
      >
        <Bell className="text-gray-400" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-mma-red text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-mma-charcoal border border-mma-gray rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-mma-gray flex items-center justify-between">
            <span className="text-white font-medium">Bildirimler</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-mma-red hover:text-mma-red-light"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-mma-red" size={20} />
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm text-center">Bildirim yok.</p>
            ) : (
              notifications.map(notif => (
                <NavLink
                  key={notif.id}
                  to={notif.postId ? '/feed' : '#'}
                  onClick={() => handleNotificationClick(notif)}
                  className={`block p-3 border-b border-mma-gray/30 hover:bg-mma-gray ${
                    !notif.read ? 'bg-mma-red/5' : ''
                  }`}
                >
                  <p className={`text-sm ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notif.createdAt)}
                  </p>
                </NavLink>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}