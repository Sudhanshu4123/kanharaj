import { getApiUrl } from "./auth"

export function normalizeProfileImageUrl(url?: string | null): string {
  if (!url || url === 'null') return ''
  if (url.startsWith('http')) return url
  const apiBase = (getApiUrl() || '/api').replace(/\/api$/, '')
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export function buildProfileUpdateBody(data: {
  name?: string
  phone?: string
  description?: string
  experienceYears?: string
  profileImage?: string | null
}): Record<string, string> {
  const body: Record<string, string> = {}
  if (data.name !== undefined) body.name = data.name.trim()
  if (data.phone !== undefined) body.phone = data.phone.trim()
  if (data.description !== undefined) body.description = data.description.trim()
  if (data.experienceYears !== undefined) body.experienceYears = data.experienceYears.trim()
  if (data.profileImage !== undefined) {
    body.profileImage =
      data.profileImage === null || data.profileImage === '' ? '' : String(data.profileImage)
  }
  return body
}

export async function uploadProfileImage(file: File, token: string): Promise<string> {
  const fd = new FormData()
  fd.append('files', file)
  const res = await fetch(`${getApiUrl()}/upload/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  const url = data.urls?.[0]
  if (!url) throw new Error('No image URL returned')
  return url
}

export function syncSellerUserToStorage(user: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  localStorage.setItem('seller_user', JSON.stringify(user))
}
