import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Property, Inquiry, User } from './data'
import { tryParse, getSellerUrl, getApiUrl } from './utils'
import { buildProfileUpdateBody } from './profile-utils'
import { useUserActivityStore } from './user-activity-store'

interface PropertyFilters {
  listingType: 'BUY' | 'RENT' | 'all'
  propertyType: string[]
  priceMin: number
  priceMax: number
  bedrooms: number[]
  bathrooms: number[]
  city: string
  state: string
  search: string
}

interface PropertyStore {
  properties: Property[]
  filters: PropertyFilters
  loading: boolean
  setProperties: (properties: Property[]) => void
  setFilters: (filters: Partial<PropertyFilters>) => void
  resetFilters: () => void
  filteredProperties: () => Property[]
  setLoading: (loading: boolean) => void
  fetchProperties: (pageSize?: number, fetchAll?: boolean) => Promise<void>
  fetchMyProperties: (token: string) => Promise<void>
  createProperty: (prop: Partial<Property>, token?: string) => Promise<Property>
  updateProperty: (id: string, prop: Partial<Property>, token?: string) => Promise<Property>
  deleteProperty: (id: string, token?: string) => Promise<void>
  wishlist: string[]
  toggleWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
}

interface AuthStore {
  user: (User & { token?: string }) | null
  token: string | null
  isAuthenticated: boolean
  users: User[]
  login: (email: string, password: string) => Promise<{ message?: string } | void>
  logout: () => void
  register: (name: string, email: string, phone: string, password: string) => Promise<any>
  verifyLoginOtp: (email: string, otp: string) => Promise<void>
  setAuth: (user: any, token: string) => void
  refreshUser: () => Promise<void>
  fetchUsers: (token?: string) => Promise<void>
  updateProfile: (data: { profileImage?: string | null; description?: string; experienceYears?: string; name?: string; phone?: string }) => Promise<void>
}

const defaultFilters: PropertyFilters = {
  listingType: 'all',
  propertyType: [],
  priceMin: 0,
  priceMax: 1000000000,
  bedrooms: [],
  bathrooms: [],
  city: '',
  state: '',
  search: '',
}

// API Config: dynamically resolved per-call so browser always uses relative /api path
// (which is proxied by Next.js rewrites to the backend).
export const API_URL = getApiUrl()

// Dynamic resolver - use this inside async functions for correct browser/SSR handling
function resolveApiUrl(): string { return getApiUrl() }

// Timeout-aware fetch (15 seconds)
const fetchWithTimeout = (url: string, options: RequestInit = {}, ms = 15000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

const transformFromApi = (p: any): Property => {
  const user =
    p.user ||
    (p.userId
      ? {
          id: String(p.userId),
          name: p.userName || 'Seller',
          email: '',
          phone: p.userPhone || '',
          role: 'SELLER' as const,
          profileImage: p.userProfileImage,
          description: p.userDescription,
          experienceYears: p.userExperienceYears,
        }
      : undefined)

  return {
    ...p,
    id: String(p.id),
    propertyType: p.propertyType?.toUpperCase(),
    listingType: p.listingType?.toUpperCase(),
    status: p.status?.toUpperCase(),
    price: typeof p.price === 'object' ? Number(p.price) : p.price,
    user,
    userId: p.userId ? String(p.userId) : p.userId,
    images: (Array.isArray(p.images) ? p.images : (p.images ? tryParse(p.images, []) : [])).map((img: string) => {
      if (!img) return ''
      if (img.startsWith('http')) return img // Cloudinary / Unsplash — keep as-is
      if (img.startsWith('/api/uploads/') || img.startsWith('/uploads/')) return img // already relative ✓
      if (img.startsWith('api/uploads/')) return `/${img}` // fix missing leading slash
      if (img.startsWith('uploads/')) return `/api/${img}` // fix old db format
      return img
    }).filter(Boolean),
    amenities: Array.isArray(p.amenities) ? p.amenities : (p.amenities ? tryParse(p.amenities, []) : []),
  }
}

const transformToApi = (prop: Partial<Property>) => ({
  ...prop,
  propertyType: prop.propertyType?.toUpperCase(),
  listingType: prop.listingType?.toUpperCase(),
  status: prop.status?.toUpperCase(),
})

const isPropertyTypeMatch = (filterType: string, propType: string): boolean => {
  if (!filterType || !propType) return false;
  const f = filterType.toUpperCase().replace(/[\s+]+/g, '_');
  const p = propType.toUpperCase().replace(/[\s+]+/g, '_');
  
  if (f === p) return true;
  
  const mapType = (type: string) => {
    if (type === 'INDEPENDENT_HOUSE' || type === 'FARM_HOUSE' || type === 'HOUSE') return 'HOUSE';
    if (type === 'INDEPENDENT_FLOOR' || type === 'BUILDER_FLOOR') return 'BUILDER_FLOOR';
    if (type === 'PLOTS/LAND' || type === 'AGRICULTURAL_LAND' || type === 'PLOT') return 'PLOT';
    if (type === 'PENTHOUSE' || type === 'DUPLEX' || type === 'STUDIO' || type === 'APARTMENT' || type === 'FLAT') return 'APARTMENT';
    if (type === 'OFFICE' || type === 'OFFICE_SPACE') return 'OFFICE_SPACE';
    if (type === 'RETAIL_SHOP' || type === 'SHOWROOM' || type === 'SHOP') return 'SHOP';
    return type;
  }
  
  return mapType(f) === mapType(p);
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      filters: defaultFilters,
      loading: false,
      wishlist: [],
      setProperties: (properties) => set({ properties }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),
      toggleWishlist: (id: string) => {
        const current = get().wishlist
        if (current.includes(id)) {
          set({ wishlist: current.filter(wid => wid !== id) })
        } else {
          set({ wishlist: [...current, id] })
        }
      },
      isInWishlist: (id: string) => get().wishlist.includes(id),
      filteredProperties: () => {
        const { properties, filters } = get()
        return properties.filter((property) => {
          if (filters.listingType !== 'all' && property.listingType !== filters.listingType) return false
          if (filters.propertyType.length > 0 && !filters.propertyType.some(t => isPropertyTypeMatch(t, property.propertyType || ''))) return false
          if (property.price < filters.priceMin || property.price > filters.priceMax) return false
          if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(property.bedrooms)) return false
          if (filters.bathrooms.length > 0 && !filters.bathrooms.includes(property.bathrooms)) return false
          if (filters.city) {
            const filterCity = filters.city.toLowerCase().trim()
            const propCity = (property.city || '').toLowerCase()
            const propAddress = (property.address || '').toLowerCase()
            const matchesCity =
              propCity === filterCity ||
              propCity.includes(filterCity) ||
              filterCity.includes(propCity) ||
              propAddress.includes(filterCity)
            if (!matchesCity) return false
          }
          if (filters.state) {
            const filterState = filters.state.toLowerCase().trim()
            const propState = (property.state || '').toLowerCase()
            const matchesState =
              propState === filterState ||
              propState.includes(filterState) ||
              filterState.includes(propState)
            if (!matchesState) return false
          }
          
          if (filters.search) {
            const s = filters.search.toLowerCase()
            return (
              property.title?.toLowerCase().includes(s) ||
              property.city?.toLowerCase().includes(s) ||
              property.address?.toLowerCase().includes(s) ||
              property.description?.toLowerCase().includes(s) ||
              property.propertyType?.toLowerCase().includes(s)
            )
          }
          return true
        })
      },
      setLoading: (loading) => set({ loading }),

      fetchProperties: async (pageSize = 36, fetchAll = true) => {
        // Always show loading spinner on first load; for refreshes keep showing stale data
        if (get().properties.length === 0) {
          set({ loading: true })
        }
        
        try {
          const apiUrl = resolveApiUrl()
          const res = await fetchWithTimeout(`${apiUrl}/properties?size=${pageSize}&t=${Date.now()}`, {
            cache: 'no-store'
          })
          const data = await res.json()
          let list = data.content ?? (Array.isArray(data) ? data : null)
          if (list) {
            const totalElements = data.totalElements
            if (fetchAll && typeof totalElements === 'number' && totalElements > list.length) {
              // Automatically fetch all remaining properties by requesting the exact database size
              const fullRes = await fetchWithTimeout(`${apiUrl}/properties?size=${totalElements + 50}&t=${Date.now()}`, {
                cache: 'no-store'
              })
              const fullData = await fullRes.json()
              const fullList = fullData.content ?? (Array.isArray(fullData) ? fullData : null)
              if (fullList) {
                list = fullList
              }
            }
            set({ properties: list.map(transformFromApi) })
          }
          set({ loading: false })
        } catch (err) {
          console.warn('Backend offline, using cached properties.')
          set({ loading: false })
        }
      },

      fetchMyProperties: async (token: string) => {
        set({ loading: true })
        try {
          const apiUrl = resolveApiUrl()
          const res = await fetchWithTimeout(`${apiUrl}/properties/my`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
          })
          if (!res.ok) throw new Error('Failed to fetch my properties')
          const data = await res.json()
          const myProps = data.map(transformFromApi)
          // Merge with existing properties or just replace if needed
          set(state => ({ 
            properties: [...state.properties.filter(p => !myProps.find((mp: Property) => mp.id === p.id)), ...myProps],
            loading: false 
          }))
        } catch (err) {
          console.error('Error fetching my properties:', err)
          set({ loading: false })
        }
      },

      createProperty: async (prop, token) => {
        try {
          const apiUrl = resolveApiUrl()
          const res = await fetchWithTimeout(`${apiUrl}/properties`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(transformToApi(prop))
          })
          
          console.log('API Request POST /properties:', transformToApi(prop))

          if (!res.ok) {
            const errText = await res.text().catch(() => 'Unknown error');
            console.error('API Error Response:', res.status, errText)
            throw new Error(`HTTP ${res.status}: ${errText}`);
          }
          
          let data;
          try {
            data = await res.json()
          } catch (e) {
            throw new Error('Server returned invalid data format.')
          }
          const newProp = transformFromApi(data)
          set(state => ({ properties: [...state.properties, newProp] }))
          return newProp
        } catch (error: any) {
          throw new Error('Failed to save property. ' + error.message);
        }
      },

      updateProperty: async (id, prop, token) => {
        try {
          const apiUrl = resolveApiUrl()
          const res = await fetchWithTimeout(`${apiUrl}/properties/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(transformToApi(prop))
          })
          if (!res.ok) {
            const errText = await res.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${res.status}: ${errText}`);
          }
          const data = await res.json()
          const updated = transformFromApi(data)
          set(state => ({
            properties: state.properties.map(p => String(p.id) === String(id) ? updated : p)
          }))
          return updated
        } catch (error: any) {
          throw new Error('Failed to update property. ' + error.message);
        }
      },

      deleteProperty: async (id, token) => {
        try {
          const apiUrl = resolveApiUrl()
          const res = await fetchWithTimeout(`${apiUrl}/properties/${id}`, {
            method: 'DELETE',
            ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {})
          })
          if (!res.ok) {
            const errText = await res.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${res.status}: ${errText}`);
          }
        } catch (err: any) {
          throw new Error('Failed to delete property. ' + err.message);
        }
        set(state => ({
          properties: state.properties.filter(p => String(p.id) !== String(id))
        }))
      },
    }),
    {
      name: 'shrishyam-properties',
      partialize: (state) => ({ properties: state.properties, wishlist: state.wishlist }),
    }
  )
)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: [],
      login: async (email, password) => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: 'Invalid credentials' }))
            throw new Error(errData.message || 'Invalid credentials')
          }

          const data = await res.json()
          if (data.message === 'OTP_SENT' || data.message === 'VERIFICATION_REQUIRED') {
             return data;
          }

          set({ user: data.user, token: data.token, isAuthenticated: true })
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            throw new Error('Server is offline. Please try again later.')
          }
          throw err
        }
      },
      verifyLoginOtp: async (email, otp) => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/login-verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`, {
            method: 'POST'
          })
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: 'Invalid OTP' }))
            throw new Error(errData.message || 'Invalid OTP')
          }

          const data = await res.json()
          set({ user: data.user, token: data.token, isAuthenticated: true })
        } catch (err: any) {
          throw err
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, users: [] })
        if (typeof window !== 'undefined') {
          useAuthStore.persist.clearStorage()
          const sellerUrl = getSellerUrl()
          if (sellerUrl && sellerUrl !== 'undefined') {
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = `${sellerUrl.replace(/\/$/, '')}/auth/logout-sync`
            document.body.appendChild(iframe)
            setTimeout(() => iframe.remove(), 3000)
          }
        }
      },
      updateProfile: async (data) => {
        try {
          const state = useAuthStore.getState();
          const token = state.token;
          const user = state.user;
          if (!token || !user) throw new Error('Not authenticated')

          const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(buildProfileUpdateBody(data)),
          })

          if (!response.ok) {
            const errText = await response.text().catch(() => '')
            throw new Error(errText || 'Failed to update profile')
          }

          const updatedUser = await response.json()
          set({ user: { ...updatedUser, token: state.token } })
        } catch (error) {
          console.error('Update profile error:', error)
          throw error
        }
      },
      register: async (name, email, phone, password) => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
          })
          
          if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: 'Registration failed' }))
            throw new Error(errData.message || 'Registration failed')
          }
          
          const data = await res.json()
          return data
        } catch (err: any) {
          if (err?.name === 'AbortError') throw new Error('Server is offline.')
          throw err
        }
      },
      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      refreshUser: async () => {
        const token = useAuthStore.getState().token
        if (!token) return
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return
          const user = await res.json()
          set({ user: { ...user, token } })
        } catch (err) {
          console.warn('Failed to refresh user profile', err)
        }
      },
      fetchUsers: async (token) => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/admin/users`, {
            headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            cache: 'no-store'
          })
          if (!res.ok) throw new Error('Failed to fetch users')
          const data = await res.json()
          set({ users: data })
        } catch (err) {
          console.error('Error fetching users:', err)
        }
      },
    }),
    {
      name: 'kanharaj-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

interface InquiryStore {
  inquiries: Inquiry[]
  loading: boolean
  fetchInquiries: (token?: string) => Promise<void>
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt'>) => Promise<void>
  updateInquiryStatus: (id: string, status: string, token?: string) => Promise<void>
  deleteInquiry: (id: string, token?: string) => Promise<void>
}

export const useInquiryStore = create<InquiryStore>((set, get) => ({
  inquiries: [],
  loading: false,
  fetchInquiries: async (token) => {
    set({ loading: true })
    try {
      const res = await fetchWithTimeout(`${API_URL}/inquiries`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Failed to fetch inquiries')
      const data = await res.json()
      set({ inquiries: data, loading: false })
    } catch (err) {
      console.error('Error fetching inquiries:', err)
      set({ loading: false })
    }
  },
  addInquiry: async (inquiry) => {
    const sanitized = {
      ...inquiry,
      propertyId: inquiry.propertyId && !isNaN(Number(inquiry.propertyId))
        ? Number(inquiry.propertyId)
        : null,
      status: (inquiry.status || 'PENDING').toUpperCase(),
    }

    try {
      const res = await fetchWithTimeout(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized)
      })
      if (!res.ok) throw new Error('Failed to submit inquiry')
      const data = await res.json()
      set(state => ({ inquiries: [data, ...state.inquiries] }))
      if (sanitized.propertyId) {
        useUserActivityStore.getState().recordContacted(String(sanitized.propertyId))
      }
    } catch (err) {
      console.error('Error adding inquiry:', err)
      // Fallback for offline usage
      const newInq = { ...inquiry, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString() } as Inquiry
      set(state => ({ inquiries: [newInq, ...state.inquiries] }))
      if (sanitized.propertyId) {
        useUserActivityStore.getState().recordContacted(String(sanitized.propertyId))
      }
    }
  },
  updateInquiryStatus: async (id, status, token) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/inquiries/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      if (!res.ok) throw new Error('Failed to update status')
      const data = await res.json()
      set(state => ({
        inquiries: state.inquiries.map(inq => String(inq.id) === String(id) ? data : inq)
      }))
    } catch (err) {
      console.error('Error updating inquiry:', err)
    }
  },
  deleteInquiry: async (id, token) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/inquiries/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      if (!res.ok) throw new Error('Failed to delete inquiry')
      set(state => ({
        inquiries: state.inquiries.filter(inq => String(inq.id) !== String(id))
      }))
    } catch (err) {
      console.error('Error deleting inquiry:', err)
    }
  }
}))

// Helper exports
export const fetchProperties = (pageSize?: number, fetchAll?: boolean) => usePropertyStore.getState().fetchProperties(pageSize, fetchAll)
export const createPropertyAPI = (prop: Partial<Property>, token?: string) => usePropertyStore.getState().createProperty(prop, token)
export const updatePropertyAPI = (id: string, prop: Partial<Property>, token?: string) => usePropertyStore.getState().updateProperty(id, prop, token)
export const deletePropertyAPI = (id: string, token?: string) => usePropertyStore.getState().deleteProperty(id, token)