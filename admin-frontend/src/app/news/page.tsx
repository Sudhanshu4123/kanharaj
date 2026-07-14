"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Newspaper, Trash2, Edit, Plus, X, CheckCircle2, AlertCircle, Loader2, Calendar, User
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getApiUrl } from "@/lib/auth"

interface NewsArticle {
  id: number
  title: string
  slug: string
  summary: string
  imageUrl?: string
  author: string
  createdAt: string
  updatedAt: string
}

export default function NewsDashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState("")
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null)

  useEffect(() => {
    async function loadNews() {
      const adminToken = localStorage.getItem("admin_token")
      if (!adminToken) {
        router.push("/login")
        return
      }
      setToken(adminToken)

      try {
        const res = await fetch(`${getApiUrl()}/news`)
        if (res.ok) {
          const data = await res.json()
          setArticles(data)
        } else {
          console.error("Failed to fetch articles")
        }
      } catch (err) {
        console.error("Failed to load news articles", err)
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [router])

  const confirmArticleDelete = async () => {
    if (!deleteArticleId || !token) return
    const id = deleteArticleId
    setDeleteArticleId(null)
    setMsg('Removing news article...')
    try {
      const res = await fetch(`${getApiUrl()}/news/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        setArticles(articles.filter(art => art.id !== id))
        setMsg('Article deleted successfully.')
      } else {
        setMsg('Failed to delete article.')
      }
    } catch (err) {
      setMsg('Error removing article.')
    }
    setTimeout(() => setMsg(''), 4000)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const totalPages = Math.ceil(articles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedArticles = articles.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#0a2540]" size={36} />
        <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading Editorial board...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
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
            <button onClick={() => setMsg('')} className="ml-auto p-1 hover:bg-black/5 rounded-md"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Newspaper className="text-[#dfa127]" size={24} />
            Market News & Editorial
          </h2>
          <p className="text-slate-500 text-xs italic mt-1 font-semibold">Publish and manage official news, guides, and blog articles.</p>
        </div>
        <Link
          href="/news/new"
          className="px-4 py-2 bg-[#0a2540] hover:bg-[#07192c] text-[#dfa127] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-[#dfa127]/20 shadow-md"
        >
          <Plus size={14} /> Write Article
        </Link>
      </div>

      <div className="space-y-5">
        {articles.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200 shadow-sm">
            <Newspaper size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No articles published yet</p>
            <Link
              href="/news/new"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-[#0a2540] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#dfa127] hover:text-[#0a2540] transition-all shadow"
            >
              <Plus size={12} /> Add your first post
            </Link>
          </div>
        ) : (
          paginatedArticles.map((art, idx) => (
            <div key={art.id} className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch justify-between gap-6 hover:border-[#dfa127]/60 transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 bg-[#0a2540] text-[#dfa127] px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-br-xl">
                Post #{startIndex + idx + 1}
              </div>
              <div className="flex gap-5 items-start flex-1 mt-4 md:mt-0">
                {art.imageUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-50">
                    <img src={art.imageUrl.startsWith("http") ? art.imageUrl : `${getApiUrl()}/uploads/${art.imageUrl}`} alt={art.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-550" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                    <Newspaper size={24} />
                  </div>
                )}
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-800 leading-tight pr-4">{art.title}</h4>
                  <p className="text-slate-500 text-xs font-semibold line-clamp-2 leading-relaxed max-w-xl">
                    {art.summary}
                  </p>
                  <div className="text-slate-400 text-[9px] font-bold flex flex-wrap items-center gap-4 pt-1">
                    <span className="flex items-center gap-1">
                      <User size={11} className="text-[#dfa127]" /> By {art.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(art.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-slate-300 italic truncate max-w-[150px]">slug: {art.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center md:flex-col justify-end gap-2.5 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <Link
                  href={`/news/edit/${art.id}`}
                  className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0a2540] rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/50"
                >
                  <Edit size={12} /> Edit
                </Link>
                <button
                  onClick={() => setDeleteArticleId(art.id)}
                  className="px-3.5 py-2 bg-slate-50 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center border cursor-pointer"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-white rounded-[2rem] border border-slate-200 shadow-sm gap-4">
          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, articles.length)} of {articles.length} posts
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 px-4 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              Prev
            </button>
            <span className="text-[10px] font-black text-slate-700 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white active:scale-95 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <AnimatePresence>
        {deleteArticleId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/65 backdrop-blur-sm" onClick={() => setDeleteArticleId(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl text-center border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1.5">Remove News Article?</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">Are you sure you want to permanently delete this news article? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={confirmArticleDelete} className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-all shadow">
                  Confirm Delete
                </button>
                <button onClick={() => setDeleteArticleId(null)} className="flex-1 h-11 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all border">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
