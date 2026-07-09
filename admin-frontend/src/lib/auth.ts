export function getMainSiteUrl(): string {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        if (hostname === 'admin.kanharaj.com' || hostname === 'seller.kanharaj.com') {
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
        // Production: use backend via same domain
        if (hostname === 'admin.kanharaj.com' || hostname === 'seller.kanharaj.com' || hostname === 'kanharaj.com') {
            return 'https://kanharaj.com/api';
        }
        // Development: direct to Spring Boot (CORS now allows localhost:3002)
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
}

/** Log out admin dashboard and redirect to login. */
export function logoutFromAdminDashboard(): void {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    window.location.href = "/login"
}

/** Log out seller dashboard and sync logout on the main Kanharaj website. */
export function logoutFromSellerDashboard(): void {
    localStorage.removeItem("seller_token")
    localStorage.removeItem("seller_user")
    window.location.href = `${getMainSiteUrl()}/?logout=1`
}
