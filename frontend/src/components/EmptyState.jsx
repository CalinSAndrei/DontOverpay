import { motion } from 'framer-motion'
import { Tag } from '@phosphor-icons/react'

export default function EmptyState({ onAddClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col items-center justify-center py-32 gap-5"
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Tag weight="light" size={24} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      <div className="text-center">
        <p className="text-base font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
          No products tracked
        </p>
        <p className="text-sm max-w-[280px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Paste a product URL from emag.ro or pcgarage.ro to start watching its price.
        </p>
      </div>

      <button
        onClick={onAddClick}
        className="rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-spring active:scale-[0.97]"
        style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}
      >
        Track your first product
      </button>
    </motion.div>
  )
}
