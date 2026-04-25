"use client"

import { usePropertyStore } from "@/lib/store"
import { Loader } from "@/components/ui/loader"
import { AnimatePresence } from "framer-motion"

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const loading = usePropertyStore((state) => state.loading)

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>
      {children}
    </>
  )
}
