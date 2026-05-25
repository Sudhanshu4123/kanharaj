'use client'

import { motion, AnimatePresence } from 'framer-motion'

export function PageLoadingBar({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9998] h-1 overflow-hidden bg-slate-100"
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-rose-500 via-[#6B46C1] to-rose-500 rounded-full"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
