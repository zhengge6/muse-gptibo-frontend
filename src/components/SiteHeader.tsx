import { Link } from 'react-router-dom'

const GeminiTabIcon = () => (
  <svg className="tab-logo" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      fill="url(#tabGeminiGrad)"
      d="M10 1.2C11.1 5.5 13.2 7.7 17.5 8.8C13.2 9.9 11.1 12.1 10 16.4C8.9 12.1 6.8 9.9 2.5 8.8C6.8 7.7 8.9 5.5 10 1.2Z"
    />
    <defs>
      <linearGradient id="tabGeminiGrad" x1="3" y1="14" x2="16" y2="4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2789f5" />
        <stop offset=".34" stopColor="#567cee" />
        <stop offset=".65" stopColor="#9673d9" />
        <stop offset="1" stopColor="#d67da1" />
      </linearGradient>
    </defs>
  </svg>
)

export function SiteHeader({
  productId,
  onSelect,
  showSwitch = true,
  rightTo = '/orders',
  rightLabel = '我的订单',
}: {
  productId?: 'muse' | 'gemini'
  onSelect?: (id: 'muse' | 'gemini') => void
  showSwitch?: boolean
  rightTo?: string
  rightLabel?: string
}) {
  return (
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="GPTibo 商店首页">
        <span className="wordmark-icon">
          <img src="/assets/favicon.svg" alt="" width={29} height={29} />
        </span>
        <span>
          GPTibo<span className="wordmark-dot">.</span>
        </span>
      </Link>

      {showSwitch && productId && onSelect && (
        <div
          className="product-switch"
          role="tablist"
          aria-label="选择商品"
          onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
            e.preventDefault()
            const next = e.key === 'ArrowRight' || e.key === 'End' ? 'gemini' : 'muse'
            onSelect(next)
          }}
        >
          <span
            className={`switch-indicator${productId === 'gemini' ? ' on-gemini' : ''}`}
            aria-hidden="true"
          />
          <button
            type="button"
            role="tab"
            aria-selected={productId === 'muse'}
            aria-controls="product-panel"
            data-product="muse"
            onClick={() => onSelect('muse')}
          >
            <img className="tab-logo" src="/assets/muse-logo.svg" alt="" width={20} height={20} />
            Muse AI
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={productId === 'gemini'}
            aria-controls="product-panel"
            data-product="gemini"
            onClick={() => onSelect('gemini')}
          >
            <GeminiTabIcon />
            Gemini
          </button>
        </div>
      )}

      <Link className="orders-link" to={rightTo} aria-label={rightLabel}>
        {rightTo === '/' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )}
        <span>{rightLabel}</span>
      </Link>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 GPTibo</span>
      <a href="https://t.me/coolkhz" target="_blank" rel="noopener noreferrer">
        联系支持
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </a>
    </footer>
  )
}
