import { create } from 'zustand'

interface LocationStore {
  selectedCity: string
  setSelectedCity: (city: string) => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  selectedCity: 'All India',
  setSelectedCity: (city: string) => set({ selectedCity: city }),
}))
