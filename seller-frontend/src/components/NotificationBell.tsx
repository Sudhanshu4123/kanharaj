"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Trash2, X, Info, UserCheck, MessageSquare } from "lucide-react"
import { getApiUrl } from "@/lib/auth"

interface NotificationItem {
  id: number
  userId: number
  title: string
  message: string
  type: string
  isRead: boolean
  redirectUrl: string
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Helper to derive WebSocket URL
  const getWsUrl = () => {
    const apiUrl = getApiUrl()
    let wsUrl = ""
    if (apiUrl.startsWith("http")) {
      wsUrl = apiUrl.replace(/^http/, "ws")
    } else {
      if (typeof window !== "undefined") {
        const loc = window.location
        const newProto = loc.protocol === "https:" ? "wss:" : "ws:"
        const portStr = loc.port ? `:${loc.port}` : ""
        wsUrl = `${newProto}//${loc.hostname}${portStr}${apiUrl}`
      }
    }
    // Remove trailing /api and append /ws-notifications
    return wsUrl.replace(/\/api$/, "") + "/ws-notifications"
  }

  // Load existing notifications on startup
  const fetchNotifications = async () => {
    const token = localStorage.getItem("seller_token")
    if (!token) return

    try {
      const res = await fetch(`${getApiUrl()}/notifications`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        const unread = data.filter((n: NotificationItem) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Handle outside clicks to close dropdown
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Establish WebSocket connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem("seller_token")
    if (!token) return

    let socket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connectWebSocket = () => {
      const wsUrl = `${getWsUrl()}?token=${token}`
      console.log("Connecting to WebSocket notifications at:", wsUrl)
      
      socket = new WebSocket(wsUrl)

      socket.onmessage = (event) => {
        try {
          const newNotif: NotificationItem = JSON.parse(event.data)
          // Add to start of list
          setNotifications(prev => [newNotif, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show toast alert
          setActiveToast(newNotif)
          
          // Auto-hide toast after 5 seconds
          setTimeout(() => {
            setActiveToast(current => current?.id === newNotif.id ? null : current)
          }, 5000)
        } catch (e) {
          console.error("Error parsing WebSocket message:", e)
        }
      }

      socket.onclose = (event) => {
        console.log("WebSocket connection closed, reconnecting soon...", event.reason)
        reconnectTimeout = setTimeout(connectWebSocket, 5000)
      }

      socket.onerror = (err) => {
        console.error("WebSocket connection error:", err)
        socket?.close()
      }
    }

    connectWebSocket()

    return () => {
      if (socket) {
        // Prevent reconnect loop on component unmount
        socket.onclose = null
        socket.close()
      }
      clearTimeout(reconnectTimeout)
    }
  }, [])

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem("seller_token")
    if (!token) return

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch(`${getApiUrl()}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      })
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem("seller_token")
    if (!token) return

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)

    try {
      await fetch(`${getApiUrl()}/notifications/read-all`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
  }

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markAsRead(n.id)
    }
    setIsOpen(false)
    if (n.redirectUrl) {
      router.push(n.redirectUrl)
    }
  }

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    } catch {
      return ""
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "LEAD_RECEIVED":
        return <MessageSquare className="w-4 h-4 text-sky-500" />
      case "PROPERTY_VERIFIED":
        return <UserCheck className="w-4 h-4 text-emerald-500" />
      default:
        return <Info className="w-4 h-4 text-[#dfa127]" />
    }
  }

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer select-none focus:outline-none active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-[#0a2540] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2.5 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 text-slate-800"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-[#0a2540] hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold">No notifications yet</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">We'll alert you when something happens.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 hover:bg-slate-50/50 cursor-pointer flex gap-3 transition-colors relative group ${
                      !n.isRead ? "bg-[#0a2540]/5/10" : ""
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!n.isRead && (
                      <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-[#0a2540]" />
                    )}

                    {/* Icon container */}
                    <div className="w-7 h-7 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 break-words">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 block">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Toast Popups (Top-right Floating Toast) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-16 right-4 w-80 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 z-[9999] border border-white/10 flex gap-3 cursor-pointer"
            onClick={() => handleNotificationClick(activeToast)}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(activeToast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">New Notification</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveToast(null)
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-black text-white mt-1 leading-snug">{activeToast.title}</p>
              <p className="text-[11px] text-white/70 font-medium leading-relaxed mt-0.5 break-words">
                {activeToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
