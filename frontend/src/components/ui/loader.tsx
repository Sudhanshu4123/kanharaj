"use client"

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'

export function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 text-rose-600 mb-6 shadow-xl border border-rose-100"
        >
          <Building2 size={40} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Kanharaj <span className="text-rose-600">properties</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-rose-500"
              />
            ))}
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] mt-6">
            Loading Excellence...
          </p>
        </motion.div>
      </div>
    </div>
  )
}
