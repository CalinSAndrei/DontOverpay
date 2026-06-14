import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, ArrowRight, Warning } from '@phosphor-icons/react'
import { addProduct } from '../api'

export default function AddForm({ onAdd, onClose }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    try {
      await addProduct(url.trim())
      await onAdd()
      setUrl('')
    } catch (err) {
      setError(err.message || 'Could not add product. Check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div
          className="rounded-3xl p-px"
          style={{ background: 'var(--border-accent)' }}
        >
          <div
            className="rounded-[calc(1.5rem-1px)] px-6 py-5"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-medium mb-4"
              style={{ color: 'var(--text-accent)' }}
            >
              Track a product
            </p>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3 items-stretch sm:flex-row sm:items-start">
                {/* Input */}
                <div className="flex-1">
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                    style={{
                      background: 'var(--bg-input)',
                      border: `1px solid ${error ? 'var(--price-up)' : 'var(--border-subtle)'}`,
                    }}
                    onFocusCapture={(e) => {
                      if (!error) e.currentTarget.style.borderColor = 'var(--border-accent)'
                    }}
                    onBlurCapture={(e) => {
                      if (!error) e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    }}
                  >
                    <Link weight="light" size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(null) }}
                      placeholder="https://www.emag.ro/..."
                      className="flex-1 bg-transparent text-sm outline-none font-sans"
                      style={{ color: 'var(--text-primary)' }}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1.5 mt-2 text-xs"
                      style={{ color: 'var(--price-up)' }}
                    >
                      <Warning weight="fill" size={12} />
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 ease-spring active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed group"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--bg-base)',
                  }}
                >
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-sm"
                    >
                      Scraping...
                    </motion.span>
                  ) : (
                    <>
                      Track
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ background: 'rgba(0,0,0,0.15)' }}
                      >
                        <ArrowRight weight="bold" size={10} />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Supports emag.ro and pcgarage.ro
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
