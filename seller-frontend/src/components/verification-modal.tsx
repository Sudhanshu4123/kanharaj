import React, { useState, useEffect } from "react"
import { MapPin, Camera, X, Loader2, CheckCircle2, AlertCircle, ClipboardList } from "lucide-react"
import { getApiUrl } from "@/lib/auth"

interface VerificationModalProps {
  property: {
    id: number | string
    title?: string
    propertyType?: string
    listingType?: string
    purpose?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function VerificationModal({
  property,
  onClose,
  onSuccess
}: VerificationModalProps) {
  const propertyId = property.id
  const propertyTitle = property.title || "Property"

  const propertyType = (property.propertyType || "").toUpperCase()
  const listingType = (property.listingType || property.purpose || "").toUpperCase()

  const isPg = propertyType === "PG" || propertyType === "PG/CO-LIVING"
  const isRent = listingType === "RENT"

  let categoryLabel = "Sell (Buy)"
  let guidelines: string[] = [
    "Building Front Elevation / Exterior Facade (From the main road/approach)",
    "Living Room / Large Lounge Area",
    "Master Bedroom (Clear day-light view)",
    "Kitchen Layout & Attached Bathrooms",
    "10-meter Approach Road view in front of property"
  ]

  if (isPg) {
    categoryLabel = "PG / Co-living"
    guidelines = [
      "Main Bed Setup & Wardrobe (Showing room condition)",
      "Dining Area or Kitchen/Mess (Showing where food is prepared/served)",
      "Attached/Shared Washroom (Showing hygiene standards)",
      "Main Entrance or Reception Area (With security/CCTV visibility)",
      "Shared Amenities Area (Washing machine, Wi-Fi router, or lounge)"
    ]
  } else if (isRent) {
    categoryLabel = "Rent"
    guidelines = [
      "Spacious Living Room / Hall (Showing general ventilation)",
      "Bedrooms & Wardrobes (Showing storage space and layout)",
      "Modular / Semi-Modular Kitchen (Showing sink, slab, and cabinets)",
      "Balcony View or Outdoor Utility Area",
      "Main Entry Door & Electric Meter Area"
    ]
  }

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  const [step, setStep] = useState<"init" | "locating" | "captured" | "submitting" | "success" | "error">("locating")
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [photos, setPhotos] = useState<Record<number, File>>({})
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleIndividualPhotoChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotos(prev => ({ ...prev, [idx]: file }))

      if (previews[idx]) {
        URL.revokeObjectURL(previews[idx])
      }

      setPreviews(prev => ({ ...prev, [idx]: URL.createObjectURL(file) }))
      setStep("captured")
    }
  }

  const removeIndividualPhoto = (idx: number) => {
    setPhotos(prev => {
      const copy = { ...prev }
      delete copy[idx]
      if (Object.keys(copy).length === 0) {
        setStep("init")
      }
      return copy
    })
    setPreviews(prev => {
      const copy = { ...prev }
      if (copy[idx]) {
        URL.revokeObjectURL(copy[idx])
        delete copy[idx]
      }
      return copy
    })
  }

  const handleStartVerification = () => {
    setStep("locating")
    setErrorMsg(null)

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.")
      setStep("error")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setStep("init") // Location fetched, now wait for photo capture
      },
      (err) => {
        let msg = "Failed to retrieve your location. Please enable location permissions."
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser settings to verify your property."
        }
        setErrorMsg(msg)
        setStep("error")
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  // Automatically fetch coordinates on mount
  useEffect(() => {
    handleStartVerification()
  }, [])

  const handleSubmit = async () => {
    if (!coords) {
      setErrorMsg("Coordinates are missing. Please re-enable location.")
      setStep("error")
      return
    }
    const photoList = Object.values(photos)
    if (photoList.length === 0) {
      setErrorMsg("Please capture or upload at least one live photo on-site.")
      setStep("error")
      return
    }

    setStep("submitting")
    setErrorMsg(null)

    const token = localStorage.getItem("seller_token")
    const formData = new FormData()
    formData.append("latitude", String(coords.latitude))
    formData.append("longitude", String(coords.longitude))

    // Append the first one to "file" for backward compatibility
    formData.append("file", photoList[0])

    // Append all captured files to "files"
    photoList.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const res = await fetch(`${getApiUrl()}/properties/${propertyId}/verify-location`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (res.ok) {
        setStep("success")
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.message || "Verification failed. Please ensure you are standing near the property's location.")
        setStep("error")
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.")
      setStep("error")
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-800">Property Verification</h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate max-w-[300px]">
              {propertyTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50"
            disabled={step === "submitting" || step === "locating"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-5">
          {step === "locating" && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <Loader2 className="w-10 h-10 text-[#0a2540] animate-spin" />
              <p className="text-sm font-black text-slate-700">Acquiring GPS Signal...</p>
              <p className="text-xs text-slate-500 max-w-[280px]">
                Please allow location permission and ensure your device's GPS is enabled.
              </p>
            </div>
          )}

          {step === "submitting" && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-sm font-black text-slate-700">Uploading & Verifying...</p>
              <p className="text-xs text-slate-500">
                Matching coordinates & uploading verification photo.
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
                <CheckCircle2 size={40} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">Verification Successful!</h4>
                <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
                  Listing Visibility Boosted
                </p>
              </div>
              <p className="text-xs text-slate-500 max-w-[280px]">
                Your property has been verified successfully. It is now ranked higher in search listings.
              </p>
              <button
                onClick={() => {
                  onSuccess()
                  onClose()
                }}
                className="w-full mt-2 py-3 bg-[#0a2540] hover:bg-[#07192c] text-white text-xs font-black rounded-xl transition-colors shadow-lg shadow-slate-100"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-4 text-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Verification Mismatch</h4>
                <p className="text-xs text-rose-600 font-semibold mt-1">Error code: location_mismatch</p>
              </div>
              <p className="text-xs text-slate-500 max-w-[300px]">
                {errorMsg || "An error occurred during verification."}
              </p>
              <div className="w-full flex gap-3 mt-2">
                <button
                  onClick={handleStartVerification}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {(step === "init" || step === "captured") && (
            <>
              {/* Location Badge */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${coords ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-black text-slate-800">
                      {coords ? "GPS Location Captured" : "GPS Location Required"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : "Retrieving device coordinates..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guidelines & One-by-One Upload Checklist */}
              {coords && (
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[#0a2540]">
                    <ClipboardList className="w-4 h-4 text-[#0a2540]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {categoryLabel} Verification Photos
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500">
                    Capture or upload a live photo for each checklist requirement one-by-one:
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    {guidelines.map((item, idx) => {
                      const isChecked = !!checkedItems[idx]
                      const preview = previews[idx]
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                            preview
                              ? "bg-emerald-50/40 border-emerald-200"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleCheck(idx)}
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all duration-150 ${
                              isChecked || preview
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>

                          {/* Label — takes remaining space */}
                          <span className={`flex-1 text-[11px] font-semibold leading-tight text-slate-700 ${(isChecked || preview) ? "line-through opacity-50" : ""}`}>
                            {item}
                          </span>

                          {/* Right side: thumbnail if uploaded, else camera button */}
                          {preview ? (
                            <div className="relative w-10 h-9 rounded-lg overflow-hidden border border-emerald-300 shrink-0">
                              <img src={preview} alt={item} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeIndividualPhoto(idx)}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <X size={11} className="text-white" />
                              </button>
                            </div>
                          ) : (
                            <label className="p-1.5 bg-slate-50 hover:bg-[#0a2540] rounded-lg text-slate-400 hover:text-white border border-slate-200 hover:border-[#0a2540] cursor-pointer transition-all shrink-0">
                              <Camera size={14} />
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handleIndividualPhotoChange(e, idx)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Submit Action */}
              {step === "captured" && (
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-colors shadow-lg shadow-emerald-50 mt-2"
                >
                  Verify Property ({Object.keys(photos).length} Photos)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
