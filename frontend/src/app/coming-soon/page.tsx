import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-[#6B46C1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-[#6B46C1]" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Coming Soon
        </h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          We are working hard to bring you this feature. Stay tuned for exciting updates and new tools to enhance your real estate journey!
        </p>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-[#6B46C1] hover:bg-[#5536A3] text-white px-6 py-3 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg shadow-[#6B46C1]/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
