import { Shield, Lock, Eye, FileText, Globe, Mail, Users, CreditCard, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Kanharaj - Dwarka Real Estate',
  description: 'Our commitment to protecting your data and ensuring a transparent real estate experience.',
}

export default function PrivacyPolicy() {
  const lastUpdated = 'May 15, 2024'

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-rose-200">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Privacy <span className="text-rose-600">Protocol</span>
            </h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Security & Transparency • Last Updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-12 italic border-l-4 border-rose-500 pl-6">
              "At Kanharaj, we believe transparency is the foundation of trust. This protocol outlines our commitment to managing your real estate data with the highest level of integrity."
            </p>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">1. Data Governance</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Kanharaj ("we", "us", or "our") operates the real estate platform at kanharaj.com. We collect personal identification information to provide a seamless property discovery experience. This includes, but is not limited to, your name, contact numbers, email addresses, and specific property preferences.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Users size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">2. Lead Management & Disclosure</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our platform functions as a bridge between buyers and sellers. When you submit an inquiry for a listing:
              </p>
              <ul className="space-y-4 text-slate-600 list-none p-0">
                <li className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>Your contact profile is shared securely with the specific property owner or verified agent.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>Sellers receive these details as "Leads" to facilitate immediate professional communication.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>We strictly prohibit the bulk sale of user leads to third-party advertisers.</span>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">3. Transactional Security</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All premium subscriptions and seller plans are processed via Razorpay. We adhere to industry-standard encryption protocols. Kanharaj does not store sensitive financial instruments like CVV numbers or bank passwords. We only retain metadata (Transaction ID, Amount, Expiry) to ensure your account services remain uninterrupted.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Lock size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">4. User Authentication</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                User accounts are protected by encrypted password hashing and JWT (JSON Web Tokens). It is the user's responsibility to maintain the confidentiality of their login credentials. Any unauthorized access detected should be reported immediately to our security team.
              </p>
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Globe size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">5. Digital Footprints (Cookies)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We utilize essential cookies to manage sessions and remember your property filters. This enables a personalized browsing experience, allowing the platform to suggest properties that match your previously viewed listings.
              </p>
            </section>

            <section className="pt-10 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                  <Mail size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 m-0">Support & Inquiries</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-8">
                For legal inquiries, data deletion requests, or privacy concerns, please reach out to our compliance department.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Corporate Office</p>
                  <p className="text-slate-900 font-bold mb-0">Kanharaj Real Estate Solutions</p>
                  <p className="text-slate-600 text-sm">Sector 7, Dwarka, New Delhi — 110078</p>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Direct Channels</p>
                  <p className="text-slate-900 font-bold mb-0">kanharaj1389@gmail.com</p>
                  <p className="text-slate-600 text-sm">+91 9599801767</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          &copy; 2024 Kanharaj. Licensed Real Estate Portal.
        </p>
      </div>
    </div>
  )
}
