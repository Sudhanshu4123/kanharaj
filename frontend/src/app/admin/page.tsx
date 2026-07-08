"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

export default function RevertedAdminPage() {
  const [adminUrl, setAdminUrl] = useState("http://localhost:3002")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      if (hostname === "kanharaj.com") {
        setAdminUrl("https://admin.kanharaj.com")
      } else {
        // Assume default admin port 3002 for local running
        setAdminUrl(`${protocol}//${hostname}:3002`)
      }
    }
  }, [])

  return (
    <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-[#0a2540]/5 rounded-3xl flex items-center justify-center mx-auto border border-[#dfa127]/25 text-[#dfa127]">
          <ShieldCheck size={32} className="fill-current/10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-wider text-[#0a2540]">Admin Panel Moved</h2>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            The administrator dashboard has been migrated to a dedicated, secure codebase at <span className="text-[#dfa127] font-bold">admin-frontend</span>.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Development</p>
          <code className="block bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono select-all">
            cd admin-frontend<br />
            npm run dev -- -p 3002
          </code>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={adminUrl}
            className="flex-1 h-11 bg-[#0a2540] hover:bg-[#07192c] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all"
          >
            Go to Admin <ArrowRight size={14} className="text-[#dfa127]" />
          </a>
          <Link
            href="/"
            className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all border"
          >
            <Home size={14} /> Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}
