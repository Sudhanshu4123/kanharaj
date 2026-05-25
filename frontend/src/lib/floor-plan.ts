import { Property } from './data'

export type FloorPlanRoom = {
  name: string
  dimLabel: string
  className: string
  variant?: 'balcony' | 'default'
}

const TYPICAL_AREA_BY_BHK: Record<number, number> = {
  1: 550,
  2: 950,
  3: 1250,
  4: 1650,
  5: 2100,
}

const NON_RESIDENTIAL_TYPES = new Set([
  'PLOT',
  'COMMERCIAL',
  'PG',
  'HOTEL',
  'OFFICE_SPACE',
  'SHOP',
  'PLOTS/LAND',
  'PLOTS_LAND',
])

function roundFt(value: number): number {
  return Math.max(5, Math.round(value))
}

/** Convert sq.ft. area to display dimensions (feet). */
export function sqFtToDimLabel(sqFt: number, aspectRatio = 1.2): string {
  if (!sqFt || sqFt <= 0) return '—'
  const width = Math.sqrt(sqFt / aspectRatio)
  const length = sqFt / width
  return `${roundFt(width)}'0" x ${roundFt(length)}'0"`
}

export function parseCarpetAreaFromDescription(description?: string): number | null {
  if (!description) return null
  const match = description.match(/Carpet Area:\s*([\d,.]+)\s*Sq\.?\s*Ft/i)
  if (!match) return null
  const value = parseFloat(match[1].replace(/,/g, ''))
  return Number.isFinite(value) && value > 0 ? value : null
}

export function resolveBedrooms(property: Property): number {
  if (property.bedrooms && property.bedrooms > 0) {
    return Math.min(Math.max(property.bedrooms, 1), 5)
  }
  const fromTitle = property.title?.match(/(\d+(?:\.\d+)?)\s*BHK/i)
  if (fromTitle) return Math.min(Math.max(Math.ceil(parseFloat(fromTitle[1])), 1), 5)
  const fromDesc = property.description?.match(/BHK:\s*(\d+(?:\.\d+)?)/i)
  if (fromDesc) return Math.min(Math.max(Math.ceil(parseFloat(fromDesc[1])), 1), 5)
  return 2
}

export function resolveBathrooms(property: Property, bedrooms: number): number {
  if (property.bathrooms && property.bathrooms > 0) {
    return Math.min(property.bathrooms, 6)
  }
  const fromDesc = property.description?.match(/Bathrooms:\s*(\d+)/i)
  if (fromDesc) return parseInt(fromDesc[1], 10)
  return bedrooms >= 3 ? 2 : 1
}

export function getEffectiveCarpetArea(property: Property, bedrooms: number): number {
  const fromDescription = parseCarpetAreaFromDescription(property.description)
  if (fromDescription) return fromDescription
  if (property.area && property.area > 0) return property.area
  return TYPICAL_AREA_BY_BHK[bedrooms] || TYPICAL_AREA_BY_BHK[3]
}

export function isResidentialFloorPlan(property: Property): boolean {
  const type = (property.propertyType || '').toUpperCase().replace(/\s+/g, '_').replace('/', '_')
  if (type === 'PLOTS_LAND') return false
  return !NON_RESIDENTIAL_TYPES.has(property.propertyType?.toUpperCase() || '') &&
    !NON_RESIDENTIAL_TYPES.has(type)
}

function allocateRoomSqFt(
  totalSqFt: number,
  bedrooms: number,
  bathrooms: number
): Record<string, number> {
  const baths = Math.max(1, bathrooms)
  const bathShare = Math.min(0.06 * baths, 0.18)
  const balconyShare = 0.07
  const kitchenShare = bedrooms <= 1 ? 0.12 : 0.1
  const livingShare = bedrooms === 1 ? 0.34 : bedrooms === 2 ? 0.3 : 0.28
  const remaining = 1 - livingShare - kitchenShare - bathShare - balconyShare

  const areas: Record<string, number> = {
    living: totalSqFt * livingShare,
    kitchen: totalSqFt * kitchenShare,
    balcony: totalSqFt * balconyShare,
  }

  for (let i = 1; i <= baths; i++) {
    areas[`bath${i}`] = (totalSqFt * bathShare) / baths
  }

  if (bedrooms === 1) {
    areas.bed1 = totalSqFt * (remaining - 0.02)
  } else if (bedrooms === 2) {
    areas.master = totalSqFt * (remaining * 0.55)
    areas.bed2 = totalSqFt * (remaining * 0.45)
  } else {
    const bedCount = bedrooms
    areas.master = totalSqFt * (remaining * 0.38)
    areas.bed2 = totalSqFt * (remaining * 0.24)
    areas.bed3 = totalSqFt * (remaining * (bedCount >= 4 ? 0.18 : 0.22))
    if (bedCount >= 4) areas.bed4 = totalSqFt * (remaining * 0.12)
    if (bedCount >= 5) areas.bed5 = totalSqFt * (remaining * 0.08)
  }

  return areas
}

function room(
  name: string,
  sqFt: number,
  className: string,
  variant?: FloorPlanRoom['variant']
): FloorPlanRoom {
  return { name, dimLabel: sqFtToDimLabel(sqFt), className, variant }
}

export function buildFloorPlanRooms(property: Property): {
  rooms: FloorPlanRoom[]
  carpetArea: number
  bedrooms: number
  bathrooms: number
  subtitle: string
} {
  const bedrooms = resolveBedrooms(property)
  const bathrooms = resolveBathrooms(property, bedrooms)
  const carpetArea = getEffectiveCarpetArea(property, bedrooms)
  const areas = allocateRoomSqFt(carpetArea, bedrooms, bathrooms)

  const fromDesc = parseCarpetAreaFromDescription(property.description)
  const areaSource = fromDesc
    ? 'carpet area from listing details'
    : property.area && property.area > 0
      ? 'built-up area on record'
      : `typical ${bedrooms} BHK size`

  const subtitle = `${formatNumber(carpetArea)} sq.ft. · ${bedrooms} BHK · ${bathrooms} bath${bathrooms > 1 ? 's' : ''} · ${areaSource}`

  if (bedrooms === 1) {
    return {
      carpetArea,
      bedrooms,
      bathrooms,
      subtitle,
      rooms: [
        room('Living Room', areas.living, 'col-span-4 row-span-4'),
        room('Kitchen', areas.kitchen, 'col-span-2 row-span-3'),
        room('Toilet', areas.bath1, 'col-span-2 row-span-3'),
        room('Bedroom', areas.bed1, 'col-span-4 row-span-2'),
        room('Balcony', areas.balcony, 'col-span-2 row-span-2', 'balcony'),
      ],
    }
  }

  if (bedrooms === 2) {
    return {
      carpetArea,
      bedrooms,
      bathrooms,
      subtitle,
      rooms: [
        room('Living Room', areas.living, 'col-span-4 row-span-3'),
        room('Kitchen', areas.kitchen, 'col-span-2 row-span-3'),
        room('Bath 1', areas.bath1, 'col-span-2 row-span-3'),
        room('Master Bedroom', areas.master, 'col-span-4 row-span-3'),
        room('Bedroom 2', areas.bed2, 'col-span-2 row-span-3'),
        room('Balcony', areas.balcony, 'col-span-2 row-span-3', 'balcony'),
      ],
    }
  }

  const rooms: FloorPlanRoom[] = [
    room('Living / Dining', areas.living, 'col-span-4 row-span-3'),
    room('Master Bedroom', areas.master, 'col-span-3 row-span-3'),
    room('Kitchen', areas.kitchen, 'col-span-3 row-span-2'),
    room(
      bathrooms >= 2 ? 'Bath 1 (Att.)' : 'Bathroom',
      areas.bath1,
      'col-span-3 row-span-1'
    ),
    room('Bedroom 2', areas.bed2, 'col-span-3 row-span-3'),
    room('Bedroom 3', areas.bed3, 'col-span-3 row-span-3'),
  ]

  if (bathrooms >= 2) {
    rooms.push(room('Bath 2', areas.bath2, 'col-span-2 row-span-3'))
  } else {
    rooms.push(room('Balcony', areas.balcony, 'col-span-2 row-span-3', 'balcony'))
  }

  if (bedrooms >= 4 && areas.bed4) {
    rooms.push(room('Bedroom 4', areas.bed4, 'col-span-2 row-span-2'))
  }

  if (bathrooms >= 2) {
    rooms.push(room('Balcony', areas.balcony, 'col-span-2 row-span-3', 'balcony'))
  }

  return { carpetArea, bedrooms, bathrooms, subtitle, rooms }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(n))
}

export function getFloorPlanGridClass(bedrooms: number): string {
  if (bedrooms === 1) return 'grid-cols-6 grid-rows-6 h-64'
  if (bedrooms === 2) return 'grid-cols-8 grid-rows-6 h-64'
  return 'grid-cols-10 grid-rows-6 h-72'
}
