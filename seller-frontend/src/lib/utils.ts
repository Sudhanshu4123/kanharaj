import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSellerAuthHeaders(contentType = "application/json"): Record<string, string> | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("seller_token")
  if (!token) return null
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (contentType) headers["Content-Type"] = contentType
  return headers
}

export async function getApiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    return data.message || data.error || fallback
  } catch {
    return fallback
  }
}

export function mapSellerPropertyType(
  propertyType: string,
  sector: string,
  lookingTo: string
): string {
  if (lookingTo === "PG/Co-living") return "PG"
  if (sector === "Commercial") {
    if (propertyType === "Office Space" || propertyType === "Office") return "OFFICE_SPACE"
    if (propertyType === "Shop" || propertyType === "Showroom") return "SHOP"
    return "COMMERCIAL"
  }
  switch (propertyType) {
    case "Independent House":
    case "Farm House":
      return "HOUSE"
    case "Villa":
      return "VILLA"
    case "Plot":
    case "Residential Plot":
    case "Agricultural Land":
      return "PLOT"
    case "Independent Floor":
      return "BUILDER_FLOOR"
    case "Studio Apartment":
    case "Apartment":
    case "Duplex":
    case "Penthouse":
      return "APARTMENT"
    default:
      return "FLAT"
  }
}

export function mapSellerListingType(lookingTo: string): "RENT" | "BUY" {
  if (lookingTo === "Rent" || lookingTo === "PG/Co-living") return "RENT"
  return "BUY"
}

export function parseBedroomsFromBhk(bhk: string): number {
  const match = bhk.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 3
  return Math.max(1, Math.ceil(parseFloat(match[1])))
}
