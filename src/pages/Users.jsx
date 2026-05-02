import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Search, MessageCircle, UserPlus, Loader2, Users as UsersIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, searchUsersByUsernameOrEmail } from '../services/userService'
import { getFollowStatus, sendFollowRequest, unfollowUser } from '../services/followService'
import { createOrGetDmChat } from '../services/chatService'
import Avatar from '../components/Avatar'

export default function UsersPage() {
  const navigate = useNavigate()
  const { user: firebaseUser, userProfile } = useAuth()
  
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [followStatuses, setFollowStatuses] = useState({})
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [firebaseUser])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await getAllUsers(50)
      setUsers(allUsers)
      
      const statuses = {}
      for (const u of allUsers) {
        if (u.uid !== firebaseUser?.uid) {
          statuses[u.uid] = await getFollowStatus(u.uid)
        }
      }
      setFollowStatuses(statuses)
    } catch (err) {
      console.error('Load users error:', err)
    }
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadUsers()
      return
    }
    setLoading(true)
    const results = await searchUsersByUsernameOrEmail(search)
    setUsers(results.filter(u => u.uid !== firebaseUser?.uid))
    setLoading(false)
  }

  const handleFollow = async (uid) => {
    setActionLoading(uid)
    try {
      await sendFollowRequest(uid)
      setFollowStatuses(prev => ({ ...prev, [uid]: { status: 'pending' } }))
    } catch (err) {
      console.error(err)
    }
    setActionLoading(null)
  }

  const handleUnfollow = async (uid) => {
    setActionLoading(uid)
    try {
      await unfollowUser(uid)
      setFollowStatuses(prev => ({ ...prev, [uid]: { status: 'none' } }))
    } catch (err) {
      console.error(err)
    }
    setActionLoading(null)
  }

  const handleMessage = async (uid) => {
    try {
      const chat = await createOrGetDmChat(uid)
      if (chat) {
        navigate(`/messages/${chat.id}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getDisplayName = (item) => item?.username || item?.displayName || item?.email?.split('@')[0] || 'unknown'

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">Kullanıcılar</h2>
            <p className="text-gray-400">MMA topluluğunu keşfet.</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search size={18} className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white"
              placeholder="Kullanıcı ara..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-3 bg-mma-red rounded-xl text-white"
          >
            Ara
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-mma-red" size={32} />
        </div>
      ) : users.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <UsersIcon className="mx-auto text-gray-500 mb-2" size={32} />
          <p className="text-gray-500">Kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const status = followStatuses[u.uid]?.status || 'none'
            const isFollowing = status === 'following'
            
            return (
              <div key={u.uid} className="card-premium p-4">
                <NavLink to={`/profile/${u.username || u.uid}`} className="flex items-center gap-3">
                  <Avatar 
                    src={u.avatarUrl}
                    name={getDisplayName(u)}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">@{getDisplayName(u)}</p>
                    {u.followersCount > 0 && (
                      <p className="text-gray-500 text-xs">{u.followersCount} takipçi</p>
                    )}
                  </div>
                </NavLink>
                
                <div className="flex gap-2 mt-3">
                  {isFollowing ? (
                    <button
                      onClick={() => handleUnfollow(u.uid)}
                      disabled={actionLoading === u.uid}
                      className="flex-1 py-2 bg-mma-gray rounded-lg text-white text-sm"
                    >
                      Takipten Çık
                    </button>
                  ) : status === 'pending' ? (
                    <button
                      disabled
                      className="flex-1 py-2 bg-mma-gray rounded-lg text-gray-400 text-sm"
                    >
                      İstek Gönderildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(u.uid)}
                      disabled={actionLoading === u.uid || u.uid === firebaseUser?.uid}
                      className="flex-1 py-2 bg-mma-red rounded-lg text-white text-sm"
                    >
                      Takip Et
                    </button>
                  )}
                  <button
                    onClick={() => handleMessage(u.uid)}
                    disabled={u.uid === firebaseUser?.uid}
                    className="px-3 py-2 bg-mma-dark border border-mma-gray rounded-lg text-white"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}