import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, User, ArrowLeft, Newspaper } from "lucide-react"
import { buildPageMetadata } from '@/lib/seo'

type Props = {
  params: Promise<{ id: string }>
}

async function getArticleDetails(idOrSlug: string): Promise<any | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const res = await fetch(`${apiUrl}/news/${idOrSlug}`, { next: { revalidate: 30 } })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("Failed to fetch news article details:", err)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const id = resolvedParams.id
  const article = await getArticleDetails(id)

  if (!article) {
    return buildPageMetadata({
      title: 'Article Not Found | Kanharaj',
      description: 'The requested news article does not exist or has been removed.',
    })
  }

  return buildPageMetadata({
    title: `${article.title} | Kanharaj Real Estate News`,
    description: article.summary,
    path: `/news/${article.slug || article.id}`,
    keywords: [article.title, 'Real Estate news', 'Kanharaj blogs', 'property market updates']
  })
}

export default async function NewsArticleDetailsPage({ params }: Props) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const article = await getArticleDetails(id)

  if (!article) {
    notFound()
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  const coverImg = article.imageUrl 
    ? (article.imageUrl.startsWith("http") ? article.imageUrl : `${apiUrl}/uploads/${article.imageUrl}`) 
    : null

  return (
    <article className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#dfa127] transition-colors"
        >
          <ArrowLeft size={14} /> Back to News list
        </Link>

        {/* Header Block */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-[#dfa127]" /> By {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {new Date(article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed border-l-4 border-[#dfa127] pl-4 italic">
            {article.summary}
          </p>
        </div>

        {/* Cover Photo */}
        {coverImg && (
          <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
            <img src={coverImg} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Main Content Body */}
        <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed space-y-6 text-sm sm:text-base whitespace-pre-line">
          {article.content}
        </div>
      </div>
    </article>
  )
}
