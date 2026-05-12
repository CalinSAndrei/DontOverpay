import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, CaretRight } from '@phosphor-icons/react'

function formatPrice(price) {
  if (price == null) return '—'
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const normalized = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z'
  const diff = (Date.now() - new Date(normalized).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ProductCard({ product, index = 0, onSelect }) {
  const hasDrop = false // delta unavailable in list view; only shown in detail

  return (
    <motion.div
      layoutId={`card-${product.id}`}
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      style={{ marginLeft: `${Math.min(index * 6, 24)}px` }}
      className="group cursor-pointer"
      onClick={() => onSelect(product.id)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Outer shell */}
      <div
        className="rounded-3xl p-px transition-all duration-300"
        style={{
          background: 'var(--border-subtle)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border-accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--border-subtle)')}
      >
        {/* Inner core */}
        <div
          className="rounded-[calc(1.5rem-1px)] px-6 py-5 transition-all duration-300"
          style={{
            background: 'var(--bg-surface)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
        >
          <div className="flex items-center gap-4">
            {/* Left: name + store */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium leading-snug mb-1 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {product.name || 'Unknown product'}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] uppercase tracking-[0.12em] font-medium"
                  style={{ color: 'var(--text-accent)' }}
                >
                  {product.store}
                </span>
                {product.recorded_at && (
                  <>
                    <span style={{ color: 'var(--border-subtle)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {timeAgo(product.recorded_at)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: price + arrow */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p
                  className="text-base font-medium tabular-nums font-mono leading-none mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatPrice(product.price)}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {product.currency || 'Lei'}
                </p>
              </div>

              <div
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <CaretRight weight="light" size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
