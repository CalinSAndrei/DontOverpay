import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const normalized = dateStr.includes('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z'
  const d = new Date(normalized)
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })
}

function formatPrice(v) {
  if (v == null) return ''
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <p className="font-mono tabular-nums font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {formatPrice(price)} Lei
      </p>
      <p style={{ color: 'var(--text-tertiary)' }}>{formatDate(label)}</p>
    </div>
  )
}

export default function PriceChart({ data, currency = 'Lei' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          No price history yet
        </p>
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Only one data point. More history appears after the next scheduled scrape.
        </p>
      </div>
    )
  }

  const chartData = data.map((row) => ({
    date: row.recorded_at,
    price: row.price,
  }))

  const prices = data.map((d) => d.price).filter(Boolean)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.15 || 50
  const yMin = Math.floor(minPrice - padding)
  const yMax = Math.ceil(maxPrice + padding)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.12} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--border-subtle)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'Geist Mono' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={formatPrice}
          tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'Geist Mono' }}
          axisLine={false}
          tickLine={false}
          width={58}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--accent)"
          strokeWidth={1.5}
          fill="url(#accentGradient)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
