import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, User, ArrowRight, Newspaper } from "lucide-react"
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Real Estate News & Property Market Insights | Kanharaj',
  description: 'Stay updated with the latest trends in the real estate market, buying guides, investment tips, and official announcements at Kanharaj.',
  path: '/news',
})

async function getNewsArticles(): Promise<any[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const res = await fetch(`${apiUrl}/news`, { next: { revalidate: 30 } })
    if (!res.ok) return []
    return await res.json()
  } catch (err) {
    console.error("Failed to fetch news articles for website:", err)
    return []
  }
}

export default async function NewsArticlesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page || '1'))
  const articles = await getNewsArticles()

  const itemsPerPage = 30
  const totalPages = Math.ceil(articles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedArticles = articles.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      
      {/* 1. Full-Width Hero Banner */}
      <div className="relative text-white overflow-hidden min-h-[250px] sm:min-h-[300px] flex items-center px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-200/20 shadow-lg">
        {/* Background Image */}
        <img 
          src="/news-hero.jpg" 
          alt="Real Estate News Banner" 
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/10"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto w-full space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-[#dfa127] rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 backdrop-blur-sm select-none">
            <Newspaper size={11} /> Kanharaj Editorial Board
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
            Real Estate News & Insights
          </h1>
          <p className="text-white/80 text-sm leading-relaxed font-semibold drop-shadow max-w-2xl">
            Read verified market reports, property guides, local regulations, and real estate trends curated by our team of professionals.
          </p>
        </div>
      </div>

      {/* 2. Main Content Listing (Centered Container) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Content Listing */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-250/60 p-20 text-center shadow-sm max-w-md mx-auto">
            <Newspaper size={44} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wider mb-2">No news items found</h3>
            <p className="text-slate-400 text-xs font-semibold">Our editorial board is currently preparing insights. Please check back shortly.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {paginatedArticles.map((art, idx) => {
              const articleUrl = `/news/${art.slug || art.id}`
              const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
              const coverImg = art.imageUrl 
                ? (art.imageUrl.startsWith("http") ? art.imageUrl : `${apiBaseUrl}/uploads/${art.imageUrl}`) 
                : '/logo.png'

              const formattedDate = new Date(art.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })

              return (
                <div key={art.id} className="flex flex-col md:flex-row gap-6 md:gap-8 pb-8 border-b border-slate-200">
                  
                  {/* Left: Image Container */}
                  <div className="w-full md:w-[280px] shrink-0 relative aspect-[16/10] md:aspect-auto md:h-[175px] rounded overflow-hidden bg-slate-50 border border-slate-100">
                    <Link href={articleUrl} className="block w-full h-full">
                      <img
                        src={coverImg}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    {/* Property Trends Badge */}
                    <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none">
                      Property Trends
                    </div>
                  </div>

                  {/* Right: Content Details */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 space-y-3">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        BY {art.author.toUpperCase()} | {formattedDate.toUpperCase()}
                      </div>
                      
                      <Link href={articleUrl} className="block">
                        <h3 className="text-lg md:text-xl font-bold text-slate-950 leading-snug hover:underline">
                          {art.title}
                        </h3>
                      </Link>
                      
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                        {art.summary}
                      </p>
                    </div>

                    <div>
                      <Link
                        href={articleUrl}
                        className="inline-block text-[11px] font-bold uppercase tracking-wider text-purple-750 hover:underline"
                      >
                        READ FULL STORY
                      </Link>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Control */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-slate-200 gap-4 mt-8">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, articles.length)} of {articles.length} posts
            </span>
            <div className="flex items-center gap-1.5">
              {currentPage > 1 ? (
                <Link
                  href={`/news?page=${currentPage - 1}`}
                  className="h-8 px-3 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider text-slate-650 bg-white hover:bg-slate-50 flex items-center justify-center transition-all select-none"
                >
                  Prev
                </Link>
              ) : (
                <span className="h-8 px-3 border border-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-350 bg-slate-50 flex items-center justify-center opacity-50 select-none">
                  Prev
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-700 px-2.5 py-1.5 bg-white rounded border border-slate-200 select-none">
                Page {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`/news?page=${currentPage + 1}`}
                  className="h-8 px-3 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider text-slate-650 bg-white hover:bg-slate-50 flex items-center justify-center transition-all select-none"
                >
                  Next
                </Link>
              ) : (
                <span className="h-8 px-3 border border-slate-100 rounded text-[10px] font-bold uppercase tracking-wider text-slate-350 bg-slate-50 flex items-center justify-center opacity-50 select-none">
                  Next
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
