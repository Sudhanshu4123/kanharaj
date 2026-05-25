"use client"

import { usePropertyStore } from "@/lib/store"
import { PageLoadingBar } from "@/components/ui/page-loading-bar"

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const loading = usePropertyStore((state) => state.loading)

  return (
    <>
      <PageLoadingBar active={loading} />
      {children}
    </>
  )
}
