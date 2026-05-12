import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowSquareOut, ArrowDown, ArrowUp } from '@phosphor-icons/react'
import PriceChart from './PriceChart'
import { ChartSkeleton } from './Skeletons'
import { fetchPriceHistory } from '../api'

function formatPrice(price) {
  if (price == null) return '—'
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const normalized = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z'
  const diff = (Date.now() - new Date(normalized).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ProductDetail({ product, productId, onBack }) {
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    setHistoryLoading(true)
    fetchPriceHistory()
      .then((all) => {
        const filtered = (Array.isArray(all) ? all : [])
          .filter((row) => row.product_id === productId)
          .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
        setHistory(filtered)
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [productId])

  if (!product) return null

  const currentPrice = product.price
  const firstPrice = history?.[0]?.price ?? null
  const delta = firstPrice != null && currentPrice != null ? currentPrice - firstPrice : null
  const deltaPercent = delta != null && firstPrice ? ((delta / firstPrice) * 100).toFixed(1) : null
  const isDrop = delta != null && delta < 0
  const isRise = delta != null && delta > 0

  const allPrices = history?.map((h) => h.price).filter(Boolean) ?? []
  const lowestPrice = allPrices.length ? Math.min(...allPrices) : null
  const highestPrice = allPrices.length ? Math.max(...allPrices) : null

  return (
    <div className="mt-8">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm transition-all duration-200 group"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft weight="light" size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        All products
      </motion.button>

      <div className="space-y-4">
        {/* Header card */}
        <motion.div
          layoutId={`card-${productId}`}
          className="rounded-3xl p-px"
          style={{ background: 'var(--border-accent)' }}
          layout
        >
          <div
            className="rounded-[calc(1.5rem-1px)] px-7 py-6"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] uppercase tracking-[0.18em] font-medium mb-2"
                  style={{ color: 'var(--text-accent)' }}
                >
                  {product.store}
                </p>
                <h1
                  className="text-xl font-semibold tracking-tight leading-snug mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {product.name}
                </h1>
                {product.recorded_at && (
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Updated {timeAgo(product.recorded_at)}
                  </p>
                )}
              </div>

              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-all duration-200"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <ArrowSquareOut weight="light" size={16} />
              </a>
            </div>

            {/* Price row */}
            <div className="flex items-end gap-4 mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                  Current price
                </p>
                <p
                  className="text-3xl font-semibold tabular-nums font-mono leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatPrice(currentPrice)}
                  <span className="text-sm font-sans ml-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    {product.currency || 'Lei'}
                  </span>
                </p>
              </div>

              {delta !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-mono tabular-nums font-medium mb-1"
                  style={{
                    background: isDrop ? 'var(--price-down-bg)' : isRise ? 'var(--price-up-bg)' : 'var(--bg-input)',
                    color: isDrop ? 'var(--price-down)' : isRise ? 'var(--price-up)' : 'var(--text-tertiary)',
                  }}
                >
                  {isDrop ? <ArrowDown weight="bold" size={10} /> : isRise ? <ArrowUp weight="bold" size={10} /> : null}
                  {delta > 0 ? '+' : ''}{formatPrice(delta)} ({deltaPercent}%)
                </motion.div>
              )}
            </div>

            {/* Stats row */}
            {(lowestPrice != null || highestPrice != null) && (
              <div className="flex gap-8 mt-5">
                {lowestPrice != null && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Lowest
                    </p>
                    <p className="text-sm font-mono tabular-nums font-medium" style={{ color: 'var(--price-down)' }}>
                      {formatPrice(lowestPrice)}
                    </p>
                  </div>
                )}
                {highestPrice != null && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Highest
                    </p>
                    <p className="text-sm font-mono tabular-nums font-medium" style={{ color: 'var(--price-up)' }}>
                      {formatPrice(highestPrice)}
                    </p>
                  </div>
                )}
                {history?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      Data points
                    </p>
                    <p className="text-sm font-mono tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {history.length}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-3xl p-px"
          style={{ background: 'var(--border-subtle)' }}
        >
          <div
            className="rounded-[calc(1.5rem-1px)] px-7 py-6"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Price history
            </p>

            {historyLoading ? (
              <div className="h-48 flex items-center justify-center">
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Loading history...
                </motion.div>
              </div>
            ) : (
              <PriceChart data={history} currency={product.currency} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
