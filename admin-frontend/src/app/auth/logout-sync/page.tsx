"use client"

import { useEffect } from "react"

/** Clears seller session when loaded in a hidden iframe from the main website. */
export default function LogoutSyncPage() {
  useEffect(() => {
    localStorage.removeItem("seller_token")
    localStorage.removeItem("seller_user")
  }, [])

  return null
}
