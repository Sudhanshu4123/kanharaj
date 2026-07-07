"use client"

import { useAuthStore } from '@/lib/store'
import { getApiUrl, BRAND_LOGO_SRC } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import {
  Send, User, Phone, ArrowLeft, Search, MessageSquare, Loader2,
  Building2, CheckCircle, ChevronLeft, Calendar, Badge, ShieldCheck, Mail
} from 'lucide-react'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, token } = useAuthStore()

  // API Config
  const API_URL = useMemo(() => getApiUrl(), [])

  // State Variables
  const [authReady, setAuthReady] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Wait for Auth hydration
  useEffect(() => {
    const finish = () => setAuthReady(true)
    if (useAuthStore.persist.hasHydrated()) finish()
    else return useAuthStore.persist.onFinishHydration(finish)
  }, [])

  // 2. Redirect to login if not authenticated
  useEffect(() => {
    if (!authReady) return
    if (!isAuthenticated) {
      router.replace('/login?redirect=/chat')
    }
  }, [authReady, isAuthenticated, router])

  // Helper: Normalize images
  const getImageUrl = (imageInput: any) => {
    let url = '';
    if (!imageInput) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    if (Array.isArray(imageInput) && imageInput.length > 0) {
      url = imageInput[0];
    } else if (typeof imageInput === 'string') {
      if (imageInput.startsWith('[') && imageInput.endsWith(']')) {
        try {
          const parsed = JSON.parse(imageInput);
          url = Array.isArray(parsed) ? parsed[0] : imageInput;
        } catch (e) {
          url = imageInput;
        }
      } else {
        url = imageInput;
      }
    }
    if (!url || url === '[]') return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
    if (url.startsWith('http')) {
      if (url.includes('localhost')) return url;
      return url.replace('http://', 'https://');
    }
    const apiBase = API_URL?.replace(/\/api$/, '') || '';
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 3. Fetch active conversations
  const fetchConversations = async (selectId?: number) => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to load conversations')
      const data = await res.json()
      setConversations(data)

      // If selectId is passed, make it the active conversation
      if (selectId) {
        const found = data.find((c: any) => c.id === selectId)
        if (found) {
          setActiveConv(found)
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // 4. Create or Load conversation from URL parameters
  useEffect(() => {
    if (!authReady || !isAuthenticated || !token) return

    const sellerId = searchParams.get('sellerId')
    const propertyId = searchParams.get('propertyId')
    const idParam = searchParams.get('id')

    const initializeChat = async () => {
      setLoading(true)
      try {
        if (idParam) {
          // Select specific conversation ID
          await fetchConversations(Number(idParam))
        } else if (sellerId) {
          // Create or retrieve conversation
          const res = await fetch(`${API_URL}/chat/conversations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              sellerId: Number(sellerId),
              propertyId: propertyId ? Number(propertyId) : null
            })
          })
          if (res.ok) {
            const conv = await res.json()
            await fetchConversations(conv.id)
            // Clear search params to keep URL clean
            router.replace('/chat')
          } else {
            await fetchConversations()
          }
        } else {
          await fetchConversations()
        }
      } catch (err) {
        console.error('Error initializing chat:', err)
        await fetchConversations()
      }
    }

    initializeChat()
  }, [authReady, isAuthenticated, searchParams, token])

  // 5. Fetch message history when active conversation changes
  useEffect(() => {
    if (!activeConv || !token) return

    const fetchMessages = async () => {
      setMessagesLoading(true)
      try {
        const res = await fetch(`${API_URL}/chat/conversations/${activeConv.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
          // Clear unreadCount on active conversation locally
          setConversations(prev =>
            prev.map(c => c.id === activeConv.id ? { ...c, unreadCount: 0 } : c)
          )
        }
      } catch (err) {
        console.error('Error loading messages:', err)
      } finally {
        setMessagesLoading(false)
      }
    }

    fetchMessages()
  }, [activeConv?.id, token])

  // 6. Manage WebSocket connection
  useEffect(() => {
    if (!token || !isAuthenticated) return

    // Build WebSocket URL
    let wsUrl = ''
    const apiBase = API_URL?.replace(/\/api$/, '') || ''
    if (apiBase.startsWith('https://')) {
      wsUrl = apiBase.replace('https://', 'wss://') + '/ws-chat?token=' + token
    } else if (apiBase.startsWith('http://')) {
      wsUrl = apiBase.replace('http://', 'ws://') + '/ws-chat?token=' + token
    } else if (typeof window !== 'undefined') {
      const loc = window.location
      const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
      if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1' || loc.hostname.startsWith('192.168.')) {
        wsUrl = `ws://localhost:8080/ws-chat?token=${token}`
      } else {
        wsUrl = `${proto}//${loc.host}/ws-chat?token=${token}`
      }
    }

    if (!wsUrl) return

    const socket = new WebSocket(wsUrl)
    setWs(socket)

    socket.onopen = () => {
      console.log('Real-time chat WebSocket connection opened.')
    }

    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data)
        
        // If message is for currently active conversation, append to list
        if (activeConv && newMsg.conversationId === activeConv.id) {
          setMessages(prev => [...prev, newMsg])
        }

        // Refresh conversation summary list
        setConversations(prev => {
          return prev.map(c => {
            if (c.id === newMsg.conversationId) {
              return {
                ...c,
                lastMessage: newMsg.content,
                lastMessageAt: newMsg.createdAt,
                unreadCount: (activeConv && activeConv.id === c.id) ? 0 : (c.unreadCount || 0) + 1
              }
            }
            return c
          }).sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        })
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    socket.onclose = () => {
      console.log('WebSocket closed, attempting reconnect in 5s...')
    }

    return () => {
      socket.close()
    }
  }, [token, isAuthenticated, activeConv?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeConv || !token) return

    const content = inputText.trim()
    setInputText('')

    try {
      const res = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConv.id,
          content
        })
      })

      if (!res.ok) throw new Error('Failed to send message')
      
      const savedMsg = await res.json()
      
      // Update local messages state (fallback if WS latency occurs)
      if (!messages.find(m => m.id === savedMsg.id)) {
        setMessages(prev => [...prev, savedMsg])
      }

      // Update conversations list summary locally
      setConversations(prev =>
        prev.map(c => c.id === activeConv.id ? { ...c, lastMessage: content, lastMessageAt: savedMsg.createdAt } : c)
          .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
      )

    } catch (err) {
      console.error(err)
      alert('Could not send message. Please check connection.')
    }
  }

  // Filter conversations based on search text
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const otherUser = String(c.buyer?.id) === String(user?.id) ? c.seller : c.buyer
      const nameMatch = otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const propMatch = c.property?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      return nameMatch || propMatch
    })
  }, [conversations, searchTerm, user?.id])

  // Get recipient profile display info
  const getRecipientInfo = (conv: any) => {
    if (!user) return { name: '', email: '', phone: '', profileImage: '' }
    return String(conv.buyer?.id) === String(user.id) ? conv.seller : conv.buyer
  }

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading your inbox...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) return null

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans md:-mt-16 sm:-mt-20">
      
      {/* Dynamic Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-6 w-6 rounded overflow-hidden flex items-center justify-center bg-white shadow-sm">
              <img src={BRAND_LOGO_SRC} alt="Kanharaj Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-heading text-base font-black tracking-tighter text-white">
              KANHARAJ<span className="text-[8px] font-extrabold ml-0.5 text-purple-400">.COM</span>
            </span>
          </Link>
          <div className="w-px h-5 bg-slate-800 mx-1" />
          <span className="text-xs font-semibold text-slate-400">Inbox Chat Portal</span>
        </div>

        <Link href="/profile" className="flex items-center gap-2 hover:opacity-90">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-tight">{user.name}</p>
            <p className="text-[9px] text-slate-400 leading-none">View Profile</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        </Link>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Conversations Inbox List */}
        <div className={`w-full md:w-[360px] lg:w-[400px] border-r border-slate-850 flex flex-col bg-slate-900/60 backdrop-blur-md shrink-0 transition-all duration-300 ${
          activeConv ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Inbox Search Bar */}
          <div className="p-4 border-b border-slate-850">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search chats or listings..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-white transition-all font-semibold"
              />
            </div>
          </div>

          {/* Conversations Thread Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-xs font-bold text-slate-400">No chats found</p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Start a chat directly from any property listing to contact the owner.</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeConv?.id === conv.id
                const recipient = getRecipientInfo(conv)
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-purple-600/15 border border-purple-500/30'
                        : 'hover:bg-slate-850/50 border border-transparent'
                    }`}
                  >
                    {/* User profile icon */}
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-750 flex items-center justify-center text-slate-300 font-extrabold text-sm shrink-0 overflow-hidden relative shadow-md">
                      {recipient.profileImage ? (
                        <img src={recipient.profileImage} alt={recipient.name} className="w-full h-full object-cover" />
                      ) : (
                        recipient.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-black text-slate-200 truncate pr-2">
                          {recipient.name}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-500 shrink-0">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''
                          }
                        </span>
                      </div>
                      
                      {/* Last message content */}
                      <p className="text-[11px] text-slate-400 truncate leading-snug font-medium">
                        {conv.lastMessage || 'No messages yet'}
                      </p>

                      {/* Associated property context tag */}
                      {conv.property && (
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/10 rounded-md py-0.5 px-2 w-max max-w-full">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.property.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Unread Message Badge */}
                    {conv.unreadCount > 0 && (
                      <div className="w-4.5 h-4.5 rounded-full bg-purple-500 text-[10px] font-black text-white flex items-center justify-center shrink-0 self-center shadow-lg">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div className={`flex-1 flex flex-col bg-slate-950/80 transition-all duration-300 ${
          activeConv ? 'flex' : 'hidden md:flex items-center justify-center p-8'
        }`}>
          {activeConv ? (
            <>
              {/* Chat View Header */}
              <div className="h-16 bg-slate-900/80 border-b border-slate-850 px-4 flex items-center gap-3 shrink-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setActiveConv(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors md:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Recipient Profile Details */}
                {(() => {
                  const rec = getRecipientInfo(activeConv)
                  return (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-300 font-black overflow-hidden relative shrink-0 shadow">
                        {rec.profileImage ? (
                          <img src={rec.profileImage} alt={rec.name} className="w-full h-full object-cover" />
                        ) : (
                          rec.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                          {rec.name}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate leading-snug flex items-center gap-1 mt-0.5">
                          {rec.phone && (
                            <span className="flex items-center gap-1 shrink-0"><Phone className="w-2.5 h-2.5 text-slate-500" /> {rec.phone}</span>
                          )}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Discussed Property Header Box */}
              {activeConv.property && (
                <div className="bg-slate-900/40 border-b border-slate-850/60 p-3 px-4 flex items-center justify-between gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-800">
                      <img
                        src={getImageUrl(activeConv.property.images)}
                        alt={activeConv.property.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">Property Discussed</p>
                      <h5 className="text-[11px] font-bold text-slate-200 truncate mt-0.5 leading-snug">{activeConv.property.title}</h5>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className="text-[11px] font-black text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/15">
                      ₹{activeConv.property.price ? (activeConv.property.price / 100000).toFixed(1) + ' L' : '0.0 L'}
                    </span>
                    <Link
                      href={`/property/${activeConv.property.id}`}
                      className="text-[10px] font-black text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 px-3 py-1 rounded-lg border border-slate-800 flex items-center justify-center transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )}

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/20">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-slate-500 text-center select-none">
                    <MessageSquare className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs font-semibold">No messages yet</p>
                    <p className="text-[10px] opacity-70 mt-0.5">Type below and tap send to begin conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwnMessage = String(msg.senderId) === String(user.id)
                    const showTimestamp = idx === 0 || new Date(msg.createdAt).getTime() - new Date(messages[idx-1].createdAt).getTime() > 300000 // 5 mins gap
                    
                    return (
                      <div key={msg.id || idx} className="space-y-1">
                        {showTimestamp && (
                          <div className="text-center py-2">
                            <span className="bg-slate-900/60 border border-slate-850/50 text-[8px] font-black tracking-wide text-slate-500 px-2 py-0.5 rounded-md uppercase">
                              {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] sm:max-w-[70%] p-3 px-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                            isOwnMessage
                              ? 'bg-purple-600 text-white rounded-tr-none'
                              : 'bg-slate-900 text-slate-200 border border-slate-850 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send Form Footer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/60 border-t border-slate-850 px-4 flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-600 text-white transition-all font-semibold"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/10"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 max-w-sm select-none">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-250">LuxeEstates Real-time Chats</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">Select a conversation thread from the left panel to start messaging owners, agents, and sellers directly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading your inbox...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}

