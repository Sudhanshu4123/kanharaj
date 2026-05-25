"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

/** Clears main-site auth when redirected from seller dashboard logout (?logout=1). */
export function CrossSiteLogoutHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("logout") !== "1") return
    useAuthStore.getState().logout()
    router.replace("/")
  }, [searchParams, router])

  return null
}
