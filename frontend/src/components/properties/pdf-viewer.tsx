"use client"

import { useState, useEffect, useRef } from "react"
import { Download, Maximize2, Loader2, RefreshCw } from "lucide-react"

interface PdfViewerProps {
  pdfUrl: string
  title: string
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [pdf, setPdf] = useState<any>(null)
  const [numPages, setNumPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRenderTasks = useRef<any[]>([])

  // 1. Load PDF.js from CDN dynamically
  useEffect(() => {
    if (window.google && (window as any).pdfjsLib) {
      setIsScriptsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"
    script.async = true
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"
        setIsScriptsLoaded(true)
      } else {
        setError("Failed to initialize PDF library.")
      }
    }
    script.onerror = () => {
      setError("Failed to load PDF library script.")
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  // 2. Load PDF Document once scripts are loaded
  useEffect(() => {
    if (!isScriptsLoaded || !pdfUrl) return

    setIsLoading(true)
    setError(null)
    setPdf(null)
    setNumPages(0)

    const pdfjsLib = (window as any).pdfjsLib
    const loadingTask = pdfjsLib.getDocument(pdfUrl)

    loadingTask.promise.then(
      (loadedPdf: any) => {
        setPdf(loadedPdf)
        setNumPages(loadedPdf.numPages)
      },
      (err: any) => {
        console.error("PDF load error:", err)
        setError("Could not load PDF document. Please verify the file path or check the console.")
        setIsLoading(false)
      }
    )

    return () => {
      loadingTask.destroy()
    }
  }, [isScriptsLoaded, pdfUrl])

  // 3. Render all PDF Pages sequentially to avoid blocking UI thread
  const renderAllPages = async () => {
    if (!pdf || !containerRef.current) return

    setIsLoading(true)

    // Cancel any active render tasks
    activeRenderTasks.current.forEach(task => task.cancel())
    activeRenderTasks.current = []

    const container = containerRef.current
    const containerWidth = container.clientWidth || 800

    // Render pages sequentially
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i)
        const canvas = canvasRefs.current[i]
        if (!canvas) continue

        const context = canvas.getContext("2d")
        if (!context) continue

        // Compute viewport scale based on container width
        const unscaledViewport = page.getViewport({ scale: 1.0 })
        const scale = (containerWidth - 64) / unscaledViewport.width // 64px padding offset
        const viewport = page.getViewport({ scale: Math.max(scale, 1.0) * 1.5 }) // Render high-res

        canvas.width = viewport.width
        canvas.height = viewport.height

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        activeRenderTasks.current.push(renderTask)

        await renderTask.promise
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${i}:`, err)
        }
      }
    }

    setIsLoading(false)
  }

  // Trigger render when PDF document is loaded or numPages changes
  useEffect(() => {
    if (pdf && numPages > 0) {
      // Small timeout to let canvas refs mount first
      const t = setTimeout(() => {
        renderAllPages()
      }, 100)
      return () => clearTimeout(t)
    }
  }, [pdf, numPages])

  // Handle window resizing to adjust canvas width
  useEffect(() => {
    let timeoutId: any
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (pdf && numPages > 0) {
          renderAllPages()
        }
      }, 300)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [pdf, numPages])

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error("Error entering fullscreen:", err)
        })
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-[#0d1527] rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-between group shadow-inner min-h-[350px] md:h-[500px]"
    >
      {/* PDF Continuous Canvas Viewport */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center p-6 space-y-8 scrollbar-thin">
        {error ? (
          <div className="text-center text-slate-400 p-6 max-w-md my-auto">
            <RefreshCw className="w-10 h-10 mx-auto text-slate-500 mb-3 animate-spin-slow" />
            <p className="text-xs font-bold">{error}</p>
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-4 inline-block text-xs font-extrabold text-blue-500 hover:underline"
            >
              Open PDF directly in new tab
            </a>
          </div>
        ) : (
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="w-full flex flex-col items-center max-w-3xl">
              <canvas 
                ref={(el) => { canvasRefs.current[pageNum] = el }}
                className="max-w-full rounded-lg shadow-2xl bg-white transition-transform hover:scale-[1.01] duration-300"
              />
              <span className="text-[10px] font-black text-slate-500 tracking-wider mt-3 uppercase select-none">
                Page {pageNum} of {numPages}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute top-6 right-20 bg-slate-900/80 border border-slate-850 px-3 py-1.5 rounded-lg flex items-center gap-2 z-30 shadow-lg text-[9px] font-black uppercase tracking-wider text-slate-300">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          Rendering Pages...
        </div>
      )}

      {/* Absolute Overlays (Download on bottom-left, Maximize on top-right) */}
      {!error && (
        <>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 left-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 z-20 flex items-center justify-center cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={handleFullscreen}
            className="absolute top-6 right-6 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all duration-300 hover:scale-105 z-20 flex items-center justify-center cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
