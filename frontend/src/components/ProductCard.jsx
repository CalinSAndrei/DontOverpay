import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, CaretRight, Clock, TrendDown, TrendUp } from '@phosphor-icons/react'
import { formatPrice } from '../lib/priceInsights'

function Sparkline({ history, tone }) {
  const prices = history.map((row) => Number(row.price)).filter((price) => Number.isFinite(price)).slice(-14)
  if (prices.length < 2) {
    return (
      <div className="flex h-12 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-input)' }}>
        <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
          Learning
        </span>
      </div>
    )
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const points = prices.map((price, index) => {
    const x = (index / (prices.length - 1)) * 100
    const y = 42 - ((price - min) / range) * 34
    return `${x},${y}`
  }).join(' ')

  const stroke = tone === 'good' ? 'var(--price-down)' : tone === 'bad' ? 'var(--price-up)' : 'var(--accent)'

  return (
    <div className="h-12 rounded-2xl px-2 py-1.5" style={{ background: 'var(--bg-input)' }}>
      <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}

export default function ProductCard({ product, insight, index = 0, onSelect }) {
  const signalColor =
    insight?.signalTone === 'good'
      ? 'var(--price-down)'
      : insight?.signalTone === 'bad'
        ? 'var(--price-up)'
        : 'var(--accent)'
  const signalBg =
    insight?.signalTone === 'good'
      ? 'var(--price-down-bg)'
      : insight?.signalTone === 'bad'
        ? 'var(--price-up-bg)'
        : 'var(--accent-surface)'
  const TrendIcon = insight?.trend === 'down' ? TrendDown : insight?.trend === 'up' ? TrendUp : Clock
  const trendLabel =
    insight?.deltaFromPrevious == null
      ? 'No previous'
      : `${insight.deltaFromPrevious > 0 ? '+' : ''}${formatPrice(insight.deltaFromPrevious)}`

  return (
    <motion.div
      layoutId={`card-${product.id}`}
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.045, 0.28), ease: [0.32, 0.72, 0, 1] }}
      className="group cursor-pointer"
      onClick={() => onSelect(product.id)}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        className="rounded-3xl p-px transition-all duration-300"
        style={{ background: insight?.signalTone === 'good' ? 'var(--border-accent)' : 'var(--border-subtle)' }}
      >
        <div
          className="rounded-[calc(1.5rem-1px)] px-4 py-4 transition-all duration-300 sm:px-5"
          style={{
            background: 'var(--bg-surface)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px] xl:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-medium"
                  style={{ background: signalBg, color: signalColor }}
                >
                  {insight?.signal || 'Learning'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                  {product.store || 'Store'}
                </span>
                {insight?.stale && (
                  <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--price-up)' }}>
                    Stale
                  </span>
                )}
              </div>

              <p className="truncate text-base font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                {product.name || 'Unknown product'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <Clock weight="light" size={14} />
                  {insight?.updatedAgo || 'No scrape yet'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums" style={{ color: signalColor }}>
                  <TrendIcon weight="light" size={14} />
                  {trendLabel}
                </span>
              </div>
            </div>

            <Sparkline history={insight?.history || []} tone={insight?.signalTone} />

            <div className="flex items-end justify-between gap-4 xl:items-center xl:justify-end">
              <div className="text-left xl:text-right">
                <p className="font-mono text-xl font-semibold tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>
                  {formatPrice(insight?.currentPrice ?? product.price)}
                </p>
                <p className="mt-1 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {insight?.currency || product.currency || 'Lei'}
                </p>
              </div>

              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 group-hover:translate-x-0.5"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {insight?.trend === 'down' ? (
                  <ArrowDown weight="light" size={17} style={{ color: 'var(--price-down)' }} />
                ) : insight?.trend === 'up' ? (
                  <ArrowUp weight="light" size={17} style={{ color: 'var(--price-up)' }} />
                ) : (
                  <CaretRight weight="light" size={17} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
