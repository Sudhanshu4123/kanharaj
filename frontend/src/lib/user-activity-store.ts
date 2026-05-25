import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RecentSearch = {
  id: string
  label: string
  href: string
  at: number
}

const MAX_SEEN = 30
const MAX_CONTACTED = 30
const MAX_SEARCHES = 15

function uniquePrepend(list: string[], id: string, max: number): string[] {
  const next = [id, ...list.filter((x) => x !== id)]
  return next.slice(0, max)
}

interface UserActivityStore {
  seenPropertyIds: string[]
  contactedPropertyIds: string[]
  recentSearches: RecentSearch[]
  recordSeen: (propertyId: string) => void
  recordContacted: (propertyId: string) => void
  recordSearch: (label: string, href: string) => void
  clearAll: () => void
}

export const useUserActivityStore = create<UserActivityStore>()(
  persist(
    (set, get) => ({
      seenPropertyIds: [],
      contactedPropertyIds: [],
      recentSearches: [],

      recordSeen: (propertyId) => {
        const id = String(propertyId)
        if (!id) return
        set({ seenPropertyIds: uniquePrepend(get().seenPropertyIds, id, MAX_SEEN) })
      },

      recordContacted: (propertyId) => {
        const id = String(propertyId)
        if (!id) return
        set({ contactedPropertyIds: uniquePrepend(get().contactedPropertyIds, id, MAX_CONTACTED) })
      },

      recordSearch: (label, href) => {
        const trimmed = label.trim()
        if (!trimmed || !href) return
        const entry: RecentSearch = {
          id: `${Date.now()}-${trimmed}`,
          label: trimmed,
          href,
          at: Date.now(),
        }
        const filtered = get().recentSearches.filter(
          (s) => s.href !== href && s.label !== trimmed
        )
        set({ recentSearches: [entry, ...filtered].slice(0, MAX_SEARCHES) })
      },

      clearAll: () =>
        set({ seenPropertyIds: [], contactedPropertyIds: [], recentSearches: [] }),
    }),
    { name: 'kanharaj-user-activity' }
  )
)
