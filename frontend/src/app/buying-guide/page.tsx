"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Home,
  Check,
  Building,
  Info,
  DollarSign,
  FileText,
  Key,
  HelpCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Flame,
  Activity,
  Zap
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    id: 1,
    title: "Finding a House",
    desc: "How to research for your dream home and location, and choose a property type that suits your requirements",
    icon: Home
  },
  {
    id: 2,
    title: "Financials & Budgeting",
    desc: "Set realistic budgets, estimate hidden registry costs, and understand home loan processes",
    icon: DollarSign
  },
  {
    id: 3,
    title: "Legal & Verification",
    desc: "A checklist of vital documents to inspect before executing agreements or paying deposits",
    icon: FileText
  },
  {
    id: 4,
    title: "Registry & Possession",
    desc: "Understand the stamp duty and registry process, and verify features during final keys handover",
    icon: Key
  }
]

export default function BuyingGuidePage() {
  const [activeStep, setActiveStep] = useState(1)
  const [propertyTab, setPropertyTab] = useState("under-construction")
  const [selectedArea, setSelectedArea] = useState("super-built-up")
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({})
  const [checkedPossession, setCheckedPossession] = useState<Record<string, boolean>>({})

  const toggleDoc = (id: string) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const togglePossession = (id: string) => {
    setCheckedPossession(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-600/10 text-rose-600 text-xs font-semibold mb-4">
            Kanharaj Knowledge Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-none mb-6">
            Home Buying <span className="text-rose-600">Guide</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Your step-by-step roadmap to buying a property in India. Learn how to verify legal records, plan budgets, and avoid common real estate pitfalls.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Sticky Stepper Navigation */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Step-by-Step Roadmap</h3>
                  <p className="text-xs text-slate-500 font-semibold">Current Stage: {activeStep} / 4</p>
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step) => {
                  const Icon = step.icon
                  const isActive = activeStep === step.id
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                        isActive
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? "bg-rose-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm ${isActive ? "text-white" : "text-slate-900"}`}>
                          {step.id}. {step.title}
                        </h4>
                        <p className={`text-xs leading-normal ${isActive ? "text-slate-400" : "text-slate-500"} line-clamp-2`}>
                          {step.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Progress Bar indicator */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Buying Journey</span>
                  <span>{activeStep * 25}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-rose-600"
                    initial={{ width: "25%" }}
                    animate={{ width: `${activeStep * 25}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>
            
            {/* Direct Contact Card */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <h4 className="font-bold text-lg">Confused about buying?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect with a certified Kanharaj Property Advisor for legal registration & zero-brokerage deals.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <a href="tel:+919599801767" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center text-xs transition-colors flex items-center justify-center gap-1">
                    Call Advisor Now <ArrowRight size={14} />
                  </a>
                  <Link href="/properties?listing=buy" className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-xs transition-all border border-white/10">
                    Browse Verified Houses
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Content Panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                
                {/* STEP 1: FINDING A HOUSE */}
                {activeStep === 1 && (
                  <>
                    {/* Intro Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900">Step 1: Finding Your Dream House</h2>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        The journey begins with choosing a property that fits your lifestyle, budget, and long-term targets. This involves comparing structural choices, selecting locations, and checking the measurement rules.
                      </p>

                      {/* Property Types Comparison */}
                      <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Compare Property Types</h3>
                          <p className="text-xs text-slate-500">Select a structural status to view its financial, legal, and operational metrics.</p>
                        </div>

                        {/* Tabs Buttons */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
                          {[
                            { id: "under-construction", label: "Under Construction" },
                            { id: "ready-to-move", label: "Ready-To-Move" },
                            { id: "resale", label: "Resale Flats" }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setPropertyTab(tab.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                propertyTab === tab.id
                                  ? "bg-white text-slate-950 shadow-md"
                                  : "text-slate-500 hover:text-slate-900"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Comparative Content Grid */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {propertyTab === "under-construction" && (
                            <>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Property Price</span><p className="text-sm font-semibold text-slate-800">Discounted (10% to 20% lower than market rate)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Fund Security</span><p className="text-sm font-semibold text-slate-800">Medium-Risky (Depends on developer reputation)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Possession Delivery</span><p className="text-sm font-semibold text-slate-800">Delays possible (Buffer periods required)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Construction Quality</span><p className="text-sm font-semibold text-slate-800">Verifiable at final possession time</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Return on Investment</span><p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">High Appreciation Prospects <TrendingUp size={14} /></p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Loan Facility</span><p className="text-sm font-semibold text-slate-800">Linked to construction milestones (APF project)</p></div>
                            </>
                          )}
                          {propertyTab === "ready-to-move" && (
                            <>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Property Price</span><p className="text-sm font-semibold text-slate-800">Standard market rates (Higher upfront cost)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Fund Security</span><p className="text-sm font-semibold text-slate-800">Highly Secure (What you see is what you buy)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Possession Delivery</span><p className="text-sm font-semibold text-slate-800">Immediate handover (Zero delay risk)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Construction Quality</span><p className="text-sm font-semibold text-slate-800">Inspectable prior to buying</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Return on Investment</span><p className="text-sm font-semibold text-slate-800">Stable, includes immediate rental income</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Loan Facility</span><p className="text-sm font-semibold text-slate-800">Standard home loans (Easy bank sanctions)</p></div>
                            </>
                          )}
                          {propertyTab === "resale" && (
                            <>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Property Price</span><p className="text-sm font-semibold text-slate-800">Negotiable (Depends on owner urgency & age)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Fund Security</span><p className="text-sm font-semibold text-slate-800">Highly Secure (Registry transfer direct from owner)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Possession Delivery</span><p className="text-sm font-semibold text-slate-800">Immediate handover on registry execution</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Construction Quality</span><p className="text-sm font-semibold text-slate-800">Pre-existing condition (Check wear and tear)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Return on Investment</span><p className="text-sm font-semibold text-slate-800">Stable (Lower appreciation but immediately liveable)</p></div>
                              <div className="space-y-1"><span className="text-xs text-slate-500 font-semibold">Loan Facility</span><p className="text-sm font-semibold text-slate-800">Depends on building age & society approvals</p></div>
                            </>
                          )}
                        </div>

                        {/* Interactive Banner tip */}
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
                          <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">💡</div>
                          <p className="leading-relaxed">
                            {propertyTab === "under-construction" 
                              ? "Under-construction properties appreciate faster, but ready-to-move flats can earn 1.5% to 2% (of the property value) per annum in rental yields if you lease them immediately."
                              : propertyTab === "ready-to-move"
                              ? "Ready-to-move flats save you from double expenditures (paying rent + home loan EMIs concurrently) and carry no GST in India."
                              : "When buying a resale property, check if there are pending society dues, water tax invoices, or outstanding electricity charges before executing the agreement."
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* How Do I Begin My Home Search */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">How Do I Begin My Home Search?</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        To find properties and stay informed without falling for fake postings, utilize a balanced mix of search channels:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: "Online Realty Portals", desc: "Use platforms like Kanharaj to view verified direct-from-owner or direct-from-builder listings with zero brokerage filters." },
                          { title: "Online/Offline Classifieds", desc: "Scan local newspaper classifications or property groups to locate independent units." },
                          { title: "Direct Builders & Developers", desc: "Visit developer experience centers directly for newly launched under-construction housing societies." },
                          { title: "Verified Local Agents", desc: "Interact with local real estate brokers who have deep inventory records of specific sectors." }
                        ].map((item, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-rose-600/15 text-rose-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Location Checklist */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Location & Neighborhood Due Diligence</h3>
                          <p className="text-xs text-slate-500">Your quality of life and future property value depend strongly on where you buy.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: "Connectivity", desc: "Is there easy access to metros, expressways, and major main roads?" },
                          { label: "Commute to Workplace", desc: "Calculate travel duration during peak office hours to avoid long daily transits." },
                          { label: "Basic Amenities", desc: "Are there schools, tertiary hospitals, shopping complexes, and grocery markets within a 2-3km radius?" },
                          { label: "Future Infrastructure", desc: "Check municipal blueprints for proposed metro routes, flyovers, or park setups that will boost future price appreciation." },
                          { label: "Social Security & Safety", desc: "Research local safety records, gated-society security features, and streetlighting levels." }
                        ].map((loc, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-100 transition-colors">
                            <Check size={16} className="text-rose-600 mt-1 shrink-0" />
                            <div className="space-y-1">
                              <h4 className="font-semibold text-slate-900 text-sm">{loc.label}</h4>
                              <p className="text-xs text-slate-500 leading-normal">{loc.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Areas Explained Module */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                          <Building size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Measurement Areas Explained</h3>
                          <p className="text-xs text-slate-500">Understand what Carpet, Built-up, and Super Built-up areas mean to avoid paying for empty spaces.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-100">
                        
                        {/* Area Selector Buttons & Details */}
                        <div className="md:col-span-7 space-y-6">
                          <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                            {[
                              { id: "carpet", label: "Carpet Area" },
                              { id: "built-up", label: "Built-Up Area" },
                              { id: "super-built-up", label: "Super Built-Up" }
                            ].map(area => (
                              <button
                                key={area.id}
                                onClick={() => setSelectedArea(area.id)}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                  selectedArea === area.id
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-900"
                                }`}
                              >
                                {area.label}
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={selectedArea}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-4"
                            >
                              {selectedArea === "carpet" && (
                                <>
                                  <h4 className="font-bold text-slate-900 text-base">What is Carpet Area?</h4>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    This is the net usable floor area of an apartment, excluding the area covered by the external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but including the area covered by the internal partition walls of the apartment.
                                  </p>
                                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-800 font-semibold">
                                    🔑 <b>Simple rule:</b> The area where you can literally spread a carpet (wall-to-wall space inside rooms).
                                  </div>
                                </>
                              )}
                              {selectedArea === "built-up" && (
                                <>
                                  <h4 className="font-bold text-slate-900 text-base">What is Built-Up Area?</h4>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    Built-up Area is the sum of carpet area, wall thickness, and other unusable utility areas like balconies, utility ducts, and private terraces. Typically, it is 10% to 15% more than the carpet area.
                                  </p>
                                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-800 font-semibold font-mono">
                                    📝 <b>Formula:</b> Carpet Area + Wall Area + Balcony Space = Built-Up Area.
                                  </div>
                                </>
                              )}
                              {selectedArea === "super-built-up" && (
                                <>
                                  <h4 className="font-bold text-slate-900 text-base">What is Super Built-Up Area?</h4>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    This is the built-up area plus a proportionate share of the building's common areas like elevators, lobby corridors, staircases, generator rooms, security cabins, and clubhouse amenities. It excludes personal terraces, open yards, and parking spaces.
                                  </p>
                                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-[11px] text-rose-800 font-semibold font-mono">
                                    📊 <b>Calculation:</b> Carpet Area x (1 + Loading Factor) = Super Built-Up Area.
                                  </div>
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Interactive Floorplan / Diagram (Right Side) */}
                        <div className="md:col-span-5 bg-slate-900 rounded-[2rem] p-6 text-white text-center space-y-4 shadow-xl">
                          <h5 className="text-xs font-semibold text-rose-500">Visual Blueprint Map</h5>
                          
                          {/* Floorplan Box Mock */}
                          <div className="w-full h-36 bg-slate-800 rounded-xl border border-slate-700 relative flex items-center justify-center p-2">
                            {/* Visual Grid representing rooms */}
                            <div className="absolute inset-2 border border-dashed border-slate-600 rounded grid grid-cols-3 grid-rows-2 gap-1 bg-slate-950/40">
                              <div className={`border-r border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] transition-all duration-300 ${selectedArea === "carpet" || selectedArea === "built-up" || selectedArea === "super-built-up" ? "bg-rose-600/20 text-rose-400 font-bold" : "text-slate-500"}`}>Bedroom</div>
                              <div className="border-r border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Kitchen</div>
                              <div className={`border-b border-dashed border-slate-600 flex items-center justify-center text-[10px] transition-all duration-300 ${selectedArea === "built-up" || selectedArea === "super-built-up" ? "bg-slate-700/60 text-slate-300 font-bold" : "text-slate-500"}`}>Balcony</div>
                              <div className="border-r border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Bath</div>
                              <div className="border-r border-dashed border-slate-600 flex items-center justify-center text-[10px] text-slate-500">Living</div>
                              <div className={`flex items-center justify-center text-[9px] transition-all duration-300 ${selectedArea === "super-built-up" ? "bg-[#dfa127]/20 text-[#dfa127] font-bold" : "text-slate-500"}`}>Lobby (Common)</div>
                            </div>
                          </div>

                          <div className="text-left space-y-1">
                            <span className="text-xs font-semibold text-slate-400">Measurement Loading Factor</span>
                            <p className="text-[11px] text-slate-300 leading-normal">
                              In India, loading factors range from <b>20% to 40%</b>. Builders charge prices based on the Super Built-Up area, so a 1200 sq.ft flat may only have a 900 sq.ft usable Carpet Area.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: FINANCIALS & BUDGETING */}
                {activeStep === 2 && (
                  <>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900">Step 2: Financials & Budgeting</h2>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        Calculating the purchasing cost goes far beyond the advertised base price. Understanding other fees and configuring home loan timelines beforehand will prevent payment failures.
                      </p>

                      {/* Cost Breakdown Structure */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Advertised Base Price vs Actual Price</h3>
                        <div className="space-y-2">
                          {[
                            { name: "Base Sale Price (BSP)", desc: "The cost per square foot of the property area.", percentage: "80%" },
                            { name: "Stamp Duty & Registration Charges", desc: "Paid to the state government during registry. Ranges from 4% to 8% of circle rate.", percentage: "5-7%" },
                            { name: "GST (Goods & Services Tax)", desc: "Applicable only on under-construction flats (5% for luxury, 1% for affordable). Ready flats have 0% GST.", percentage: "0-5%" },
                            { name: "External Electrification & Water (EEC/FFC)", desc: "Charged by developers to install connection meters.", percentage: "2-3%" },
                            { name: "Society Security Deposit & Advance Maintenance", desc: "Typically 1-2 years of maintenance paid upfront to the resident welfare association.", percentage: "1-2%" }
                          ].map((cost, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100/50">
                              <div className="space-y-0.5 max-w-lg">
                                <h4 className="font-bold text-slate-800 text-xs">{cost.name}</h4>
                                <p className="text-[11px] text-slate-500 leading-normal">{cost.desc}</p>
                              </div>
                              <span className="text-xs font-bold text-slate-900 bg-slate-200/50 px-3 py-1 rounded-lg shrink-0">{cost.percentage}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-3">
                          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                          <p className="leading-relaxed">
                            <b>Budget Warning:</b> Always reserve <b>10% to 15%</b> of the property value extra in liquid cash to cover stamp duty, lawyer fees, registry costs, and electrical meters, as banks do not include these in home loan sanctions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Home Loan Step-by-Step Guide */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">Home Loan Procedure</h3>
                      <p className="text-slate-500 text-xs">A comprehensive timeline of how banks process and disburse home loans.</p>

                      <div className="space-y-4">
                        {[
                          { step: "Phase 1", title: "Eligibility Check & Pre-Approval", desc: "Submit your KYC, Salary Slips (or ITR returns), and bank statements to check your loan limits. The bank issues a Pre-Approval Letter." },
                          { step: "Phase 2", title: "Property Legal & Technical Valuation", desc: "The bank sends independent valuation experts and lawyers to check the property site, verify building layout approvals, and validate title deeds." },
                          { step: "Phase 3", title: "Sanction Letter & Agreement Execution", desc: "Upon verification, the bank issues the official loan Sanction Letter outlining the interest rate (ROI), processing fees, and EMI schedules." },
                          { step: "Phase 4", title: "Disbursement Check", desc: "The bank issues a demand draft or bank transfer check directly to the seller or developer during registry execution." }
                        ].map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 text-rose-500 flex flex-col items-center justify-center shrink-0 border border-slate-800">
                              <span className="text-[10px] text-slate-400 font-semibold">Step</span>
                              <span className="text-sm font-bold -mt-1">{idx + 1}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                              <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 3: LEGAL & VERIFICATION */}
                {activeStep === 3 && (
                  <>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Step 3: Legal Documents Verification</h2>
                          <p className="text-xs text-slate-500">Run through this legal checklist to ensure the property is free of legal disputes.</p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed">
                        Never pay booking deposits or execute builder-buyer agreements without inspecting certified copies of these core documents. Select the checkboxes as you verify them:
                      </p>

                      <div className="space-y-4">
                        {[
                          { id: "sale_deed", name: "Sale Deed / Title Deed", desc: "The most vital title document. Confirms the seller has ownership of the property and the legal authority to transfer it." },
                          { id: "mother_deed", name: "Mother Deed / Parent Deed", desc: "Traces the historical ownership chain of the property for at least 30 years. Critical for verifying resale properties." },
                          { id: "rera_reg", name: "RERA Registration Certificate", desc: "In India, every newly launched housing project above 500 sq. meters must register with RERA. Check project status on the state's RERA website." },
                          { id: "approval_plan", name: "Approved Building Layout Plan", desc: "Municipal or local development authority (e.g. DDA) sanction plan. Any floor constructed outside this approved plan is illegal." },
                          { id: "oc_cert", name: "Occupancy Certificate (OC)", desc: "Issued by local authorities confirming the building is fully constructed in compliance with civic regulations and is fit for residence. Mandatory for utility connections." },
                          { id: "encumb_cert", name: "Encumbrance Certificate (EC)", desc: "Proves that the property is free of outstanding home mortgages, financial loans, or legal attachments." }
                        ].map((doc) => {
                          const isChecked = !!checkedDocs[doc.id]
                          return (
                            <div
                              key={doc.id}
                              onClick={() => toggleDoc(doc.id)}
                              className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                                isChecked
                                  ? "bg-rose-50/20 border-rose-500/35"
                                  : "bg-slate-50 border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isChecked ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-350"
                              }`}>
                                {isChecked && <Check size={14} strokeWidth={4} />}
                              </div>
                              <div className="space-y-1">
                                <h4 className={`font-semibold text-sm ${isChecked ? "text-rose-700" : "text-slate-900"}`}>{doc.name}</h4>
                                <p className="text-xs text-slate-500 leading-normal">{doc.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 4: REGISTRY & POSSESSION */}
                {activeStep === 4 && (
                  <>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900">Step 4: Registry & Final Possession</h2>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        This is the final stage of your home-buying journey. You pay the remaining balance, execute the registry, pay stamp duty, and physically verify the property before taking keys.
                      </p>

                      {/* Registry Steps */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">The Sub-Registrar Registry Flow</h3>
                        <div className="space-y-3">
                          {[
                            { step: "A", title: "Calculate and Buy E-Stamp Paper", desc: "Purchase the stamp duty papers online or via authorized banks matching the exact transaction value or circle rate (whichever is higher)." },
                            { step: "B", title: "Book Sub-Registrar Slot", desc: "Schedule an appointment online at the local Sub-Registrar office for title registry registration." },
                            { step: "C", title: "Execute Sale Deed Registry", desc: "Both buyer and seller, along with two independent witnesses, appear before the Sub-Registrar to execute and sign the documents." },
                            { step: "D", title: "Submit Original Documents & Biometrics", desc: "Provide biometric fingerprints, facial photos, and submit the copy of deeds for state records validation." }
                          ].map((step, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50/50">
                              <span className="w-6 h-6 rounded-lg bg-rose-600/10 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">{step.step}</span>
                              <div className="space-y-1">
                                <h4 className="font-semibold text-slate-900 text-sm">{step.title}</h4>
                                <p className="text-xs text-slate-500 leading-normal">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Possession Snagging Checklist */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/30 space-y-6">
                      <h3 className="text-xl font-bold text-slate-900">Handover Possession Checkmarks</h3>
                      <p className="text-slate-500 text-xs">Run this physical walkthrough inspection check before accepting key handovers.</p>

                      <div className="space-y-3">
                        {[
                          { id: "wall_cracks", name: "Wall Finish & Paint check", desc: "Look for visual cracks, wall dampness (seepage issues), hollow plaster spots, and consistent paint coating." },
                          { id: "electric_wires", name: "Sockets & Wiring check", desc: "Plug in an appliance to verify that all electrical sockets work. Test the main circuit breaker (MCB) switchboard." },
                          { id: "plumb_leaks", name: "Plumbing & Taps check", desc: "Open all bathroom and kitchen taps to check water pressure, examine under-sink pipes for drainage blockages or water leakages." },
                          { id: "doors_alignment", name: "Doors, Windows & Balcony Grills", desc: "Verify that all locks function smoothly, balcony glass sliding windows fit securely, and grills are anti-corrosion coated." },
                          { id: "dues_noc", name: "Society NOCs & Maintenance copies", desc: "Collect the developer NOC, water and electric meter transfer letters, and previous maintenance payment receipts." }
                        ].map((item) => {
                          const isChecked = !!checkedPossession[item.id]
                          return (
                            <div
                              key={item.id}
                              onClick={() => togglePossession(item.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-4 ${
                                isChecked
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/15"
                                  : "bg-slate-50 border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isChecked ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-350"
                              }`}>
                                {isChecked && <Check size={12} strokeWidth={4} />}
                              </div>
                              <div className="space-y-1">
                                <h4 className={`font-semibold text-sm ${isChecked ? "text-rose-400" : "text-slate-900"}`}>{item.name}</h4>
                                <p className={`text-xs leading-normal ${isChecked ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Bottom Navigation Buttons for Stepper */}
                <div className="flex justify-between items-center bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-100/20">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous Step
                  </button>

                  <button
                    onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                    disabled={activeStep === 4}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next Step <ChevronRight size={14} />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  )
}
