async function request(path, options) {
  const res = await fetch(path, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const fetchProducts = () => request('/products/')

export const fetchProduct = (id) => request(`/products/${id}`)

export const fetchPriceHistory = () => request('/products/pricehistory')

export const triggerUpdate = () => request('/products/updatehistory')

export async function addProduct(url) {
  const body = new URLSearchParams({ url })
  return request('/products/add/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
}
