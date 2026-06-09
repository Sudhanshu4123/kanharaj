export function getMainSiteUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return "https://kanharaj.com"
    }
  }
  const url =
    process.env.NEXT_PUBLIC_MAIN_URL ||
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
    "https://kanharaj.com"
  return url.replace(/\/$/, "")
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return "https://kanharaj.com/api"
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://kanharaj.com/api"
}

/** Log out seller dashboard and sync logout on the main Kanharaj website. */
export function logoutFromSellerDashboard(): void {
  localStorage.removeItem("seller_token")
  localStorage.removeItem("seller_user")
  window.location.href = `${getMainSiteUrl()}/?logout=1`
}
