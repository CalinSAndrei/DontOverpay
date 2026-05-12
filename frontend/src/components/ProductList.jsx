import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import EmptyState from './EmptyState'
import { ProductCardSkeleton } from './Skeletons'

export default function ProductList({ products, loading, error, onSelect }) {
  if (loading) {
    return (
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <ProductCardSkeleton key={i} index={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-16 text-center"
      >
        <p className="text-sm mb-1" style={{ color: 'var(--price-up)' }}>
          Could not reach the server
        </p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Make sure the backend is running on port 8000
        </p>
      </motion.div>
    )
  }

  if (!products.length) {
    return <EmptyState />
  }

  return (
    <div className="mt-8">
      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-[10px] uppercase tracking-[0.18em] font-medium mb-5 ml-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Tracked &mdash; {products.length} {products.length === 1 ? 'product' : 'products'}
      </motion.p>

      <div className="space-y-3">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
