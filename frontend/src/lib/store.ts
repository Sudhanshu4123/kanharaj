import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Property, Inquiry, User } from './data'

interface PropertyFilters {
  listingType: 'BUY' | 'RENT' | 'all'
  propertyType: string[]
  priceMin: number
  priceMax: number
  bedrooms: number[]
  bathrooms: number[]
  city: string
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
  fetchProperties: () => Promise<void>
  createProperty: (prop: Partial<Property>, token?: string) => Promise<Property>
  updateProperty: (id: string, prop: Partial<Property>, token?: string) => Promise<Property>
  deleteProperty: (id: string, token?: string) => Promise<void>
}

interface AuthStore {
  user: (User & { token?: string }) | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, phone: string, password: string) => Promise<void>
}

const defaultFilters: PropertyFilters = {
  listingType: 'all',
  propertyType: [],
  priceMin: 0,
  priceMax: 100000000,
  bedrooms: [],
  bathrooms: [],
  city: '',
  search: '',
}

// API Config: Uses /api by default for relative routing in production, 
// or environment variable if provided.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Timeout-aware fetch (15 seconds)
const fetchWithTimeout = (url: string, options: RequestInit = {}, ms = 15000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

const transformFromApi = (p: any): Property => {
  return {
    ...p,
    id: String(p.id),
    propertyType: p.propertyType?.toUpperCase(),
    listingType: p.listingType?.toUpperCase(),
    status: p.status?.toUpperCase(),
    price: typeof p.price === 'object' ? Number(p.price) : p.price,
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

function tryParse(str: string, fallback: any) {
  try { return JSON.parse(str) } catch { return fallback }
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      properties: [],
      filters: defaultFilters,
      loading: false,
      setProperties: (properties) => set({ properties }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),
      filteredProperties: () => {
        const { properties, filters } = get()
        return properties.filter((property) => {
          if (filters.listingType !== 'all' && property.listingType !== filters.listingType) return false
          if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.propertyType)) return false
          if (property.price < filters.priceMin || property.price > filters.priceMax) return false
          if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(property.bedrooms)) return false
          if (filters.bathrooms.length > 0 && !filters.bathrooms.includes(property.bathrooms)) return false
          if (filters.city && property.city?.toLowerCase() !== filters.city.toLowerCase()) return false
          
          if (filters.search) {
            const s = filters.search.toLowerCase()
            return (
              property.title?.toLowerCase().includes(s) ||
              property.city?.toLowerCase().includes(s) ||
              property.address?.toLowerCase().includes(s)
            )
          }
          return true
        })
      },
      setLoading: (loading) => set({ loading }),

      fetchProperties: async () => {
        if (get().properties.length === 0) {
          set({ loading: true })
        }
        
        try {
          const res = await fetchWithTimeout(`${API_URL}/properties?size=100`)
          const data = await res.json()
          const list = data.content ?? (Array.isArray(data) ? data : null)
          if (list) {
            set({ properties: list.map(transformFromApi) })
          }
          set({ loading: false })
        } catch (err) {
          console.warn('Backend offline, using cached properties.')
          set({ loading: false })
        }
      },

      createProperty: async (prop, token) => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/properties`, {
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
          const res = await fetchWithTimeout(`${API_URL}/properties/${id}`, {
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
          const res = await fetchWithTimeout(`${API_URL}/properties/${id}`, {
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
      partialize: (state) => ({ properties: state.properties }),
    }
  )
)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
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
          set({ user: data.user, token: data.token, isAuthenticated: true })
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            throw new Error('Server is offline. Please try again later.')
          }
          throw err
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
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
          set({ user: data.user, token: data.token, isAuthenticated: true })
        } catch (err: any) {
          if (err?.name === 'AbortError') throw new Error('Server is offline.')
          throw err
        }
      },
    }),
    {
      name: 'kanharaj-auth',
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
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
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
    try {
      // Sanitize for backend: propertyId must be number or null, status must be uppercase
      const sanitized = {
        ...inquiry,
        propertyId: inquiry.propertyId && !isNaN(Number(inquiry.propertyId)) 
          ? Number(inquiry.propertyId) 
          : null,
        status: (inquiry.status || 'PENDING').toUpperCase()
      }

      const res = await fetchWithTimeout(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitized)
      })
      if (!res.ok) throw new Error('Failed to submit inquiry')
      const data = await res.json()
      set(state => ({ inquiries: [data, ...state.inquiries] }))
    } catch (err) {
      console.error('Error adding inquiry:', err)
      // Fallback for offline usage
      const newInq = { ...inquiry, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString() } as Inquiry
      set(state => ({ inquiries: [newInq, ...state.inquiries] }))
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
export const fetchProperties = () => usePropertyStore.getState().fetchProperties()
export const createPropertyAPI = (prop: Partial<Property>, token?: string) => usePropertyStore.getState().createProperty(prop, token)
export const updatePropertyAPI = (id: string, prop: Partial<Property>, token?: string) => usePropertyStore.getState().updateProperty(id, prop, token)
export const deletePropertyAPI = (id: string, token?: string) => usePropertyStore.getState().deleteProperty(id, token)