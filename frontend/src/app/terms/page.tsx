import { Scale, ShieldCheck, AlertCircle, FileText, Globe, Gavel, Ban, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | Kanharaj',
  description: 'The legal agreement and terms of use for the Kanharaj real estate platform.',
}

export default function TermsOfService() {
  const lastUpdated = 'May 15, 2026'

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-slate-50 rounded-full -ml-32 -mt-32 opacity-50" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-slate-200">
              <Gavel size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Terms of <span className="text-rose-600">Service</span>
            </h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Legal Agreement • Last Updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">1. Introduction</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Welcome to Kanharaj (kanharaj.com). This platform, including all subdomains, mobile interfaces, and APIs, is owned and operated by Kanharaj Real Estate Solutions. These terms and conditions, along with our Privacy Policy, constitute a legally binding agreement between Kanharaj and the User.
            </p>
            <p className="text-slate-600 leading-relaxed">
              By accessing our services, you agree to comply with these terms. Kanharaj reserves the right to modify these terms at any time, and such modifications shall be effective immediately upon posting.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Globe size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">2. Definitions</h2>
            </div>
            <ul className="space-y-4 text-slate-600 list-none p-0">
              <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">Subscriber/User:</strong> 
                Any individual or legal entity who has registered for our services (paid or free) and has access via credentials.
              </li>
              <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">Visitor:</strong> 
                Any person utilizing our services without creating an account (browsing public portions).
              </li>
              <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">Advertiser:</strong> 
                A Subscriber/User uploading property listings, banners, or any promotional content.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Scale size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">3. Listing Administration</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Users agree not to submit any property descriptions, photographs, or financial data unless they have acquired all necessary rights and authorizations from the owner or power-of-attorney holder. In compliance with the Real Estate (Regulation and Development) Act, 2016 (RERDA), users must obtain all requisite approvals and licenses for their listings.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Kanharaj acts as a medium for information exchange and does not conduct independent verification of authenticity or legal compliance for any third-party listing.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">4. Payment & Refunds</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Payments for services are on a 100% advance basis.</li>
              <li>Subscription fees are non-refundable. Refunds, if any, are at the sole discretion of Kanharaj.</li>
              <li>Transactions are processed via third-party secure gateways. Kanharaj does not store sensitive credit card data.</li>
              <li>Cash payments for subscriptions are strictly prohibited.</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Ban size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">5. Prohibitions</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">The following actions constitute misuse and are strictly prohibited:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
              {[
                'Automated scraping or data extraction',
                'Unauthorized access attempts (hacking)',
                'Impersonating other entities or misrepresentation',
                'Hosting obscene or inappropriate content',
                'Reverse engineering the platform',
                'Spamming users via SMS or Email'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-xl text-slate-600">
                  <AlertCircle size={14} className="text-rose-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">6. Dispute Resolution</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Any dispute arising between a user and Kanharaj regarding these terms shall be referred to a sole Arbitrator in New Delhi, governed by the Arbitration & Conciliation Act, 1996. The courts at New Delhi, India shall have exclusive jurisdiction.
            </p>
          </section>

          <div className="mt-12 bg-slate-900 rounded-[30px] p-8 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Questions regarding our Terms?</h3>
            <p className="text-slate-400 text-sm mb-6">Our legal team is here to help you understand your rights.</p>
            <a href="mailto:legal@kanharaj.com" className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 px-6 py-3 rounded-xl font-bold transition-all">
              <Mail size={18} />
              Contact Legal Dept
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
