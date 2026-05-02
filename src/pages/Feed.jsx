import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Image, Video, X, Search, Loader2, Tag, Link, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { searchUsersByUsernameOrEmail, getUserProfile } from '../services/userService'
import { createPost, fetchPosts, toggleLike as togglePostLike, addComment, fetchComments } from '../services/postService'
import { createTagNotification } from '../services/notificationService'
import { isValidUrl, isYouTubeUrl, isInstagramUrl, isTikTokUrl, getYouTubeEmbedUrl, getInstagramEmbedUrl, getTikTokEmbedUrl, detectMediaProvider, getProviderBadge, getMediaType } from '../utils/media'
import Avatar from '../components/Avatar'

export default function Feed() {
  const { user: firebaseUser, userProfile } = useAuth()
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    mediaType: 'image',
    mediaUrl: '',
    caption: '',
    taggedUsers: []
  })
  
  const [searchTag, setSearchTag] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [comments, setComments] = useState({})
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState('')

  useEffect(() => { loadPosts() }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await fetchPosts()
      setPosts(data)
    } catch (err) {
      console.error('Load posts error:', err)
    }
    setLoading(false)
  }

  const getDisplayName = (item) => item.authorUsername || item.authorEmail?.split('@')[0] || 'unknown'
  const getCommentAuthorName = (comment) => comment.authorUsername || comment.authorEmail?.split('@')[0] || 'unknown'

  const canPublish = () => form.mediaUrl.trim() && isValidUrl(form.mediaUrl)
  
  const getCurrentProvider = () => detectMediaProvider(form.mediaUrl)

  const handleMediaTypeChange = (type) => {
    setForm(prev => ({ ...prev, mediaType: type }))
    setError('')
  }

  const handleUrlChange = (url) => {
    setForm(prev => ({ ...prev, mediaUrl: url }))
    setError('')
  }

  const validatePost = () => {
    if (!canPublish()) {
      setError('Geçerli bir medya URL\'i giriniz.')
      return false
    }

    const provider = getCurrentProvider()
    const isSocialVideo = ['youtube', 'instagram', 'tiktok'].includes(provider)

    if (form.mediaType === 'image' && isSocialVideo) {
      setError('Sosyal medya linkleri sadece video olarak paylaşılabilir.')
      return false
    }

    return true
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePost()) return

    setCreating(true)

    try {
      const profile = userProfile || await getUserProfile(firebaseUser.uid)
      const authorUsername = profile?.username || profile?.displayName || firebaseUser.email.split('@')[0]

      const provider = getCurrentProvider()
      let embedUrl = null
      
      if (provider === 'youtube') embedUrl = getYouTubeEmbedUrl(form.mediaUrl)
      else if (provider === 'instagram') embedUrl = getInstagramEmbedUrl(form.mediaUrl)
      else if (provider === 'tiktok') embedUrl = getTikTokEmbedUrl(form.mediaUrl)

      const taggedUserIds = form.taggedUsers.map(u => u.uid)
      const taggedUserUsernames = form.taggedUsers.map(u => u.username)
      const taggedUserEmails = form.taggedUsers.map(u => u.email)

      const postId = await createPost(
        firebaseUser.uid,
        firebaseUser.email,
        authorUsername,
        {
          mediaType: provider === 'direct' && !isYouTubeUrl(form.mediaUrl) && !isInstagramUrl(form.mediaUrl) && !isTikTokUrl(form.mediaUrl) ? getMediaType(form.mediaUrl, form.mediaType) : 'video',
          mediaProvider: provider,
          mediaUrl: form.mediaUrl,
          embedUrl,
          caption: form.caption,
          taggedUsers: form.taggedUsers
        }
      )

      if (taggedUserIds.length > 0) {
        await createTagNotification(
          firebaseUser.uid,
          firebaseUser.email,
          authorUsername,
          postId,
          taggedUserIds,
          taggedUserUsernames,
          taggedUserEmails
        )
      }

      setForm({ mediaType: 'image', mediaUrl: '', caption: '', taggedUsers: [] })
      setShowCreate(false)
      loadPosts()
    } catch (err) {
      console.error('Create post error:', err)
      setError('Paylaşım oluşturulamadı.')
    }

    setCreating(false)
  }

  const handleLike = async (postId) => {
    try {
      await togglePostLike(postId, firebaseUser.uid)
      loadPosts()
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const handleSearchUsers = async () => {
    if (searchTag.length < 2) return
    const results = await searchUsersByUsernameOrEmail(searchTag.replace('@', ''))
    setSearchResults(results.filter(u => u.uid !== firebaseUser.uid))
  }

  const handleAddTag = (user) => {
    if (!form.taggedUsers.find(u => u.uid === user.uid)) {
      setForm(prev => ({ ...prev, taggedUsers: [...prev.taggedUsers, user] }))
    }
    setSearchTag('')
    setSearchResults([])
  }

  const handleRemoveTag = (uid) => {
    setForm(prev => ({ ...prev, taggedUsers: prev.taggedUsers.filter(u => u.uid !== uid) }))
  }

  const toggleComments = async (postId) => {
    if (!showComments[postId]) {
      const postComments = await fetchComments(postId)
      setComments(prev => ({ ...prev, [postId]: postComments }))
    }
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }))
  }

  const handleSubmitComment = async (postId) => {
    if (!newComment.trim()) return
    setSubmittingComment(postId)
    try {
      const profile = userProfile || await getUserProfile(firebaseUser.uid)
      const authorUsername = profile?.username || profile?.displayName || firebaseUser.email.split('@')[0]
      await addComment(postId, firebaseUser.uid, firebaseUser.email, authorUsername, newComment)
      const postComments = await fetchComments(postId)
      setComments(prev => ({ ...prev, [postId]: postComments }))
      setNewComment('')
      loadPosts()
    } catch (err) {
      console.error('Comment error:', err)
    }
    setSubmittingComment('')
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const renderMedia = (post) => {
    const provider = post.mediaProvider
    
    if (provider === 'youtube' && post.embedUrl) {
      return (
        <div className="w-full" style={{ paddingTop: '56.25%', position: 'relative' }}>
          <iframe
            src={post.embedUrl}
            title="YouTube video"
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    
    if (provider === 'instagram' && post.embedUrl) {
      return (
        <div className="w-full max-w-sm mx-auto" style={{ aspectRatio: '9/16' }}>
          <iframe
            src={post.embedUrl}
            title="Instagram post"
            className="w-full h-full"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
          />
        </div>
      )
    }
    
    if (provider === 'tiktok' && post.embedUrl) {
      return (
        <div className="w-full max-w-sm mx-auto" style={{ aspectRatio: '9/16' }}>
          <iframe
            src={post.embedUrl}
            title="TikTok video"
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      )
    }
    
    if (post.mediaType === 'image') {
      return <img src={post.mediaUrl} alt={post.caption} className="w-full max-h-96 object-contain bg-black" />
    }
    
    return <video src={post.mediaUrl} controls className="w-full max-h-96 object-contain bg-black" />
  }

  const provider = getCurrentProvider()
  const isSocialVideo = ['youtube', 'instagram', 'tiktok'].includes(provider)

  return (
    <div className="flex flex-col gap-6">
      <div className="card-premium p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-oswald text-2xl font-bold text-white mb-2">Feed</h2>
            <p className="text-gray-400">MMA topluluğuyla paylaşım yap.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Send size={18} /> Yeni Paylaşım
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-mma-red" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="text-gray-500">Henüz paylaşım yok.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="card-premium overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <Avatar 
                  src={post.authorAvatarUrl}
                  name={getDisplayName(post)}
                  size="md"
                />
                <div>
                  <p className="text-white font-medium">@{getDisplayName(post)}</p>
                  <p className="text-gray-500 text-xs">{formatDate(post.createdAt)}</p>
                </div>
              </div>

              {renderMedia(post)}

              <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-mma-red">
                    <Heart size={20} /><span>{post.likesCount || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-mma-red">
                    <MessageCircle size={20} /><span>{post.commentsCount || 0}</span>
                  </button>
                </div>

                {post.caption && <p className="text-white mb-2">{post.caption}</p>}

                {post.taggedUsernames?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.taggedUsernames.map((username, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-mma-red/20 text-mma-red rounded">@{username}</span>
                    ))}
                  </div>
                )}

                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-mma-gray">
                    {comments[post.id]?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {comments[post.id].map(comment => (
                          <div key={comment.id} className="text-sm">
                            <span className="text-mma-red font-medium">@{getCommentAuthorName(comment)}</span>
                            <span className="text-gray-300"> {comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Yorum yaz..."
                        className="flex-1 px-3 py-2 bg-mma-dark border border-mma-gray rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={submittingComment === post.id || !newComment.trim()}
                        className="px-4 py-2 bg-mma-red rounded-lg text-white disabled:opacity-50"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg mx-4 card-premium p-6 max-h-[90vh] overflow-y-auto">
            <button className="absolute top-4 right-4 p-2" onClick={() => setShowCreate(false)}>
              <X size={20} className="text-gray-400" />
            </button>

            <h2 className="font-oswald text-2xl font-bold text-white mb-4">Yeni Paylaşım</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Medya Türü</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('image')}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      form.mediaType === 'image' ? 'bg-mma-red text-white' : 'bg-mma-dark text-gray-400'
                    }`}
                  >
                    <Image size={18} /> Resim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('video')}
                    className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      form.mediaType === 'video' ? 'bg-mma-red text-white' : 'bg-mma-dark text-gray-400'
                    }`}
                  >
                    <Video size={18} /> Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Medya URL *</label>
                <div className="relative">
                  <Link size={18} className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={form.mediaUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white"
                    placeholder="https://..."
                  />
                </div>
                {form.mediaUrl && isValidUrl(form.mediaUrl) && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-mma-gray rounded text-gray-300">
                      {getProviderBadge(provider)}
                    </span>
                  </div>
                )}
                {form.mediaType === 'video' && form.mediaUrl && (
                  <p className="text-xs text-gray-500 mt-1">Desteklenen: YouTube, Instagram Reels, TikTok veya direkt video linki.</p>
                )}
                {isSocialVideo && form.mediaType === 'video' && (
                  <p className="text-xs text-yellow-500 mt-1">YouTube, Instagram ve TikTok videolarında süre otomatik doğrulanamaz.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Açıklama</label>
                <textarea
                  value={form.caption}
                  onChange={(e) => setForm(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white resize-none h-24"
                  placeholder="Açıklama yaz..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Etiketle</label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-gray-500 absolute left-3" />
                    <input
                      type="text"
                      value={searchTag}
                      onChange={(e) => {
                        setSearchTag(e.target.value)
                        if (e.target.value.length >= 2) handleSearchUsers()
                      }}
                      className="w-full pl-10 px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white"
                      placeholder="@kullanıcıadı veya e-posta..."
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-mma-charcoal border border-mma-gray rounded-xl overflow-hidden">
                      {searchResults.map(user => (
                        <button
                          key={user.uid}
                          type="button"
                          onClick={() => handleAddTag(user)}
                          className="w-full px-4 py-2 text-left text-white hover:bg-mma-gray flex items-center gap-2"
                        >
                          <Tag size={14} />
                          @{user.username || user.displayName || user.email.split('@')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.taggedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.taggedUsers.map(user => (
                      <span key={user.uid} className="flex items-center gap-1 px-2 py-1 bg-mma-red/20 text-mma-red rounded text-sm">
                        @{user.username || user.displayName || user.email.split('@')[0]}
                        <button type="button" onClick={() => handleRemoveTag(user.uid)}><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={creating || !canPublish()} className="w-full btn-primary flex items-center justify-center gap-2">
                {creating ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Paylaş</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}