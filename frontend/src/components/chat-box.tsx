'use client'

import { useAuthStore } from '@/lib/store'
import { useChatBoxStore } from '@/lib/chat-box-store'
import { getApiUrl } from '@/lib/utils'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Send, X, Phone, CheckCircle, MessageSquare, Loader2, Building2, User } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

export function ChatBox() {
  const {
    isOpen,
    sellerId,
    propertyId,
    conversationId,
    setConversationId,
    openChat,
    closeChat,
    sellerName,
    sellerPhone,
    sellerProfileImage,
    propertyTitle,
    propertyPrice,
    propertyImage
  } = useChatBoxStore()
  const { user, isAuthenticated, token } = useAuthStore()

  // Auto-open if query params exist (e.g. after login redirect)
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return
    const params = new URLSearchParams(window.location.search)
    const sId = params.get('sellerId')
    const pId = params.get('propertyId')
    if (sId && pId) {
      openChat(sId, pId)
      const url = new URL(window.location.href)
      url.searchParams.delete('sellerId')
      url.searchParams.delete('propertyId')
      window.history.replaceState({}, '', url.toString())
    }
  }, [isAuthenticated, openChat])

  // API Config
  const API_URL = useMemo(() => getApiUrl(), [])

  // Local State Variables
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [sellerInfo, setSellerInfo] = useState<any | null>(null)
  const [propertyInfo, setPropertyInfo] = useState<any | null>(null)
  const [conversations, setConversations] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set fallback state immediately when chat is opened
  useEffect(() => {
    if (!isOpen) return
    setSellerInfo({
      name: sellerName || 'Owner',
      phone: sellerPhone || '',
      profileImage: sellerProfileImage || ''
    })
    if (propertyTitle) {
      setPropertyInfo({
        title: propertyTitle,
        price: propertyPrice,
        images: propertyImage ? [propertyImage] : []
      })
    } else {
      setPropertyInfo(null)
    }
  }, [isOpen, sellerName, sellerPhone, sellerProfileImage, propertyTitle, propertyPrice, propertyImage])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  // Initialize Chat & Messages
  useEffect(() => {
    if (!isOpen || !sellerId || !token || !isAuthenticated) {
      setMessages([])
      return
    }

    const initializeChatInWidget = async () => {
      setLoading(true)
      try {
        // 1. Get or Create conversation
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

        if (!res.ok) throw new Error('Failed to create/get conversation')
        const conv = await res.json()
        setConversationId(conv.id)

        // Set Seller and Property info from conversation payload
        const resolvedProp = conv.property || (propertyId ? {
          title: propertyTitle,
          price: propertyPrice,
          images: propertyImage ? [propertyImage] : []
        } : null)
        setPropertyInfo(resolvedProp)
        
        const otherUser = String(conv.buyer?.id) === String(user?.id) ? conv.seller : conv.buyer
        if (otherUser) {
          const nameLower = (otherUser.name || '').trim().toLowerCase()
          const isGenericName = !otherUser.name || nameLower === 'seller' || nameLower === 'user' || nameLower === 'owner' || nameLower === 'customer'
          
          const resolvedName = !isGenericName
            ? otherUser.name
            : (conv.property?.userName || sellerName || 'Owner')

          const resolvedPhone = otherUser.phone || conv.property?.userPhone || sellerPhone || ''
          const resolvedProfileImage = otherUser.profileImage || conv.property?.userProfileImage || sellerProfileImage || ''

          setSellerInfo({
            ...otherUser,
            name: resolvedName,
            phone: resolvedPhone,
            profileImage: resolvedProfileImage
          })
        }

        // 2. Fetch message history
        const msgRes = await fetch(`${API_URL}/chat/conversations/${conv.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (msgRes.ok) {
          const data = await msgRes.json()
          setMessages(data)

          // Pre-populate input text with availability check if conversation is empty
          if (data.length === 0 && resolvedProp) {
            setInputText(`Hi, is the property "${resolvedProp.title}" still available?`)
          } else {
            setInputText('')
          }
        }
      } catch (err) {
        console.error('Error initializing chat box:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeChatInWidget()
  }, [isOpen, sellerId, propertyId, token, isAuthenticated, API_URL])

  // Manage WebSocket connection for real-time messages
  useEffect(() => {
    if (!isOpen || !token || !isAuthenticated || !conversationId) return

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
      console.log('ChatBox Widget WebSocket opened.')
    }

    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data)
        if (newMsg.conversationId === conversationId) {
          setMessages(prev => {
            // Avoid duplicate messages
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message in widget:', err)
      }
    }

    socket.onclose = () => {
      console.log('ChatBox WebSocket closed.')
    }

    return () => {
      socket.close()
    }
  }, [isOpen, token, isAuthenticated, conversationId, API_URL])

  // Polling fallback when WebSocket is not active or drops
  useEffect(() => {
    if (!isOpen || !token || !isAuthenticated || !conversationId) return

    const pollMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(prev => {
            // Only update state if message length has changed to avoid unnecessary re-renders
            if (data.length === prev.length) return prev
            return data
          })
        }
      } catch (err) {
        console.warn('ChatBox polling error:', err)
      }
    }

    const intervalId = setInterval(pollMessages, 3000)
    return () => clearInterval(intervalId)
  }, [isOpen, token, isAuthenticated, conversationId, API_URL])

  // Poll conversations for unread messages when widget is closed
  useEffect(() => {
    if (isOpen || !token || !isAuthenticated) return

    const checkUnread = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
        }
      } catch (err) {
        console.warn('Unread checker error:', err)
      }
    }

    checkUnread() // check immediately
    const intervalId = setInterval(checkUnread, 6000)
    return () => clearInterval(intervalId)
  }, [isOpen, token, isAuthenticated, API_URL])

  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
  }, [conversations])

  const latestUnreadConv = useMemo(() => {
    return conversations.find(c => c.unreadCount > 0)
  }, [conversations])

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !conversationId || !token) return

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
          conversationId,
          content
        })
      })

      if (!res.ok) throw new Error('Failed to send message')

      const savedMsg = await res.json()

      // Update local messages state (fallback if WS latency occurs)
      setMessages(prev => {
        if (prev.find(m => m.id === savedMsg.id)) return prev
        return [...prev, savedMsg]
      })
    } catch (err) {
      console.error(err)
      alert('Could not send message. Please check connection.')
    }
  }

  if (!isAuthenticated) return null

  if (!isOpen && totalUnread > 0) {
    return (
      <button
        onClick={() => {
          if (latestUnreadConv) {
            const otherUser = String(latestUnreadConv.buyer?.id) === String(user?.id) 
              ? latestUnreadConv.seller 
              : latestUnreadConv.buyer
            openChat(String(otherUser.id), String(latestUnreadConv.property?.id || ''), {
              sellerName: otherUser.name,
              sellerPhone: otherUser.phone,
              sellerProfileImage: otherUser.profileImage,
              propertyTitle: latestUnreadConv.property?.title,
              propertyPrice: latestUnreadConv.property?.price,
              propertyImage: latestUnreadConv.property?.images ? getImageUrl(latestUnreadConv.property.images) : ''
            })
          } else if (conversations.length > 0) {
            const first = conversations[0]
            const otherUser = String(first.buyer?.id) === String(user?.id) ? first.seller : first.buyer
            openChat(String(otherUser.id), String(first.property?.id || ''), {
              sellerName: otherUser.name,
              sellerPhone: otherUser.phone,
              sellerProfileImage: otherUser.profileImage,
              propertyTitle: first.property?.title,
              propertyPrice: first.property?.price,
              propertyImage: first.property?.images ? getImageUrl(first.property.images) : ''
            })
          }
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#0a2540] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer border border-[#dfa127]/30 hover:bg-[#07192c] group"
        aria-label="View unread messages"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1.5 -right-1.5 bg-[#f22b68] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-white">
          {totalUnread}
        </span>
      </button>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[360px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 transition-all duration-300">
      
      {/* Header (Same color branding as KANHARAJ.COM) */}
      <div className="bg-[#0a2540] text-white px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner border border-white/20">
            {sellerInfo?.profileImage ? (
              <img src={sellerInfo.profileImage} alt={sellerInfo.name} className="w-full h-full object-cover" />
            ) : (
              sellerInfo?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4 text-white/80" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-black flex items-center gap-1">
              {sellerInfo?.name || 'Seller'}
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-white/70 font-semibold">Online · Response: Fast</span>
            </div>
          </div>
        </div>

        <button 
          onClick={closeChat} 
          className="p-1 rounded-lg hover:bg-white/10 text-white/85 hover:text-white transition-colors"
          aria-label="Close chat window"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Property Context Header (If selected) */}
      {propertyInfo && (
        <div className="bg-slate-50 border-b border-slate-200/80 p-2.5 px-4 flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-9 h-7 rounded overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
              <img
                src={getImageUrl(propertyInfo.images)}
                alt={propertyInfo.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Discussed Property</p>
              <h5 className="text-[10px] font-bold text-slate-700 truncate mt-0.5 leading-snug">{propertyInfo.title}</h5>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-extrabold text-[#0a2540] bg-[#0a2540]/5 px-2 py-0.5 rounded border border-[#0a2540]/10">
              ₹{propertyInfo.price ? (propertyInfo.price / 100000).toFixed(1) + ' L' : '0.0 L'}
            </span>
          </div>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#0a2540] mb-2" />
            <p className="text-[10px] font-bold">Connecting secure chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-center select-none">
            <MessageSquare className="w-8 h-8 opacity-30 mb-2 text-slate-350" />
            <p className="text-xs font-bold text-slate-500">Start new conversation</p>
            <p className="text-[10px] opacity-75 mt-0.5 max-w-[200px] mx-auto">Ask the owner about property features, price negotiation, or schedule a call.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = String(msg.senderId) === String(user?.id)
            const showTimestamp = idx === 0 || new Date(msg.createdAt).getTime() - new Date(messages[idx - 1].createdAt).getTime() > 300000 // 5 mins gap

            return (
              <div key={msg.id || idx} className="space-y-1">
                {showTimestamp && (
                  <div className="text-center py-1">
                    <span className="bg-slate-200/50 text-slate-500 text-[8px] font-bold tracking-wide px-2 py-0.5 rounded uppercase">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                )}
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 px-3.5 rounded-xl text-xs font-medium leading-relaxed shadow-sm ${isOwnMessage
                      ? 'bg-[#0a2540] text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
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

      {/* Chat Send Input Box Form Footer */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 px-4 flex gap-2 shrink-0">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs placeholder:text-slate-450 text-slate-800 focus:outline-none focus:border-[#0a2540] focus:ring-1 focus:ring-[#0a2540] transition-all font-semibold"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-[#0a2540] flex items-center justify-center shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
