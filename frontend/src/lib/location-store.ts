import { create } from 'zustand'

interface LocationStore {
  selectedCity: string
  setSelectedCity: (city: string) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  selectedCity: 'All India',
  setSelectedCity: (city: string) => set({ selectedCity: city }),
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}))
