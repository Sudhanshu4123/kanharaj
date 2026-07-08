export function getMainSiteUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'admin.kanharaj.com') {
      return 'https://kanharaj.com';
    }
    return `${protocol}//${hostname}:3000`;
  }
  const url =
    process.env.NEXT_PUBLIC_MAIN_URL ||
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
    "https://kanharaj.com";
  return url.replace(/\/$/, "");
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'admin.kanharaj.com') {
      return 'https://kanharaj.com/api';
    }
    // Return absolute API URL in development to bypass Next.js proxy rewrite bugs with multipart/form-data uploads
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:8080/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
}

/** Log out admin dashboard and sync logout on the main Kanharaj website. */
export function logoutFromAdminDashboard(): void {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("admin_user")
  window.location.href = `${getMainSiteUrl()}/?logout=1`
}
