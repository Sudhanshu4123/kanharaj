"use client"

import { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Bed, 
  Bath, 
  Maximize2, 
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Upload,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

const steps = ["Basic Info", "Location", "Specifications", "Photos"]

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const propertyId = resolvedParams.id
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "FLAT",
    listingType: "BUY",
    address: "",
    city: "Dwarka",
    state: "Delhi",
    pincode: "110075",
    bedrooms: 3,
    bathrooms: 3,
    area: "",
    amenities: [] as string[],
    images: [] as string[]
  })

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}`)
        if (res.ok) {
          const data = await res.json()
          setFormData({
            title: data.title || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            propertyType: data.propertyType || "FLAT",
            listingType: data.listingType || "BUY",
            address: data.address || "",
            city: data.city || "Dwarka",
            state: data.state || "Delhi",
            pincode: data.pincode || "110075",
            bedrooms: data.bedrooms || 3,
            bathrooms: data.bathrooms || 3,
            area: data.area?.toString() || "",
            amenities: data.amenities || [],
            images: data.images || []
          })
        }
      } catch (err) {
        console.error("Failed to fetch property", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [propertyId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    const data = new FormData()
    for (let i = 0; i < files.length; i++) {
      data.append("files", files[i])
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
        method: "POST",
        body: data
      })
      const result = await res.json()
      if (result.urls) {
        const absoluteUrls = result.urls.map((url: string) => {
          if (url.startsWith('/api/')) {
            return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${url}`
          }
          return url
        })
        setFormData(prev => ({ ...prev, images: [...prev.images, ...absoluteUrls] }))
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("Image upload failed. Please check if backend is running.")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (formData.images.length === 0) {
      alert("Please upload at least one image.")
      return
    }

    const userData = localStorage.getItem("seller_user")
    if (!userData) {
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        area: parseFloat(formData.area) || 0,
        bedrooms: parseInt(formData.bedrooms.toString()) || 0,
        bathrooms: parseInt(formData.bathrooms.toString()) || 0,
        images: formData.images,
        amenities: formData.amenities,
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert("Property Updated Successfully!")
        router.push("/listings")
      } else {
        const errorData = await res.json()
        alert(`Failed to update property: ${errorData.message || 'Check your data'}`)
      }
    } catch (err) {
      console.error("Submit failed", err)
      alert("Error connecting to server. Please ensure backend is running.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-rose-600" size={40} />
        <p className="text-slate-500 font-bold">Loading property details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Property</h2>
           <p className="text-slate-500 mt-1">Update your property details to attract more buyers.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        {steps.map((step, i) => (
          <div key={step} className="relative z-10 flex flex-col items-center">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
               i <= currentStep ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-white border-2 border-slate-100 text-slate-400'
             }`}>
                {i < currentStep ? <CheckCircle2 size={20} /> : i + 1}
             </div>
             <span className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${i <= currentStep ? 'text-rose-600' : 'text-slate-400'}`}>
                {step}
             </span>
          </div>
        ))}
      </div>

      <div className="dashboard-card min-h-[400px]">
         <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               {currentStep === 0 && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Title</label>
                          <input 
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                          <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium resize-none"
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price (in ₹)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              type="number" 
                              className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                            />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Type</label>
                          <select 
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium bg-white"
                          >
                             <optgroup label="Residential">
                                <option value="FLAT">Flat / Apartment</option>
                                <option value="BUILDER_FLOOR">Builder Floor</option>
                                <option value="HOUSE">Independent House</option>
                                <option value="VILLA">Villa / Penthouse</option>
                             </optgroup>
                             <optgroup label="Commercial">
                                <option value="SHOP">Shop</option>
                                <option value="OFFICE_SPACE">Office Space</option>
                             </optgroup>
                          </select>
                       </div>
                    </div>
                 </div>
               )}

               {currentStep === 1 && (
                 <div className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Complete Address</label>
                       <div className="relative">
                          <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                          <textarea 
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium resize-none"
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
                          <input 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pincode</label>
                          <input 
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                          />
                       </div>
                    </div>
                 </div>
               )}

               {currentStep === 2 && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bedrooms</label>
                          <div className="relative">
                             <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                             <input 
                               name="bedrooms"
                               value={formData.bedrooms}
                               onChange={handleInputChange}
                               type="number" 
                               className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bathrooms</label>
                          <div className="relative">
                             <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                             <input 
                               name="bathrooms"
                               value={formData.bathrooms}
                               onChange={handleInputChange}
                               type="number" 
                               className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                             />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Area (Sq. Ft.)</label>
                          <div className="relative">
                             <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                             <input 
                               name="area"
                               value={formData.area}
                               onChange={handleInputChange}
                               type="number" 
                               className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium"
                             />
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {currentStep === 3 && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {formData.images.map((url, i) => (
                         <div key={i} className="aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden relative group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(i)}
                              className="absolute top-2 right-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <X size={14} />
                            </button>
                         </div>
                       ))}
                       <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all">
                          {uploading ? (
                            <Loader2 className="animate-spin text-rose-600" size={24} />
                          ) : (
                            <>
                              <Upload className="text-slate-400" size={24} />
                              <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Add Photos</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                       </label>
                    </div>
                 </div>
               )}
            </motion.div>
         </AnimatePresence>

         <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`btn-secondary !py-2.5 ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`}
            >
               <ChevronLeft size={20} /> Back
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="btn-primary !py-2.5 !px-8"
              >
                 Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || formData.images.length === 0}
                className="btn-primary !py-2.5 !px-10 disabled:opacity-50"
              >
                 {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
              </button>
            )}
         </div>
      </div>
    </div>
  )
}
