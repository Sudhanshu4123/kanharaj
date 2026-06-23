"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, MapPin, CheckCircle, ShieldAlert, X } from "lucide-react"

export function PermissionConsentModal() {
  const [showModal, setShowModal] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>("default")
  const [locPermission, setLocPermission] = useState<string>("default")

  useEffect(() => {
    // Prevent rendering on SSR
    if (typeof window === "undefined") return

    // Check if user has already dismissed or completed this checklist
    const isDismissed = localStorage.getItem("kanharaj_permissions_checklist_done")
    if (isDismissed === "true") return

    // Check current permissions state
    if (typeof window.Notification !== "undefined") {
      setNotifPermission(Notification.permission)
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then(res => {
        setLocPermission(res.state)
        res.onchange = () => setLocPermission(res.state)
      }).catch(() => {
        // Fallback if query permissions is not supported
        setLocPermission("default")
      })
    }

    // Show modal if permissions are default/denied
    const notifStatus = typeof window.Notification !== "undefined" ? Notification.permission : "default"
    if (notifStatus === "default" || notifStatus === "denied") {
      // Delay showing the modal for better UX
      const timer = setTimeout(() => setShowModal(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (typeof window.Notification === "undefined") return

    try {
      const permission = await Notification.requestPermission()
      setNotifPermission(permission)
      if (permission === "granted") {
        new window.Notification("Permissions Enabled", {
          body: "Kanharaj notifications are successfully enabled!",
          icon: "/logo.png"
        })
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err)
    }
  }

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocPermission("granted")
        console.log("Location access granted:", pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setLocPermission("denied")
        console.error("Location access denied/failed:", err)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const handleDone = () => {
    localStorage.setItem("kanharaj_permissions_checklist_done", "true")
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleDone}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Decorative Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0a2540] to-yellow-400" />

          {/* Close button */}
          <button
            onClick={handleDone}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-14 h-14 bg-[#0a2540]/5 text-[#0a2540] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <ShieldAlert size={28} />
          </div>

          {/* Header */}
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            Enable Dashboard Permissions
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
            Allow the following browser permissions to enable real-time lead updates and property self-verification checks.
          </p>

          {/* Permissions Checklist List */}
          <div className="mt-6 space-y-4">
            {/* 1. Notifications permission card */}
            <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3 hover:border-slate-200 transition-colors bg-slate-50/50">
              <div className="w-8 h-8 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-[#0a2540] shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Real-Time Notifications</span>
                  {notifPermission === "granted" ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Required</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                  Sends instant alerts on your screen when a buyer inquiries about your properties.
                </p>
                {notifPermission !== "granted" && (
                  <button
                    onClick={requestNotificationPermission}
                    className="mt-2.5 px-3 py-1.5 bg-[#0a2540] hover:bg-[#07192c] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    Enable Alerts
                  </button>
                )}
              </div>
            </div>

            {/* 2. Geolocation permission card */}
            <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3 hover:border-slate-200 transition-colors bg-slate-50/50">
              <div className="w-8 h-8 rounded-xl bg-[#0a2540]/5 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Location Verification</span>
                  {locPermission === "granted" ? (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Required</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
                  Verifies that you are physically present at the property location to enable listing validation checks.
                </p>
                {locPermission !== "granted" && (
                  <button
                    onClick={requestLocationPermission}
                    className="mt-2.5 px-3 py-1.5 bg-[#0a2540] hover:bg-[#07192c] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    Enable Location
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleDone}
            className="w-full mt-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            I've Finished Setup
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
