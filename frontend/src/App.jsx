import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import AddForm from './components/AddForm'
import { fetchProducts, fetchPriceHistory, triggerUpdate } from './api'
import { buildDashboardInsights } from './lib/priceInsights'

export default function App() {
  const [products, setProducts] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const [productResult, historyResult] = await Promise.allSettled([
        fetchProducts(),
        fetchPriceHistory(),
      ])

      if (productResult.status === 'rejected') {
        throw productResult.reason
      }

      setProducts(Array.isArray(productResult.value) ? productResult.value : [])
      setError(null)

      if (historyResult.status === 'fulfilled') {
        setPriceHistory(Array.isArray(historyResult.value) ? historyResult.value : [])
      } else {
        setPriceHistory([])
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const handleAddProduct = useCallback(async () => {
    await loadDashboard()
    setShowAdd(false)
  }, [loadDashboard])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await triggerUpdate()
    } catch {
      // The update endpoint can fail per store; always reload the latest saved state.
    } finally {
      await loadDashboard()
      setRefreshing(false)
    }
  }, [loadDashboard])

  const dashboard = useMemo(
    () => buildDashboardInsights(products, priceHistory),
    [products, priceHistory],
  )
  const selectedProduct = products.find((product) => product.id === selectedId) ?? null
  const selectedInsight = dashboard.productInsights.find(({ product }) => product.id === selectedId)?.insight ?? null

  return (
    <div className="app-shell min-h-[100dvh]">
      <Nav
        onAddClick={() => setShowAdd((value) => !value)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        addOpen={showAdd}
        productCount={products.length}
        buyZoneCount={dashboard.buyZoneProducts.length}
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
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
                insight={selectedInsight}
                historyLoading={historyLoading}
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
                dashboard={dashboard}
                loading={loading}
                historyLoading={historyLoading}
                error={error}
                onSelect={setSelectedId}
                onAddClick={() => setShowAdd(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
