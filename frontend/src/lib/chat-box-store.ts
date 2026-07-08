import { create } from 'zustand'

interface ChatBoxState {
  isOpen: boolean
  sellerId: string | null
  propertyId: string | null
  conversationId: number | null
  sellerName: string | null
  sellerPhone: string | null
  sellerProfileImage: string | null
  propertyTitle: string | null
  propertyPrice: number | null
  propertyImage: string | null
  openChat: (
    sellerId: string,
    propertyId: string,
    metadata?: {
      sellerName?: string
      sellerPhone?: string
      sellerProfileImage?: string
      propertyTitle?: string
      propertyPrice?: number
      propertyImage?: string
    }
  ) => void
  closeChat: () => void
  setConversationId: (id: number | null) => void
}

export const useChatBoxStore = create<ChatBoxState>((set) => ({
  isOpen: false,
  sellerId: null,
  propertyId: null,
  conversationId: null,
  sellerName: null,
  sellerPhone: null,
  sellerProfileImage: null,
  propertyTitle: null,
  propertyPrice: null,
  propertyImage: null,
  openChat: (sellerId, propertyId, metadata) => {
    set({
      isOpen: true,
      sellerId: String(sellerId),
      propertyId: String(propertyId),
      sellerName: metadata?.sellerName || null,
      sellerPhone: metadata?.sellerPhone || null,
      sellerProfileImage: metadata?.sellerProfileImage || null,
      propertyTitle: metadata?.propertyTitle || null,
      propertyPrice: metadata?.propertyPrice || null,
      propertyImage: metadata?.propertyImage || null,
    })
  },
  closeChat: () => {
    set({
      isOpen: false,
      sellerId: null,
      propertyId: null,
      conversationId: null,
      sellerName: null,
      sellerPhone: null,
      sellerProfileImage: null,
      propertyTitle: null,
      propertyPrice: null,
      propertyImage: null,
    })
  },
  setConversationId: (id) => set({ conversationId: id }),
}))
