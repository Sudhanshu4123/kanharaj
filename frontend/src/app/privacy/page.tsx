import { Shield, Lock, Eye, FileText, Globe, Mail } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | Kanharaj',
  description: 'Learn how Kanharaj collects, uses, and protects your personal information.',
}

export default function PrivacyPolicy() {
  const lastUpdated = 'May 15, 2026'

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
              Privacy <span className="text-rose-600">Policy</span>
            </h1>
            <p className="text-slate-500 font-medium">Last Updated: {lastUpdated}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 prose prose-slate max-w-none">
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Introduction</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              At Kanharaj, accessible from kanharaj.com, one of our main priorities is the privacy of our visitors. 
              This Privacy Policy document contains types of information that is collected and recorded by Kanharaj 
              and how we use it. If you have additional questions or require more information about our Privacy Policy, 
              do not hesitate to contact us.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Information We Collect</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Kanharaj follows a standard procedure of using log files. These files log visitors when they visit websites. 
              The information collected by log files includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Internet Protocol (IP) addresses</li>
              <li>Browser type and version</li>
              <li>Internet Service Provider (ISP)</li>
              <li>Date and time stamps</li>
              <li>Referring/exit pages</li>
              <li>Number of clicks and on-site behavior</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Eye size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">How We Use Your Information</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you for customer service and updates</li>
              <li>Send you emails and notifications about property inquiries</li>
              <li>Find and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Globe size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Cookies and Web Beacons</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Like any other website, Kanharaj uses 'cookies'. These cookies are used to store information including 
              visitors' preferences, and the pages on the website that the visitor accessed or visited. The information 
              is used to optimize the users' experience by customizing our web page content based on visitors' 
              browser type and/or other information.
            </p>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Mail size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Contact Us</h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
            </p>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="m-0 font-bold text-slate-900">Kanharaj Real Estate</p>
              <p className="m-0 text-slate-600">Email: kanharaj1389@gmail.com</p>
              <p className="m-0 text-slate-600">Phone: +91 9599801767</p>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm">
              &copy; 2024 Kanharaj. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
