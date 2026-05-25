/** Profile image URL + API payload helpers */

export function normalizeProfileImageUrl(url?: string | null): string {
  if (!url || url === 'null') return ''
  if (url.startsWith('http')) return url
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/api$/, '')
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export type ProfileFormData = {
  name?: string
  phone?: string
  description?: string
  experienceYears?: string
  profileImage?: string | null
}

export function buildProfileUpdateBody(data: ProfileFormData): Record<string, string> {
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  const res = await fetch(`${apiUrl}/upload/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Image upload failed')
  }
  const data = await res.json()
  const url = data.urls?.[0]
  if (!url) throw new Error('No image URL returned')
  return url
}
