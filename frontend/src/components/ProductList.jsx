import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  ChartLineUp,
  ClockCountdown,
  Gauge,
  Stack,
  Target,
  TrendDown,
} from '@phosphor-icons/react'
import ProductCard from './ProductCard'
import EmptyState from './EmptyState'
import { ProductCardSkeleton } from './Skeletons'
import { formatPrice } from '../lib/priceInsights'

function MetricTile({ label, value, detail, icon: Icon, tone = 'neutral', delay = 0 }) {
  const color = tone === 'good' ? 'var(--price-down)' : tone === 'bad' ? 'var(--price-up)' : 'var(--accent)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      transition={{ duration: 0.45, delay, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-3xl p-px"
      style={{ background: 'var(--border-subtle)' }}
    >
      <div
        className="min-h-[132px] rounded-[calc(1.5rem-1px)] p-5"
        style={{
          background: 'var(--bg-surface)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </p>
          <Icon weight="light" size={18} style={{ color }} />
        </div>
        <p className="mt-6 font-mono text-2xl font-semibold tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {detail}
        </p>
      </div>
    </motion.div>
  )
}

function RailRow({ item, type, onClick }) {
  const { product, insight } = item
  const isDrop = type === 'drop'
  const Icon = isDrop ? ArrowDown : ArrowUp
  const value = isDrop
    ? `${Math.round(insight.dropFromHighPercent)}% from high`
    : `+${formatPrice(insight.deltaFromPrevious)}`

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl px-3 py-3 text-left transition-all duration-200"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {product.name || 'Unknown product'}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>
            {product.store || 'Store'} / {insight.updatedAgo || 'no scrape'}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-mono tabular-nums"
          style={{
            background: isDrop ? 'var(--price-down-bg)' : 'var(--price-up-bg)',
            color: isDrop ? 'var(--price-down)' : 'var(--price-up)',
          }}
        >
          <Icon weight="bold" size={10} />
          {value}
        </span>
      </div>
    </button>
  )
}

function IntelligenceRail({ dashboard, onSelect }) {
  const bestDrops = dashboard.biggestDrops
  const rises = dashboard.recentRises
  const stale = dashboard.staleProducts

  return (
    <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
      <div className="rounded-3xl p-px" style={{ background: 'var(--border-accent)' }}>
        <div
          className="rounded-[calc(1.5rem-1px)] p-5"
          style={{
            background: 'var(--bg-surface)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-accent)' }}>
                Deal radar
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Signals worth checking
              </h2>
            </div>
            <Gauge weight="light" size={22} style={{ color: 'var(--accent)' }} />
          </div>

          <div className="mt-5 space-y-2">
            {bestDrops.length ? (
              bestDrops.map((item) => (
                <RailRow
                  key={item.product.id}
                  item={item}
                  type="drop"
                  onClick={() => onSelect(item.product.id)}
                />
              ))
            ) : (
              <p className="rounded-2xl p-4 text-sm leading-relaxed" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                No price drops yet. The radar improves after a few scrapes.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-px" style={{ background: 'var(--border-subtle)' }}>
        <div className="rounded-[calc(1.5rem-1px)] p-5" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Watch pressure
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <TrendDown weight="light" size={16} />
                Buy zones
              </span>
              <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--price-down)' }}>
                {dashboard.buyZoneProducts.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <ChartLineUp weight="light" size={16} />
                Rising now
              </span>
              <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--price-up)' }}>
                {rises.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <ClockCountdown weight="light" size={16} />
                Stale scrapes
              </span>
              <span className="font-mono text-sm tabular-nums" style={{ color: stale.length ? 'var(--price-up)' : 'var(--text-secondary)' }}>
                {stale.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function ProductList({ products, dashboard, loading, historyLoading, error, onSelect, onAddClick }) {
  if (loading) {
    return (
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {[0, 1, 2, 3].map((index) => (
            <ProductCardSkeleton key={index} index={index} />
          ))}
        </div>
        <div className="hidden lg:block rounded-3xl p-px" style={{ background: 'var(--border-subtle)' }}>
          <div className="h-[360px] rounded-[calc(1.5rem-1px)]" style={{ background: 'var(--bg-surface)' }} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-16 rounded-3xl p-px"
        style={{ background: 'var(--price-up-bg)' }}
      >
        <div className="rounded-[calc(1.5rem-1px)] p-8 text-center" style={{ background: 'var(--bg-surface)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--price-up)' }}>
            Could not reach the server
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Make sure the backend is running on port 8000.
          </p>
        </div>
      </motion.div>
    )
  }

  if (!products.length) {
    return <EmptyState onAddClick={onAddClick} />
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Tracked value"
          value={formatPrice(dashboard.totalTrackedValue, { maximumFractionDigits: 0 })}
          detail={`${dashboard.trackedCount} products across ${dashboard.storesCount || 1} stores`}
          icon={Stack}
          delay={0}
        />
        <MetricTile
          label="Buy zones"
          value={dashboard.buyZoneProducts.length}
          detail="Products sitting near their historical low or well below peak"
          icon={Target}
          tone="good"
          delay={0.05}
        />
        <MetricTile
          label="Price history"
          value={historyLoading ? '-' : dashboard.historyPoints}
          detail="Stored price points powering every signal on this screen"
          icon={ChartLineUp}
          delay={0.1}
        />
        <MetricTile
          label="Needs attention"
          value={dashboard.staleProducts.length}
          detail="Products with older scrape timestamps"
          icon={ClockCountdown}
          tone={dashboard.staleProducts.length ? 'bad' : 'neutral'}
          delay={0.15}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Live watchlist
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Deal command center
              </h1>
            </div>
            <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every badge is derived from your current product rows and saved price history.
            </p>
          </div>

          <div className="space-y-3">
            {dashboard.productInsights.map(({ product, insight }, index) => (
              <ProductCard
                key={product.id}
                product={product}
                insight={insight}
                index={index}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        <IntelligenceRail dashboard={dashboard} onSelect={onSelect} />
      </section>
    </div>
  )
}
