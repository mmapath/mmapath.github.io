import { useState, useEffect } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { User, MessageCircle, UserPlus, UserCheck, UserMinus, Loader2, Settings, Users, MapPin, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserByUsername, getUserProfile } from '../services/userService'
import { getFollowStatus, sendFollowRequest, acceptFollowRequest, rejectFollowRequest, unfollowUser, getFollowersList, getFollowingList } from '../services/followService'
import { createOrGetDmChat } from '../services/chatService'
import { fetchPosts } from '../services/postService'
import Avatar from '../components/Avatar'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: firebaseUser, userProfile: currentProfile } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [followStatus, setFollowStatus] = useState({ status: 'none' })
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [userPosts, setUserPosts] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const isOwnProfile = currentProfile?.username === username

  useEffect(() => {
    loadProfile()
  }, [username, firebaseUser])

  const loadProfile = async () => {
    setLoading(true)
    setFollowStatus({ status: 'none' })
    setMessage('')
    
    try {
      const user = await getUserByUsername(username)
      setProfile(user)
      
      if (user && firebaseUser) {
        const status = await getFollowStatus(user.uid)
        setFollowStatus(status)
        
        const [followersList, followingList, posts] = await Promise.all([
          getFollowersList(user.uid, 10),
          getFollowingList(user.uid, 10),
          fetchPosts(50)
        ])
        
        setFollowers(followersList)
        setFollowing(followingList)
        setUserPosts(posts.filter(p => p.authorId === user.uid).slice(0, 5))
      }
    } catch (err) {
      console.error('Load profile error:', err)
      setMessage('Profil yüklenirken hata oluştu.')
    }
    
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!profile || !firebaseUser) return
    setActionLoading(true)
    setMessage('')
    
    try {
      await sendFollowRequest(profile.uid)
      setFollowStatus({ status: 'pending' })
      setMessage('Takip isteği gönderildi.')
    } catch (err) {
      console.error('Follow error:', err)
      setMessage('Takip isteği gönderilirken hata oluştu.')
    }
    
    setActionLoading(false)
  }

  const handleUnfollow = async () => {
    if (!profile) return
    setActionLoading(true)
    setMessage('')
    
    try {
      await unfollowUser(profile.uid)
      setFollowStatus({ status: 'none' })
      setMessage('Takipten çıkıldı.')
    } catch (err) {
      console.error('Unfollow error:', err)
      setMessage('Takip iptal edilirken hata oluştu.')
    }
    
    setActionLoading(false)
  }

  const handleMessage = async () => {
    if (!profile || !firebaseUser) return
    setActionLoading(true)
    setMessage('')
    
    try {
      const chat = await createOrGetDmChat(profile.uid)
      if (chat && chat.id) {
        navigate(`/messages/${chat.id}`)
        setMessage('Mesaj başlatıldı.')
      } else {
        setMessage('Mesaj başlatılamadı.')
      }
    } catch (err) {
      console.error('Message error:', err.code, err.message, err)
      setMessage('Mesaj başlatılamadı.')
    }
    
    setActionLoading(false)
  }

  const getDisplayName = (item) => item?.username || item?.displayName || item?.email?.split('@')[0] || 'unknown'

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-mma-red" size={32} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="card-premium p-8 text-center">
        <p className="text-gray-500">Kullanıcı bulunamadı.</p>
        <NavLink to="/users" className="text-mma-red mt-4 inline-block">Kullanıcılara git</NavLink>
      </div>
    )
  }

  const displayUsername = getDisplayName(profile)
  const isFollowing = followStatus.status === 'following'
  const isPending = followStatus.status === 'pending'

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="p-3 rounded-lg bg-mma-dark border border-mma-gray text-white text-sm">
          {message}
        </div>
      )}
      
      <div className="card-premium p-6">
        {profile.coverUrl && (
          <div className="h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
            <img src={profile.coverUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <Avatar 
            src={profile.avatarUrl}
            name={displayUsername}
            size="2xl"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-oswald text-2xl font-bold text-white">@{displayUsername}</h2>
            </div>
            
            {profile.displayName && profile.displayName !== displayUsername && (
              <p className="text-gray-400 text-sm mb-2">{profile.displayName}</p>
            )}
            
            {profile.title && (
              <p className="text-mma-red text-sm mb-2 flex items-center gap-1">
                <Award size={14} /> {profile.title}
              </p>
            )}
            
            {profile.bio && (
              <p className="text-gray-400 mb-3">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              {profile.mainDiscipline && (
                <span className="flex items-center gap-1">
                  <span className="text-mma-red">●</span> {profile.mainDiscipline}
                </span>
              )}
              {profile.gymName && (
                <span>{profile.gymName}</span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {profile.location}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users size={16} className="text-gray-500" />
                <span className="text-white font-medium">{profile.followersCount || 0}</span>
                <span className="text-gray-500">takipçi</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck size={16} className="text-gray-500" />
                <span className="text-white font-medium">{profile.followingCount || 0}</span>
                <span className="text-gray-500">takip</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isOwnProfile && (
          <div className="flex gap-2 mt-4">
            {isFollowing ? (
              <button
                onClick={handleUnfollow}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-mma-gray rounded-xl text-white flex items-center justify-center gap-2"
              >
                <UserMinus size={18} /> Takipten Çık
              </button>
            ) : isPending ? (
              <button
                disabled
                className="flex-1 py-2 px-4 bg-mma-gray rounded-xl text-gray-400 flex items-center justify-center gap-2"
              >
                <Loader2 className="animate-spin" size={18} /> İstek Gönderildi
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={actionLoading}
                className="flex-1 py-2 px-4 bg-mma-red rounded-xl text-white flex items-center justify-center gap-2"
              >
                <UserPlus size={18} /> Takip İsteği Gönder
              </button>
            )}
            <button
              onClick={handleMessage}
              disabled={actionLoading}
              className="py-2 px-4 bg-mma-dark border border-mma-gray rounded-xl text-white flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        )}
        
        {isOwnProfile && (
          <NavLink
            to="/settings"
            className="mt-4 py-2 px-4 bg-mma-dark border border-mma-gray rounded-xl text-white flex items-center justify-center gap-2 w-fit"
          >
            <Settings size={18} /> Profili Düzenle
          </NavLink>
        )}
      </div>
      
      {userPosts.length > 0 && (
        <div className="card-premium p-6">
          <h3 className="font-oswald text-xl font-bold text-white mb-4">Gönderiler</h3>
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map(post => (
              <div key={post.id} className="aspect-square bg-mma-dark overflow-hidden">
                {post.mediaType === 'image' ? (
                  <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : post.mediaProvider === 'youtube' && post.embedUrl ? (
                  <iframe src={post.embedUrl} className="w-full h-full" allowFullScreen />
                ) : (
                  <video src={post.mediaUrl} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="card-premium p-4">
          <h3 className="font-oswald text-lg font-bold text-white mb-3">Takipçiler</h3>
          <div className="space-y-2">
            {followers.length === 0 ? (
              <p className="text-gray-500 text-sm">Takipçi yok</p>
            ) : (
              followers.map(user => (
                <NavLink
                  key={user.uid}
                  to={`/profile/${user.username || user.uid}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-mma-dark"
                >
                  <Avatar 
                    src={user.avatarUrl}
                    name={getDisplayName(user)}
                    size="sm"
                  />
                  <span className="text-white text-sm">@{getDisplayName(user)}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
        
        <div className="card-premium p-4">
          <h3 className="font-oswald text-lg font-bold text-white mb-3">Takip Edilenler</h3>
          <div className="space-y-2">
            {following.length === 0 ? (
              <p className="text-gray-500 text-sm">Takip eden yok</p>
            ) : (
              following.map(user => (
                <NavLink
                  key={user.uid}
                  to={`/profile/${user.username || user.uid}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-mma-dark"
                >
                  <Avatar 
                    src={user.avatarUrl}
                    name={getDisplayName(user)}
                    size="sm"
                  />
                  <span className="text-white text-sm">@{getDisplayName(user)}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}