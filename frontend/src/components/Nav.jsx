import { motion } from 'framer-motion'
import { Plus, X, ArrowsClockwise, Target } from '@phosphor-icons/react'

export default function Nav({ onAddClick, onRefresh, refreshing, addOpen, productCount = 0, buyZoneCount = 0 }) {
  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 sm:px-6 pt-5 pb-4">
      <motion.nav
        initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-7xl rounded-[1.75rem] p-px backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, var(--border-accent), var(--border-subtle) 44%, transparent)',
          boxShadow: '0 18px 48px -24px rgba(0,0,0,0.65)',
        }}
      >
        <div
          className="flex flex-col gap-3 rounded-[calc(1.75rem-1px)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'color-mix(in oklch, var(--bg-surface) 88%, transparent)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: 'var(--accent-surface)',
                border: '1px solid var(--border-accent)',
                color: 'var(--accent)',
              }}
            >
              <Target weight="light" size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                DontOverpay
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                <span>Deal command</span>
                <span className="hidden sm:inline" style={{ color: 'var(--border-accent)' }}>/</span>
                <span className="font-mono tabular-nums">{productCount} tracked</span>
                <span className="hidden sm:inline" style={{ color: 'var(--border-accent)' }}>/</span>
                <span className="inline-flex items-center gap-1">
                  <Target weight="light" size={12} />
                  <span className="font-mono tabular-nums">{buyZoneCount}</span> buy zones
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ease-spring active:scale-95 disabled:cursor-not-allowed"
              style={{
                color: refreshing ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)'
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = refreshing ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              title="Refresh all prices"
            >
              <motion.span
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              >
                <ArrowsClockwise weight="light" size={18} />
              </motion.span>
            </button>

            <button
              onClick={onAddClick}
              className="flex h-10 items-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200 ease-spring active:scale-[0.97]"
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
                {addOpen ? <X weight="bold" size={13} /> : <Plus weight="bold" size={13} />}
              </motion.span>
              {addOpen ? 'Close' : 'Track product'}
            </button>
          </div>
        </div>
      </motion.nav>
    </div>
  )
}
