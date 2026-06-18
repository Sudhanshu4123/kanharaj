"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import Link from "next/link"

// SVGs matching the layout
const FindingHouseSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background Decorations */}
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M90 200h8M94 196v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />
    
    {/* Magnifying Glass Lens Outline */}
    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />
    
    <g clipPath="url(#lens-clip)">
      {/* Ground/Grass inside lens */}
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />
      
      {/* Bush/Greenery */}
      <circle cx="65" cy="115" r="12" fill="#4ade80" />
      <circle cx="155" cy="115" r="12" fill="#4ade80" />
      
      {/* House Body */}
      <rect x="75" y="80" width="70" height="50" fill="#ec4899" rx="2" />
      
      {/* House Roof */}
      <polygon points="70,80 110,40 150,80" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Door */}
      <path d="M102 105h16v25h-16v-25z" fill="#4c0519" rx="1" />
      
      {/* Window */}
      <rect x="85" y="92" width="10" height="10" fill="#4c0519" rx="1" />
    </g>
    
    {/* Magnifying Glass Handle */}
    <rect x="150" y="135" width="14" height="45" rx="7" fill="#ec4899" transform="rotate(-45 150 135)" />
    <circle cx="150" cy="135" r="7" fill="#facc15" />
    
    <defs>
      <clipPath id="lens-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const BudgetingSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />
    
    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />
    
    <g clipPath="url(#budget-clip)">
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />
      
      <rect x="75" y="85" width="55" height="40" fill="#ec4899" rx="2" />
      <polygon points="70,85 102.5,50 135,85" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M95 105h15v20h-15v-20z" fill="#4c0519" rx="1" />
      
      <circle cx="150" cy="85" r="22" fill="#eab308" />
      <circle cx="150" cy="85" r="18" fill="#fde047" />
      {/* Rupee Symbol */}
      <path d="M144 79h12M144 83h12M148 79c4 0 6 3 6 6s-2 6-6 6h-4M147 90l8 7" stroke="#a16207" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    
    <rect x="145" y="125" width="45" height="55" rx="6" fill="#1e293b" />
    <rect x="153" y="133" width="29" height="10" rx="2" fill="#475569" />
    <rect x="153" y="149" width="7" height="7" rx="1" fill="#ec4899" />
    <rect x="164" y="149" width="7" height="7" rx="1" fill="#fde047" />
    <rect x="175" y="149" width="7" height="7" rx="1" fill="#38bdf8" />
    <rect x="153" y="160" width="7" height="7" rx="1" fill="#38bdf8" />
    <rect x="164" y="160" width="18" height="7" rx="1" fill="#0d9488" />

    <defs>
      <clipPath id="budget-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const LegalVerificationSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />
    
    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />
    
    <g clipPath="url(#legal-clip)">
      <path d="M50 125c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />
      
      <rect x="85" y="90" width="50" height="35" fill="#ec4899" rx="2" />
      <polygon points="80,90 110,60 140,90" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M103 108h14v17h-14v-17z" fill="#4c0519" rx="1" />
    </g>
    
    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
      <rect x="135" y="105" width="50" height="65" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="150" y="99" width="20" height="8" rx="2" fill="#64748b" />
      <line x1="145" y1="120" x2="175" y2="120" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="145" y1="130" x2="165" y2="130" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1="145" y1="140" x2="170" y2="140" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      
      <circle cx="175" cy="155" r="14" fill="#22c55e" />
      <path d="M169 155l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    <defs>
      <clipPath id="legal-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const PossessionSVG = () => (
  <svg viewBox="0 0 240 240" className="w-56 h-56 mx-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 75h8M49 71v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <path d="M200 120h8M204 116v8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
    <circle cx="190" cy="70" r="4" fill="#cbd5e1" />
    
    <circle cx="110" cy="95" r="60" fill="white" stroke="#facc15" strokeWidth="8" />
    
    <g clipPath="url(#possession-clip)">
      <path d="M50 120c15 0 20-10 60-10s45 10 60 10v40H50v-40z" fill="#0d9488" />
      
      <rect x="75" y="80" width="70" height="50" fill="#ec4899" rx="2" />
      <polygon points="70,80 110,40 150,80" fill="#fde047" stroke="#fde047" strokeWidth="2" strokeLinejoin="round" />
      <path d="M102 105h16v25h-16v-25z" fill="#4c0519" rx="1" />
      <rect x="85" y="92" width="10" height="10" fill="#4c0519" rx="1" />
    </g>
    
    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
      <path d="M165 115c-10 0-18 8-18 18s8 18 18 18c8 0 15-5 17-12h18v8h8v-8h6v-8h-32c-2-7-9-12-17-12zm0 8c5.5 0 10 4.5 10 10s-4.5 10-10 10-10-4.5-10-10 4.5-10 10-10z" fill="#eab308" />
    </g>

    <defs>
      <clipPath id="possession-clip">
        <circle cx="110" cy="95" r="56" />
      </clipPath>
    </defs>
  </svg>
)

const stepsData = [
  {
    id: 1,
    title: "1. Finding a house",
    desc: "How to research for your dream home and location, and choose a property type that suits your requirements",
    illustration: FindingHouseSVG,
    cards: [
      {
        title: "How Do I Begin My Home Search?",
        desc: "The most important step of buying a home, is choosing a property that's right for you. This involves several steps of research and due diligence. It's advisable to use a mix of resources for finding a home to stay informed.",
        bullets: [
          { text: "Online Realty Portals", isLink: true, href: "/properties?listing=buy" },
          { text: "Online/Offline classifieds", isLink: false },
          { text: "Print Ads in Newspaper", isLink: false },
          { text: "Property Fairs / Exhibitions", isLink: true, href: "#" },
          { text: "Agents", isLink: true, href: "#" },
          { text: "Developers", isLink: true, href: "#" },
          { text: "Hoardings/Ads", isLink: false },
          { text: "Family/Friends", isLink: false }
        ]
      },
      {
        title: "Location",
        desc: "Your quality of life will depend on the location you choose for your home. Choose a location based on:",
        bullets: [
          { text: "Connectivity with your workplace", isLink: false },
          { text: "Ease of commute", isLink: false },
          { text: "Presence of basic amenities/markets", isLink: false },
          { text: "Future appreciation prospects", isLink: false },
          { text: "Social infrastructure", isLink: false },
          { text: "Explore More", isLink: true, href: "/properties" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "2. Financials & budgeting",
    desc: "Calculate extra purchasing costs, registration fees, and setup your home loan timeline before booking",
    illustration: BudgetingSVG,
    cards: [
      {
        title: "Understanding Actual Cost of Buying",
        desc: "The advertised price of a home is rarely the final cost. Ensure you plan for these mandatory extra costs:",
        bullets: [
          { text: "Circle rates and Stamp Duty charges (4-8% of property value)", isLink: true, href: "#" },
          { text: "Registration Fees (usually 1% of property value)", isLink: false },
          { text: "Goods & Services Tax (GST) for under-construction flats", isLink: false },
          { text: "Society Maintenance advance & security deposits", isLink: true, href: "#" },
          { text: "Home Loan Processing & legal verification fees", isLink: false }
        ]
      },
      {
        title: "Home Loan Timeline",
        desc: "Securing a bank loan requires executing these key operational steps:",
        bullets: [
          { text: "Checking CIBIL score & eligibility criteria", isLink: true, href: "#" },
          { text: "Submitting Income tax files (ITR) & bank sheets", isLink: false },
          { text: "Bank legal valuation of site plan & approvals", isLink: false },
          { text: "Sanction Letter execution by bank manager", isLink: true, href: "#" },
          { text: "Disbursement Check handover directly to seller", isLink: false }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "3. Legal & verification",
    desc: "Thoroughly inspect structural layouts, builder track records, and state title deeds to prevent legal disputes",
    illustration: LegalVerificationSVG,
    cards: [
      {
        title: "Mandatory Document Checklist",
        desc: "Never transfer token deposits or sign contracts without examining certified copies of these core records:",
        bullets: [
          { text: "Original Sale Deed & historic title chains", isLink: true, href: "#" },
          { text: "Mother Deed tracking for 30 years of history", isLink: false },
          { text: "RERA Certificate checking on state portals", isLink: true, href: "#" },
          { text: "Approved Building Layout Sanction Plan", isLink: false },
          { text: "Encumbrance Certificate (EC) verifying zero mortgages", isLink: true, href: "#" }
        ]
      },
      {
        title: "Local Due Diligence",
        desc: "Confirm regional factors and developer verification points before registry:",
        bullets: [
          { text: "Outstanding society maintenance dues verification", isLink: false },
          { text: "Local municipality occupancy permissions (OC)", isLink: true, href: "#" },
          { text: "Property tax receipt clearing records", isLink: false },
          { text: "Water connection and electric sub-meter transfers", isLink: false }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "4. Registry & possession",
    desc: "Schedule Sub-Registrar slots, execute registry deeds, and run snagging inspections before key handovers",
    illustration: PossessionSVG,
    cards: [
      {
        title: "Registry Execution Process",
        desc: "The final transfer of property title occurs through these formal steps at the local Sub-Registrar office:",
        bullets: [
          { text: "Purchasing digital E-Stamp paper from state bank", isLink: true, href: "#" },
          { text: "Booking slot timings online at municipal sub-registrar", isLink: false },
          { text: "Executing Sale Deed with signatures from two witnesses", isLink: false },
          { text: "Completing biometric registration & document submissions", isLink: true, href: "#" }
        ]
      },
      {
        title: "Possession Handover Snagging",
        desc: "Perform a thorough visual and functional walk-through of the home before accepting keys:",
        bullets: [
          { text: "Inspecting walls for dampness, seepage, and cracks", isLink: false },
          { text: "Testing all electric switches and MCB panel boards", isLink: false },
          { text: "Running taps to check drainage blocks or leaks", isLink: true, href: "#" },
          { text: "Verifying window slides and door lock functions", isLink: false },
          { text: "Receiving NOC letters & previous invoice clearance sheets", isLink: true, href: "#" }
        ]
      }
    ]
  }
]

export default function BuyingGuidePage() {
  const [activeStep, setActiveStep] = useState(1)

  const currentStepData = stepsData.find(s => s.id === activeStep) || stepsData[0]
  const Illustration = currentStepData.illustration

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      {/* Top purple indicator line */}
      <div className="h-1 bg-purple-600 w-full fixed top-[72px] left-0 z-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          
          {/* LEFT COLUMN: Sticky Step Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col items-center text-center p-4">
            
            {/* Custom SVG Illustration */}
            <div className="w-64 h-64 flex items-center justify-center mb-6">
              <Illustration />
            </div>

            {/* Current Step title */}
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {currentStepData.title}
            </h2>

            {/* Current Step short desc */}
            <p className="text-sm text-slate-500 max-w-sm mt-3 leading-relaxed">
              {currentStepData.desc}
            </p>

            {/* Dot Pagination indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {stepsData.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  aria-label={`Go to step ${step.id}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeStep === step.id 
                      ? "bg-purple-600 scale-110" 
                      : "bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: Stack of Cards */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {currentStepData.cards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm"
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {card.title}
                    </h3>
                    
                    <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                      {card.desc}
                    </p>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                      {card.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-2.5 text-[14px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2.5 shrink-0" />
                          {bullet.isLink ? (
                            <Link 
                              href={bullet.href || "#"} 
                              className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                            >
                              {bullet.text}
                            </Link>
                          ) : (
                            <span className="text-slate-700">{bullet.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Bottom Step Navigation Panel */}
                <div className="flex justify-between items-center bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} /> Previous Step
                  </button>

                  <button
                    onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                    disabled={activeStep === 4}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Step <ChevronRight size={16} />
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
