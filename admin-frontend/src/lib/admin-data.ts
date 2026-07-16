import { getApiUrl } from "./auth"

export interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'USER' | 'ADMIN' | 'SELLER' | 'user' | 'admin' | 'seller'
  subscriptionPlan?: string
  subscriptionExpiry?: string
  freePostsUsed?: number
}

export interface AdminProperty {
  id: string
  title: string
  description: string
  price: number
  propertyType: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'FLAT' | 'PLOT' | 'PG' | 'HOTEL' | 'COMMERCIAL' | 'RESIDENTIAL PROJECT' | 'COMMERCIAL PROJECT' | 'RESIDENTIAL_PROJECT' | 'COMMERCIAL_PROJECT' | 'PLOTS/LAND'
  listingType: 'BUY' | 'RENT'
  address: string
  city: string
  state: string
  pincode: string
  bedrooms: number
  bathrooms: number
  area: number
  yearBuilt: number
  amenities: string[]
  images: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD'
  featured: boolean
  verified?: boolean
  verifiedAt?: string
  developer?: string
  reraId?: string
  constructionStatus?: string
  possessionDate?: string
  projectUnits?: number
  areaUnit?: string
  projectArea?: string
  sizes?: string
  configurations?: string
  projectSize?: string
  launchDate?: string
  avgPrice?: string
  projectId?: number
  projectName?: string
  videoUrl?: string
  userId: string
  user?: { id: string; name: string; phone: string; profileImage?: string }
}

export interface AdminLead {
  id: string
  propertyId: string | null
  userId?: string
  name: string
  email: string
  phone: string
  message: string
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED'
  createdAt: string
}

export interface DashboardStats {
  totalProperties: number
  activeProperties: number
  featuredProperties: number
  totalUsers: number
  totalAdmins: number
  totalInquiries: number
  pendingInquiries: number
}

export async function fetchAdminDashboardStats(token: string): Promise<DashboardStats> {
  const res = await fetch(`${getApiUrl()}/admin/dashboard`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to fetch dashboard stats")
  return res.json()
}

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${getApiUrl()}/admin/users`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to fetch users list")
  return res.json()
}

export async function updateUserRoleAPI(userId: string, role: string, token: string): Promise<AdminUser> {
  const res = await fetch(`${getApiUrl()}/admin/users/${userId}/role?role=${role.toUpperCase()}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to update user role")
  return res.json()
}

export async function fetchAdminProperties(showProjectsOnly?: boolean): Promise<AdminProperty[]> {
  const url = showProjectsOnly 
    ? `${getApiUrl()}/properties?size=1000&showProjectsOnly=true` 
    : `${getApiUrl()}/properties?size=1000`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch property list")
  const data = await res.json()
  return (data.content || data || []).map((p: AdminProperty) => ({ ...p, id: String(p.id) }))
}

export async function verifyPropertyAPI(propId: string, verified: boolean, token: string): Promise<AdminProperty> {
  const res = await fetch(`${getApiUrl()}/admin/properties/${propId}/verify?verified=${verified}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to verify property")
  return res.json()
}

export async function togglePropertyFeaturedAPI(propId: string, featured: boolean, token: string): Promise<AdminProperty> {
  const res = await fetch(`${getApiUrl()}/admin/properties/${propId}/featured?featured=${featured}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to update featured status")
  return res.json()
}

export async function deletePropertyAPI(propId: string, token: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/properties/${propId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to delete property listing")
}

export async function fetchAdminLeads(token: string): Promise<AdminLead[]> {
  const res = await fetch(`${getApiUrl()}/inquiries`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to fetch leads list")
  return res.json()
}

export async function updateLeadStatusAPI(inqId: string, status: string, token: string): Promise<AdminLead> {
  const res = await fetch(`${getApiUrl()}/inquiries/${inqId}/status?status=${status.toUpperCase()}`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to update lead status")
  return res.json()
}

export async function deleteLeadAPI(inqId: string, token: string): Promise<void> {
  const res = await fetch(`${getApiUrl()}/inquiries/${inqId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
  if (!res.ok) throw new Error("Failed to delete lead")
}
