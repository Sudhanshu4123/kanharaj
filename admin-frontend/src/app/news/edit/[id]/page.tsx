"use client"

import { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Newspaper, ArrowLeft, Save, Upload, Loader2, AlertCircle, CheckCircle2, X
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getApiUrl } from "@/lib/auth"

export default function EditNewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const id = resolvedParams.id

  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [author, setAuthor] = useState("")
  const [slug, setSlug] = useState("")
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    if (!adminToken) {
      router.push("/login")
      return
    }
    setToken(adminToken)

    async function loadArticle() {
      try {
        const res = await fetch(`${getApiUrl()}/news/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTitle(data.title)
          setSummary(data.summary)
          setContent(data.content)
          setImageUrl(data.imageUrl || "")
          setAuthor(data.author)
          setSlug(data.slug || "")
        } else {
          setMsg("Error: Article not found.")
        }
      } catch (err) {
        console.error(err)
        setMsg("Error: Failed to fetch article details.")
      } finally {
        setLoading(false)
      }
    }
    loadArticle()
  }, [id, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !token) return

    setUploading(true)
    setMsg("Uploading image...")

    const formData = new FormData()
    formData.append("files", files[0])

    try {
      const res = await fetch(`${getApiUrl()}/upload/images`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.urls && data.urls.length > 0) {
          setImageUrl(data.urls[0])
          setMsg("Image uploaded successfully!")
        } else {
          setMsg("Error: Image upload failed.")
        }
      } else {
        const data = await res.json()
        setMsg(`Upload failed: ${data.error ? data.error[0] : "Invalid format"}`)
      }
    } catch (err) {
      console.error(err)
      setMsg("Failed to connect to image upload server.")
    } finally {
      setUploading(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setMsg("Error: Title, Summary, and Content are required.")
      return
    }

    setSaving(true)
    setMsg("Saving article...")

    try {
      const res = await fetch(`${getApiUrl()}/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          summary,
          content,
          imageUrl,
          author,
          slug
        })
      })

      if (res.ok) {
        setMsg("Article updated successfully!")
        setTimeout(() => {
          router.push("/news")
        }, 1500)
      } else {
        setMsg("Error: Failed to update news article.")
        setSaving(false)
      }
    } catch (err) {
      console.error(err)
      setMsg("Error: Failed to connect to server.")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Article details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm ${msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
          >
            {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-xs font-bold tracking-wide uppercase">{msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Link href="/news" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Newspaper className="text-[#dfa127]" size={20} />
              Edit News Article
            </h2>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Editorial Board Composer</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">Article Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner"
            required
          />
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">Short Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner resize-none"
            required
          />
        </div>

        {/* URL Slug */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">URL Slug (leave blank to auto-generate from title)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. gurgaon-real-estate-demands"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">Cover Image URL / Upload</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL here or upload below"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner"
            />
            <label className="px-4 py-3 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow border border-white/5 shrink-0 select-none">
              {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              Upload Image
              <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={uploading} />
            </label>
          </div>
          {imageUrl && (
            <div className="mt-2 w-full max-w-sm h-36 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm relative group">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg transition-all"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Author */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">Author Name</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner"
              required
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 text-xs font-black uppercase tracking-wider">Article Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-sm outline-none focus:border-[#dfa127]/60 focus:bg-white transition-all shadow-inner"
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 h-12 bg-[#0a2540] hover:bg-[#dfa127] hover:text-[#0a2540] disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow border border-white/5"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Save Changes
          </button>
          <Link
            href="/news"
            className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center border"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
