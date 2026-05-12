import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import AddForm from './components/AddForm'
import { fetchProducts, triggerUpdate } from './api'

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadProducts = useCallback(async () => {
    try {
      const data = await fetchProducts()
      setProducts(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleAddProduct = useCallback(async () => {
    await loadProducts()
    setShowAdd(false)
  }, [loadProducts])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await triggerUpdate()
      await loadProducts()
    } catch {
      /* silently reload anyway */
      await loadProducts()
    } finally {
      setRefreshing(false)
    }
  }, [loadProducts])

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--bg-base)' }}>
      <Nav
        onAddClick={() => setShowAdd((v) => !v)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        addOpen={showAdd}
      />

      <AnimatePresence>
        {showAdd && (
          <AddForm
            key="add-form"
            onAdd={handleAddProduct}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {selectedId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            >
              <ProductDetail
                product={selectedProduct}
                productId={selectedId}
                onBack={() => setSelectedId(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ProductList
                products={products}
                loading={loading}
                error={error}
                onSelect={setSelectedId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
