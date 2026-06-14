import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowLeft,
  ArrowSquareOut,
  ArrowUp,
  ChartLineUp,
  Clock,
  Scales,
  Target,
  TrendDown,
} from '@phosphor-icons/react'
import PriceChart from './PriceChart'
import { formatPrice } from '../lib/priceInsights'

function StatBox({ label, value, detail, tone = 'neutral' }) {
  const color = tone === 'good' ? 'var(--price-down)' : tone === 'bad' ? 'var(--price-up)' : 'var(--text-primary)'

  return (
    <div className="rounded-3xl p-px" style={{ background: 'var(--border-subtle)' }}>
      <div className="min-h-[120px] rounded-[calc(1.5rem-1px)] p-5" style={{ background: 'var(--bg-surface)' }}>
        <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="mt-5 font-mono text-xl font-semibold tabular-nums leading-none" style={{ color }}>
          {value}
        </p>
        {detail && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}

function DecisionPanel({ insight }) {
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
  const message =
    insight?.historyCount < 2
      ? 'Collecting more scrapes before making a strong call.'
      : insight?.signalTone === 'good'
        ? 'Current price is close to the best observed range.'
        : insight?.signalTone === 'bad'
          ? 'Price momentum is unfavorable compared with recent history.'
          : 'No urgent move. Keep watching for a cleaner discount.'

  return (
    <div className="rounded-3xl p-px" style={{ background: 'var(--border-accent)' }}>
      <div
        className="rounded-[calc(1.5rem-1px)] p-5"
        style={{
          background: 'var(--bg-surface)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-accent)' }}>
            Deal signal
          </p>
          <Target weight="light" size={20} style={{ color: signalColor }} />
        </div>
        <div className="mt-5 inline-flex rounded-2xl px-3 py-2 text-sm font-medium" style={{ background: signalBg, color: signalColor }}>
          {insight?.signal || 'Learning'}
        </div>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <TrendDown weight="light" size={16} />
              Below highest
            </span>
            <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--price-down)' }}>
              {Math.round(insight?.dropFromHighPercent || 0)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Scales weight="light" size={16} />
              Above lowest
            </span>
            <span className="font-mono text-sm tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {Math.round(insight?.aboveLowPercent || 0)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Clock weight="light" size={16} />
              Last scrape
            </span>
            <span className="font-mono text-sm tabular-nums" style={{ color: insight?.stale ? 'var(--price-up)' : 'var(--text-secondary)' }}>
              {insight?.updatedAgo || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetail({ product, productId, insight, historyLoading, onBack }) {
  if (!product) return null

  const currentPrice = insight?.currentPrice ?? product.price
  const delta = insight?.deltaFromFirst ?? null
  const isDrop = delta != null && delta < 0
  const isRise = delta != null && delta > 0
  const history = insight?.history || []

  return (
    <div className="mt-8">
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm transition-all duration-200 group"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(event) => (event.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(event) => (event.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft weight="light" size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        All products
      </motion.button>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <motion.div
            layoutId={`card-${productId}`}
            className="rounded-[2rem] p-px"
            style={{ background: 'var(--border-accent)' }}
            layout
          >
            <div
              className="rounded-[calc(2rem-1px)] p-6 sm:p-7"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em]" style={{ background: 'var(--accent-surface)', color: 'var(--accent)' }}>
                      {product.store || 'Store'}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
                      {insight?.historyCount || 0} price points
                    </span>
                  </div>
                  <h1 className="max-w-4xl text-2xl font-semibold tracking-tight leading-tight sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                    {product.name || 'Unknown product'}
                  </h1>
                </div>

                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-all duration-200"
                    style={{
                      background: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Open store
                    <ArrowSquareOut weight="light" size={16} />
                  </a>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
                    Current price
                  </p>
                  <p className="mt-2 font-mono text-4xl font-semibold tabular-nums leading-none sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(currentPrice)}
                    <span className="ml-2 align-middle text-base font-sans font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {insight?.currency || product.currency || 'Lei'}
                    </span>
                  </p>
                </div>

                {delta !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-mono tabular-nums font-medium"
                    style={{
                      background: isDrop ? 'var(--price-down-bg)' : isRise ? 'var(--price-up-bg)' : 'var(--bg-input)',
                      color: isDrop ? 'var(--price-down)' : isRise ? 'var(--price-up)' : 'var(--text-tertiary)',
                    }}
                  >
                    {isDrop ? <ArrowDown weight="bold" size={13} /> : isRise ? <ArrowUp weight="bold" size={13} /> : null}
                    {delta > 0 ? '+' : ''}{formatPrice(delta)}
                    {insight?.deltaPercent != null && (
                      <span>({insight.deltaPercent > 0 ? '+' : ''}{insight.deltaPercent.toFixed(1)}%)</span>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <section className="grid gap-4 sm:grid-cols-3">
            <StatBox
              label="Lowest seen"
              value={formatPrice(insight?.lowestPrice)}
              detail={insight?.isAtLow ? 'Current price matches the low.' : 'Best observed point.'}
              tone="good"
            />
            <StatBox
              label="Highest seen"
              value={formatPrice(insight?.highestPrice)}
              detail={`${Math.round(insight?.rangePercent || 0)}% observed range`}
              tone="bad"
            />
            <StatBox
              label="History depth"
              value={insight?.historyCount || 0}
              detail={history.length > 1 ? 'Enough data for trend signals.' : 'Needs more scrapes.'}
            />
          </section>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-[2rem] p-px"
            style={{ background: 'var(--border-subtle)' }}
          >
            <div
              className="rounded-[calc(2rem-1px)] p-5 sm:p-7"
              style={{
                background: 'var(--bg-surface)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Price history
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Movement over time
                  </h2>
                </div>
                <ChartLineUp weight="light" size={22} style={{ color: 'var(--accent)' }} />
              </div>

              {historyLoading ? (
                <div className="flex h-72 items-center justify-center">
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
                <PriceChart data={history} currency={insight?.currency || product.currency} height={288} />
              )}
            </div>
          </motion.div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-32 xl:self-start">
          <DecisionPanel insight={insight} />
          <div className="rounded-3xl p-px" style={{ background: 'var(--border-subtle)' }}>
            <div className="rounded-[calc(1.5rem-1px)] p-5" style={{ background: 'var(--bg-surface)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Product file
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: 'var(--text-secondary)' }}>Currency</span>
                  <span className="font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {insight?.currency || product.currency || 'Lei'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: 'var(--text-secondary)' }}>Store</span>
                  <span className="truncate text-right" style={{ color: 'var(--text-primary)' }}>
                    {product.store || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: 'var(--text-secondary)' }}>State</span>
                  <span style={{ color: insight?.stale ? 'var(--price-up)' : 'var(--price-down)' }}>
                    {insight?.stale ? 'Needs refresh' : 'Current'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
