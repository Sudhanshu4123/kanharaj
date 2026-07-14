"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Download, Maximize2, Loader2, RefreshCw } from "lucide-react"

interface PdfViewerProps {
  pdfUrl: string
  title: string
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [pdf, setPdf] = useState<any>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)

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

    const pdfjsLib = (window as any).pdfjsLib
    const loadingTask = pdfjsLib.getDocument(pdfUrl)

    loadingTask.promise.then(
      (loadedPdf: any) => {
        setPdf(loadedPdf)
        setNumPages(loadedPdf.numPages)
        setPageNum(1)
        setIsLoading(false)
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

  // 3. Render PDF Page to Canvas
  const renderPage = (pageNumber: number) => {
    const container = containerRef.current
    if (!pdf || !canvasRef.current || !container) return

    setIsLoading(true)

    // Cancel existing render task if any
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
    }

    pdf.getPage(pageNumber).then(
      (page: any) => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const context = canvas.getContext("2d")
        if (!context) return

        // Compute viewport scale based on container width
        const containerWidth = container.clientWidth || 800
        const unscaledViewport = page.getViewport({ scale: 1.0 })
        const scale = (containerWidth - 32) / unscaledViewport.width
        const viewport = page.getViewport({ scale: scale * 1.5 }) // Render at slightly higher scale for crisp quality

        canvas.width = viewport.width
        canvas.height = viewport.height

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        renderTaskRef.current = renderTask

        renderTask.promise.then(
          () => {
            setIsLoading(false)
            renderTaskRef.current = null
          },
          (err: any) => {
            // Ignore rendering cancellations
            if (err.name !== "RenderingCancelledException") {
              console.error("Page render error:", err)
              setIsLoading(false)
            }
          }
        )
      },
      (err: any) => {
        console.error("Page fetch error:", err)
        setIsLoading(false)
      }
    )
  }

  // Render trigger on page change or PDF document loaded
  useEffect(() => {
    if (pdf) {
      renderPage(pageNum)
    }
  }, [pdf, pageNum])

  // Handle window resizing to adjust canvas width
  useEffect(() => {
    let timeoutId: any
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (pdf) {
          renderPage(pageNum)
        }
      }, 300)
    }
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [pdf, pageNum])

  // Pagination controls
  const handlePrev = () => {
    if (pageNum > 1) {
      setPageNum(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (pageNum < numPages) {
      setPageNum(prev => prev + 1)
    }
  }

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
      {/* PDF Canvas Viewport */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-4 md:p-6 scrollbar-thin">
        {error ? (
          <div className="text-center text-slate-400 p-6 max-w-md">
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
          <canvas 
            ref={canvasRef} 
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
          />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 bg-[#0d1527]/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Absolute Overlays (Download on bottom-left, Maximize on top-right) - ALWAYS VISIBLE */}
      {!error && (
        <>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-16 left-6 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 z-20 flex items-center justify-center cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </a>

          <button
            onClick={handleFullscreen}
            className="absolute top-6 right-6 p-2.5 bg-black/75 hover:bg-black/90 text-white rounded-lg transition-all duration-300 hover:scale-105 z-20 flex items-center justify-center cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bottom Slider & Navigation Controller - ALWAYS VISIBLE */}
      {numPages > 0 && !error && (
        <div className="w-full bg-[#0a0f1d] border-t border-slate-800/80 px-6 py-3 flex items-center justify-center gap-6 shrink-0 z-20">
          <button
            onClick={handlePrev}
            disabled={pageNum <= 1}
            className="p-1.5 text-slate-450 hover:text-white disabled:text-slate-700 disabled:opacity-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-[11px] font-black tracking-widest text-slate-400 select-none uppercase">
            {pageNum} of {numPages}
          </span>

          <button
            onClick={handleNext}
            disabled={pageNum >= numPages}
            className="p-1.5 text-slate-450 hover:text-white disabled:text-slate-700 disabled:opacity-50 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
