import { motion } from 'framer-motion'

function Shimmer({ className, style }) {
  return (
    <motion.div
      className={className}
      style={{
        background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function ProductCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{ marginLeft: `${Math.min(index * 6, 24)}px` }}
    >
      <div
        className="rounded-3xl p-px"
        style={{ background: 'var(--border-subtle)' }}
      >
        <div
          className="rounded-[calc(1.5rem-1px)] px-6 py-5"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2.5">
              <Shimmer className="h-4 rounded-lg w-3/4" />
              <Shimmer className="h-3 rounded-lg w-1/3" />
            </div>
            <div className="text-right space-y-2.5">
              <Shimmer className="h-5 rounded-lg w-24" />
              <Shimmer className="h-5 rounded-full w-16 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ChartSkeleton() {
  return (
    <div
      className="rounded-3xl p-px"
      style={{ background: 'var(--border-subtle)' }}
    >
      <div
        className="rounded-[calc(1.5rem-1px)] p-6"
        style={{ background: 'var(--bg-surface)' }}
      >
        <Shimmer className="h-3 rounded-lg w-24 mb-6" />
        <Shimmer className="h-48 rounded-2xl" />
        <div className="flex justify-between mt-4">
          <Shimmer className="h-3 rounded-lg w-16" />
          <Shimmer className="h-3 rounded-lg w-16" />
          <Shimmer className="h-3 rounded-lg w-16" />
        </div>
      </div>
    </div>
  )
}
