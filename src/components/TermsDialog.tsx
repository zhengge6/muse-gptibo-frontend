import type { Product } from '../lib/products'

export function TermsDialog({
  open,
  product,
  onClose,
}: {
  open: boolean
  product: Product
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div
      className="dialog-backdrop open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="termsTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog">
        <button type="button" className="close-button" onClick={onClose} aria-label="关闭">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 id="termsTitle">购买须知</h2>
        <p className="terms-dialog-product">
          {product.name} · {product.label}
        </p>
        <div>
          {product.warnings.length > 0 && (
            <aside className="terms-warning" aria-label="购买注意事项">
              <strong className="terms-warning-heading">购买前请注意</strong>
              <ul>
                {product.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </aside>
          )}
          <ol className="terms-list">
            {product.notes.map((n) => (
              <li key={n.title}>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <button type="button" className="primary-button" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  )
}
