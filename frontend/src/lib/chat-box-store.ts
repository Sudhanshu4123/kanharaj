import { create } from 'zustand'

interface ChatBoxState {
  isOpen: boolean
  sellerId: string | null
  propertyId: string | null
  conversationId: number | null
  openChat: (sellerId: string, propertyId: string) => void
  closeChat: () => void
  setConversationId: (id: number | null) => void
}

export const useChatBoxStore = create<ChatBoxState>((set) => ({
  isOpen: false,
  sellerId: null,
  propertyId: null,
  conversationId: null,
  openChat: (sellerId, propertyId) => {
    set({
      isOpen: true,
      sellerId: String(sellerId),
      propertyId: String(propertyId),
    })
  },
  closeChat: () => {
    set({
      isOpen: false,
      sellerId: null,
      propertyId: null,
      conversationId: null,
    })
  },
  setConversationId: (id) => set({ conversationId: id }),
}))
