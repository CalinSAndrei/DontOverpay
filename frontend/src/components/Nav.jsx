import { motion } from 'framer-motion'
import { Plus, X, ArrowsClockwise } from '@phosphor-icons/react'

export default function Nav({ onAddClick, onRefresh, refreshing, addOpen }) {
  return (
    <div className="sticky top-0 z-40 flex justify-center pt-6 pb-4 px-6">
      <motion.nav
        initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="flex items-center gap-3 rounded-full px-5 py-2.5 backdrop-blur-xl"
        style={{
          background: 'color-mix(in oklch, var(--bg-surface) 90%, transparent)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 pr-3" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            DontOverpay
          </span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ease-spring active:scale-95"
          style={{
            color: refreshing ? 'var(--accent)' : 'var(--text-secondary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-surface)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Refresh all prices"
        >
          <motion.span
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          >
            <ArrowsClockwise weight="light" size={16} />
          </motion.span>
        </button>

        {/* Add */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ease-spring active:scale-[0.97]"
          style={{
            background: addOpen ? 'var(--accent-surface)' : 'var(--accent)',
            color: addOpen ? 'var(--accent)' : 'var(--bg-base)',
            border: addOpen ? '1px solid var(--border-accent)' : '1px solid transparent',
          }}
        >
          <motion.span
            animate={{ rotate: addOpen ? 45 : 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {addOpen ? <X weight="bold" size={12} /> : <Plus weight="bold" size={12} />}
          </motion.span>
          {addOpen ? 'Close' : 'Add Product'}
        </button>
      </motion.nav>
    </div>
  )
}
