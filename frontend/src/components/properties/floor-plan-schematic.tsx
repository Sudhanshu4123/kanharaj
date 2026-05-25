"use client"

import { Property } from '@/lib/data'
import {
  buildFloorPlanRooms,
  getFloorPlanGridClass,
  isResidentialFloorPlan,
} from '@/lib/floor-plan'
import { formatNumber } from '@/lib/utils'

interface FloorPlanSchematicProps {
  property: Property
}

export function FloorPlanSchematic({ property }: FloorPlanSchematicProps) {
  if (!isResidentialFloorPlan(property)) {
    const area = property.area > 0 ? property.area : null
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm font-bold text-slate-700">
          Floor plan layout is available for residential homes and apartments.
        </p>
        {area && (
          <p className="text-xs text-slate-500 mt-2 font-semibold">
            Total area: {formatNumber(area)} sq.ft. · {property.propertyType}
          </p>
        )}
      </div>
    )
  }

  const { rooms, subtitle, carpetArea, bedrooms } = buildFloorPlanRooms(property)

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4 font-semibold">{subtitle}</p>
      <div
        className={`grid gap-1.5 border-4 border-slate-700 bg-slate-900/5 rounded-lg p-2.5 font-mono text-[9px] relative select-none ${getFloorPlanGridClass(bedrooms)}`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] rounded pointer-events-none" />
        {rooms.map((r) => (
          <div
            key={r.name}
            className={`${r.className} border-2 rounded flex flex-col items-center justify-center relative shadow-sm mt-0 ${
              r.variant === 'balcony'
                ? 'border-dashed border-slate-400 bg-emerald-500/5'
                : 'border-slate-600 bg-white'
            }`}
          >
            <span className="font-bold text-slate-800 text-[10px] text-center px-1">{r.name}</span>
            <span className="text-slate-500 text-center">{r.dimLabel}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-3 font-medium">
        Room sizes estimated from {formatNumber(carpetArea)} sq.ft. total · Not to scale — request brochure for official drawing.
      </p>
    </div>
  )
}
