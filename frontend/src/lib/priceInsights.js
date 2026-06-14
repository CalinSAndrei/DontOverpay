export function formatPrice(price, options = {}) {
  if (price == null || Number.isNaN(Number(price))) return '-'
  const maximumFractionDigits = options.maximumFractionDigits ?? 2
  const minimumFractionDigits = options.minimumFractionDigits ?? Math.min(2, maximumFractionDigits)

  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(price))
}

export function normalizeDate(dateStr) {
  if (!dateStr) return null
  return dateStr.includes('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`
}

export function timeAgo(dateStr) {
  const normalized = normalizeDate(dateStr)
  if (!normalized) return ''

  const diff = (Date.now() - new Date(normalized).getTime()) / 1000
  if (!Number.isFinite(diff)) return ''
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function getProductHistory(allHistory, productId) {
  return (Array.isArray(allHistory) ? allHistory : [])
    .filter((row) => row.product_id === productId)
    .filter((row) => row.price != null)
    .sort((a, b) => new Date(normalizeDate(a.recorded_at)) - new Date(normalizeDate(b.recorded_at)))
}

export function buildProductInsight(product, allHistory) {
  const history = getProductHistory(allHistory, product.id)
  const currentPrice = product.price != null ? Number(product.price) : null
  const prices = history.map((row) => Number(row.price)).filter((price) => Number.isFinite(price))
  const latestKnownPrice = currentPrice ?? prices.at(-1) ?? null
  const firstPrice = prices[0] ?? latestKnownPrice
  const previousPrice = prices.length > 1 ? prices.at(-2) : null
  const lowestPrice = prices.length ? Math.min(...prices) : latestKnownPrice
  const highestPrice = prices.length ? Math.max(...prices) : latestKnownPrice
  const deltaFromFirst = firstPrice != null && latestKnownPrice != null ? latestKnownPrice - firstPrice : null
  const deltaFromPrevious = previousPrice != null && latestKnownPrice != null ? latestKnownPrice - previousPrice : null
  const deltaPercent = deltaFromFirst != null && firstPrice ? (deltaFromFirst / firstPrice) * 100 : null
  const dropFromHighPercent =
    highestPrice != null && latestKnownPrice != null && highestPrice > 0
      ? Math.max(0, ((highestPrice - latestKnownPrice) / highestPrice) * 100)
      : 0
  const aboveLowPercent =
    lowestPrice != null && latestKnownPrice != null && lowestPrice > 0
      ? Math.max(0, ((latestKnownPrice - lowestPrice) / lowestPrice) * 100)
      : 0
  const rangePercent =
    lowestPrice != null && highestPrice != null && lowestPrice > 0
      ? ((highestPrice - lowestPrice) / lowestPrice) * 100
      : 0
  const isAtLow = latestKnownPrice != null && lowestPrice != null && latestKnownPrice <= lowestPrice
  const isAtHigh = latestKnownPrice != null && highestPrice != null && latestKnownPrice >= highestPrice
  const trend = deltaFromPrevious == null ? 'flat' : deltaFromPrevious < 0 ? 'down' : deltaFromPrevious > 0 ? 'up' : 'flat'
  const updatedAgo = timeAgo(product.recorded_at)
  const ageMs = product.recorded_at ? Date.now() - new Date(normalizeDate(product.recorded_at)).getTime() : null
  const stale = ageMs == null ? false : ageMs > 1000 * 60 * 60 * 24 * 3

  let signal = 'Learning'
  let signalTone = 'neutral'
  if (prices.length >= 2) {
    if (isAtLow || dropFromHighPercent >= 12) {
      signal = 'Buy zone'
      signalTone = 'good'
    } else if (isAtHigh || trend === 'up') {
      signal = 'Wait'
      signalTone = 'bad'
    } else {
      signal = 'Watch'
      signalTone = 'neutral'
    }
  }

  return {
    history,
    historyCount: prices.length,
    currentPrice: latestKnownPrice,
    firstPrice,
    previousPrice,
    lowestPrice,
    highestPrice,
    deltaFromFirst,
    deltaFromPrevious,
    deltaPercent,
    dropFromHighPercent,
    aboveLowPercent,
    rangePercent,
    isAtLow,
    isAtHigh,
    trend,
    signal,
    signalTone,
    updatedAgo,
    stale,
    currency: product.currency || 'Lei',
  }
}

export function buildDashboardInsights(products, allHistory) {
  const productInsights = (Array.isArray(products) ? products : []).map((product) => ({
    product,
    insight: buildProductInsight(product, allHistory),
  }))

  const sortedByDrop = [...productInsights]
    .filter(({ insight }) => insight.historyCount >= 2)
    .sort((a, b) => b.insight.dropFromHighPercent - a.insight.dropFromHighPercent)

  const sortedByRise = [...productInsights]
    .filter(({ insight }) => insight.deltaFromPrevious != null && insight.deltaFromPrevious > 0)
    .sort((a, b) => b.insight.deltaFromPrevious - a.insight.deltaFromPrevious)

  const staleProducts = productInsights.filter(({ insight }) => insight.stale)
  const buyZoneProducts = productInsights.filter(({ insight }) => insight.signalTone === 'good')
  const totalTrackedValue = productInsights.reduce((sum, { insight }) => sum + (insight.currentPrice || 0), 0)
  const stores = new Set(productInsights.map(({ product }) => product.store).filter(Boolean))

  return {
    productInsights,
    biggestDrops: sortedByDrop.slice(0, 4),
    recentRises: sortedByRise.slice(0, 3),
    staleProducts: staleProducts.slice(0, 3),
    buyZoneProducts: buyZoneProducts.slice(0, 4),
    totalTrackedValue,
    trackedCount: productInsights.length,
    storesCount: stores.size,
    historyPoints: Array.isArray(allHistory) ? allHistory.length : 0,
  }
}
