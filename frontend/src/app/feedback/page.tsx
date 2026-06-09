"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, MessageSquare, Send, CheckCircle2, ShieldAlert } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/store"
import { getApiUrl } from "@/lib/utils"

const categories = [
  "General Experience",
  "Property Search & Listings",
  "Customer Support",
  "Seller Dashboard Feedback",
  "Feature Suggestion",
  "Report a Bug"
]

export default function FeedbackPage() {
  const { user, isAuthenticated } = useAuthStore()
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Experience",
    comment: ""
  })
  
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }))
    }
  }, [isAuthenticated, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${getApiUrl()}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: form.category,
          comment: form.comment,
          rating: rating
        })
      })

      if (res.ok) {
        setSubmitted(true)
        setForm(prev => ({
          ...prev,
          comment: ""
        }))
        setRating(5)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to submit feedback. Please try again.")
      }
    } catch (err) {
      setError("Unable to connect to the server. Please check your internet connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 text-rose-600 shadow-lg shadow-rose-600/5"
          >
            <MessageSquare size={32} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            Share Your <span className="text-rose-600 italic">Feedback</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-500 text-lg max-w-lg mx-auto leading-relaxed"
          >
            Your feedback helps us grow. Let us know what you like, what you dislike, or suggest new features to make Kanharaj even better.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 sm:p-12 border-slate-100 shadow-2xl shadow-slate-100 rounded-[3rem] bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={40} className="animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Thank You for Your Feedback!</h3>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                    We appreciate you taking the time to share your experience. Your comments will be carefully reviewed by the Kanharaj team to improve our platform.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="mt-10 px-8 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10"
                  >
                    Submit Another Feedback
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {/* Rating Selector */}
                  <div className="space-y-3 text-center py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">How would you rate your experience?</Label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 transition-all hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={36}
                            className={`transition-colors ${
                              star <= (hoverRating !== null ? hoverRating : rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-500 capitalize tracking-wide block">
                      {rating === 5 ? "😍 Excellent!" : 
                       rating === 4 ? "😊 Very Good" : 
                       rating === 3 ? "😐 Average" : 
                       rating === 2 ? "😟 Poor" : "😡 Extremely Disappointed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Your full name"
                        className="h-12 rounded-xl border-slate-200"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                        className="h-12 rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Feedback Category *</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="comment" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Comments *</Label>
                    <textarea
                      id="comment"
                      rows={5}
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 resize-none font-medium leading-relaxed"
                      placeholder="Write your review, suggestions, or issues here..."
                      required
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2"
                    >
                      <ShieldAlert size={16} />
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-lg shadow-xl shadow-rose-600/10 transition-all flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={18} />
                        Submit Feedback
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
