export function getMainSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_MAIN_URL ||
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
    "http://localhost:3000"
  return url.replace(/\/$/, "")
}

/** Log out seller dashboard and sync logout on the main Kanharaj website. */
export function logoutFromSellerDashboard(): void {
  localStorage.removeItem("seller_token")
  localStorage.removeItem("seller_user")
  window.location.href = `${getMainSiteUrl()}/?logout=1`
}
