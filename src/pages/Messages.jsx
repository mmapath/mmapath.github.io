import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { MessageSquare, Send, Plus, Search, X, Users, ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, searchUsersByUsernameOrEmail, getUserProfile } from '../services/userService'
import { createOrGetDmChat, createGroupChat, subscribeUserChats, subscribeMessages, sendMessage, markChatAsRead, getChatById } from '../services/chatService'
import { getFollowStatus, sendFollowRequest, acceptFollowRequest, rejectFollowRequest, subscribeToFollowRequests } from '../services/followService'
import Avatar from '../components/Avatar'

export default function Messages() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user: firebaseUser, userProfile } = useAuth()
  
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [message, setMessage] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [followRequests, setFollowRequests] = useState([])
  const [showRequestsPanel, setShowRequestsPanel] = useState(false)
  
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadChats()
  }, [firebaseUser])

  useEffect(() => {
    if (chatId) {
      loadSelectedChat(chatId)
    } else {
      setSelectedChat(null)
      setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    if (selectedChat) {
      const unsub = subscribeMessages(selectedChat.id, (msgs) => {
        setMessages(msgs)
        scrollToBottom()
        markChatAsRead(selectedChat.id)
      })
      return () => unsub()
    }
  }, [selectedChat?.id])

  useEffect(() => {
    if (firebaseUser) {
      const unsub = subscribeToFollowRequests(firebaseUser.uid, (requests) => {
        setFollowRequests(requests)
      })
      return () => unsub()
    }
  }, [firebaseUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    if (!firebaseUser) return
    setLoading(true)
    
    const unsub = subscribeUserChats(firebaseUser.uid, (chatList) => {
      const uniqueChats = Array.from(
        new Map(chatList.map(chat => [chat.id, chat])).values()
      )
      
      setChats(uniqueChats)
      setLoading(false)
      
      if (chatId && chatList.length > 0) {
        const found = chatList.find(c => c.id === chatId)
        if (found && !selectedChat) {
          setSelectedChat(found)
        }
      }
    })
    
    return () => unsub()
  }

  const loadSelectedChat = async (id) => {
    setChatLoading(true)
    setSelectedChat(null)
    
    const chat = await getChatById(id)
    
    if (chat && chat.memberIds?.includes(firebaseUser?.uid)) {
      setSelectedChat(chat)
    }
    
    setChatLoading(false)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    
    console.log("handleSendMessage clicked", {
      text: newMessage,
      selectedChat,
      userProfile,
      sending
    })
    
    if (!newMessage.trim()) {
      console.warn("Message blocked: empty text")
      return
    }
    
    if (!selectedChat?.id) {
      console.error("Message blocked: selectedChat missing", selectedChat)
      setMessage("Sohbet seçili değil.")
      return
    }
    
    const senderProfile = {
      ...userProfile,
      uid: userProfile?.uid || firebaseUser?.uid,
      email: userProfile?.email || firebaseUser?.email
    }
    
    if (!senderProfile?.uid) {
      console.error("Message blocked: senderProfile.uid missing", senderProfile)
      setMessage("Kullanıcı profili yüklenmedi.")
      return
    }
    
    if (sending) return
    
    setSending(true)
    try {
      await sendMessage({
        chatId: selectedChat.id,
        text: newMessage,
        currentUserProfile: senderProfile,
        selectedChat
      })
      setNewMessage('')
    } catch (err) {
      console.error("Send error full:", err)
      console.error("Send error message:", err.message)
      setMessage(`Mesaj gönderilemedi: ${err.message || "Bilinmeyen hata"}`)
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMemberSearch = async () => {
    if (!memberSearch.trim()) {
      setSearchResults([])
      return
    }
    const results = await searchUsersByUsernameOrEmail(memberSearch)
    setSearchResults(results.filter(u => u.uid !== firebaseUser?.uid && !selectedMembers.find(m => m.uid === u.uid)))
  }

  const handleAddMember = (user) => {
    if (!selectedMembers.find(m => m.uid === user.uid)) {
      setSelectedMembers([...selectedMembers, user])
    }
    setMemberSearch('')
    setSearchResults([])
  }

  const handleRemoveMember = (uid) => {
    setSelectedMembers(selectedMembers.filter(m => m.uid !== uid))
  }

  const handleCreateGroup = async () => {
    console.log("Create group clicked")
    console.log("Group name:", groupName)
    console.log("Selected members:", selectedMembers)
    console.log("Current user UID:", firebaseUser?.uid)
    
    if (!groupName.trim()) {
      console.error('handleCreateGroup: Grup adı gerekli')
      setMessage('Grup adı gerekli.')
      return
    }
    
    if (selectedMembers.length < 1) {
      console.error('handleCreateGroup: En az bir üye seçmelisin')
      setMessage('En az bir üye seçmelisin.')
      return
    }
    
    if (!firebaseUser?.uid) {
      console.error('handleCreateGroup: Kullanıcı yok')
      setMessage('Kullanıcı bulunamadı.')
      return
    }
    
    try {
      const memberUids = selectedMembers.map(m => m.uid)
      console.log("Creating group with memberUids:", memberUids)
      
      const chat = await createGroupChat(groupName, memberUids)
      console.log("Group creation result:", chat)
      
      if (chat && chat.id) {
        setMessage('Grup oluşturuldu.')
        navigate(`/messages/${chat.id}`)
        setShowCreateGroup(false)
        setGroupName('')
        setSelectedMembers([])
      } else {
        console.error('handleCreateGroup: Chat oluşturulamadı - sonuç yok')
        setMessage('Grup oluşturulamadı.')
      }
    } catch (err) {
      console.error('handleCreateGroup error:', err.code, err.message, err)
      setMessage('Grup oluşturulamadı.')
    }
  }

  const handleAcceptRequest = async (requester) => {
    try {
      await acceptFollowRequest(requester.requesterUid, firebaseUser.uid)
      setFollowRequests(prev => prev.filter(r => r.id !== requester.id))
    } catch (err) {
      console.error('handleAcceptRequest error:', err.code, err.message, err)
    }
  }

  const handleRejectRequest = async (requester) => {
    try {
      await rejectFollowRequest(requester.requesterUid, firebaseUser.uid)
      setFollowRequests(prev => prev.filter(r => r.id !== requester.id))
    } catch (err) {
      console.error('handleRejectRequest error:', err.code, err.message, err)
    }
  }

  const getChatTitle = (chat) => {
    if (chat.type === 'group') return chat.groupName
    
    const otherUid = chat.memberIds?.find(id => id !== firebaseUser?.uid)
    const info = chat.memberInfo?.[otherUid]
    return info?.username || info?.displayName || otherUid
  }

  const getChatSubtitle = (chat) => {
    const lastMsg = chat.lastMessage
    if (!lastMsg) return 'Henüz mesaj yok'
    return lastMsg.length > 30 ? lastMsg.slice(0, 30) + '...' : lastMsg
  }

  const getChatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Dün'
    if (days < 7) return date.toLocaleDateString('tr-TR', { weekday: 'short' })
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleChatClick = (chat) => {
    navigate(`/messages/${chat.id}`)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-80 flex-shrink-0 flex flex-col card-premium">
        <div className="p-4 border-b border-mma-gray">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-oswald text-xl font-bold text-white">Mesajlar</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setShowRequestsPanel(!showRequestsPanel)}
                className="relative p-2 rounded-lg hover:bg-mma-dark"
              >
                <Users size={18} className="text-gray-400" />
                {followRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-mma-red text-white text-xs rounded-full flex items-center justify-center">
                    {followRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-lg hover:bg-mma-dark"
              >
                <Plus size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {showRequestsPanel && followRequests.length > 0 && (
            <div className="mb-3 p-3 bg-mma-dark rounded-lg max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">Takip İstekleri</p>
              {followRequests.map(req => (
                <div key={req.id} className="flex items-center gap-2 py-2 border-b border-mma-gray/30 last:border-0">
                  <Avatar 
                    username={req.requesterUsername}
                    size="sm"
                  />
                  <span className="flex-1 text-white text-sm truncate">@{req.requesterUsername}</span>
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                  >
                    <UserPlus size={14} />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req)}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-mma-red" size={24} />
            </div>
          ) : chats.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">Henüz mesaj yok.</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`block p-3 border-b border-mma-gray/30 hover:bg-mma-dark cursor-pointer ${chatId === chat.id ? 'bg-mma-dark' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar 
                    username={chat.type === 'group' ? chat.groupName : getChatTitle(chat)}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{getChatTitle(chat)}</p>
                    <p className="text-gray-500 text-xs truncate">{getChatSubtitle(chat)}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{getChatTime(chat.lastMessageAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col card-premium">
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Sohbet seçin veya yeni başlatın.</p>
          </div>
        ) : chatLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-mma-red" size={32} />
          </div>
        ) : !selectedChat ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Sohbet yükleniyor...</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-mma-gray">
              <div className="flex items-center gap-3">
                <Avatar 
                  username={selectedChat.type === 'group' ? selectedChat.groupName : getChatTitle(selectedChat)}
                  size="md"
                />
                <div>
                  <p className="text-white font-medium">{getChatTitle(selectedChat)}</p>
                  {selectedChat.type === 'group' && (
                    <p className="text-gray-500 text-xs">{selectedChat.memberIds?.length || 0} üye</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isOwn = msg.senderId === firebaseUser?.uid
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs ${isOwn ? 'bg-mma-red text-white' : 'bg-mma-dark text-white'} rounded-2xl px-4 py-2`}>
                      {!isOwn && selectedChat.type === 'group' && (
                        <p className="text-xs text-mma-red mb-1">@{msg.senderUsername}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-mma-gray">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white resize-none h-12"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 bg-mma-red rounded-xl text-white disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-1">Enter: Gönder | Shift+Enter: Yeni satır</p>
            </div>
          </>
        )}
      </div>
      
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreateGroup(false)} />
          <div className="relative w-full max-w-md mx-4 card-premium p-6">
            <button className="absolute top-4 right-4 p-2" onClick={() => setShowCreateGroup(false)}>
              <X size={20} className="text-gray-400" />
            </button>
            
            <h2 className="font-oswald text-2xl font-bold text-white mb-4">Grup Oluştur</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Grup Adı</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white"
                  placeholder="Grup adı..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Üye Ekle</label>
                <div className="relative">
                  <Search size={18} className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      if (e.target.value.length >= 2) handleMemberSearch()
                    }}
                    className="w-full pl-10 px-4 py-3 bg-mma-dark border border-mma-gray rounded-xl text-white"
                    placeholder="Kullanıcı ara..."
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-mma-charcoal border border-mma-gray rounded-xl max-h-40 overflow-y-auto">
                    {searchResults.map(user => (
                      <button
                        key={user.uid}
                        onClick={() => handleAddMember(user)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-mma-gray flex items-center gap-2"
                      >
                        <span>@{user.username || user.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map(m => (
                    <span key={m.uid} className="flex items-center gap-1 px-2 py-1 bg-mma-red/20 text-mma-red rounded text-sm">
                      @{m.username || m.displayName}
                      <button onClick={() => handleRemoveMember(m.uid)}><X size={14} /></button>
                    </span>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedMembers.length < 1}
                className="w-full btn-primary"
              >
                Grup Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}