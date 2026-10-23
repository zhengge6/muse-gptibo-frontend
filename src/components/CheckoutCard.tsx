import type { Product } from '../lib/products'
import { yuan } from '../lib/products'

export function CheckoutCard({
  product,
  email,
  agreed,
  emailError,
  agreeError,
  submitting,
  onEmailChange,
  onAgreeChange,
  onOpenTerms,
  onConfirm,
}: {
  product: Product
  email: string
  agreed: boolean
  emailError: string
  agreeError: string
  submitting: boolean
  onEmailChange: (v: string) => void
  onAgreeChange: (v: boolean) => void
  onOpenTerms: () => void
  onConfirm: () => void
}) {
  const total = product.priceCents + product.feeCents
  return (
    <aside className="checkout-card" aria-label="下单信息">
      <div className="product-heading">
        <h1>{product.name}</h1>
        <p className="product-subtitle">{product.label}</p>
      </div>

      <div className="selected-plan" aria-label="已选套餐">
        <div className="plan-description">
          <span className="selected-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div>
            <strong>{product.label}</strong>
            <span>{product.unit}</span>
          </div>
        </div>
        <div className="plan-price">
          <span>¥</span>
          <span>{yuan(product.priceCents)}</span>
          <small>一次购买</small>
        </div>
      </div>

      <div className="email-field">
        <label htmlFor="customer-email">收件邮箱</label>
        <div className={`input-wrap${emailError ? ' has-error' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            id="customer-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>
        <p className="field-hint">{product.delivery}</p>
        {emailError ? <p className="field-error">{emailError}</p> : null}
      </div>

      <div className="payment-row">
        <span>支付方式</span>
        <span className="payment-option">
          <span className="alipay-mark" aria-hidden="true">
            支
          </span>
          支付宝
        </span>
      </div>

      <div className="details-agreement">
        <div className="details-agreement-line">
          <label className={`agreement${agreeError ? ' has-error' : ''}`}>
            <input type="checkbox" checked={agreed} onChange={(e) => onAgreeChange(e.target.checked)} />
            <span className="checkbox-art" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span>我已阅读并同意</span>
          </label>
          <button type="button" className="terms-link" onClick={onOpenTerms}>
            购买须知
          </button>
        </div>
        {agreeError ? <p className="field-error">{agreeError}</p> : null}
      </div>

      <div className="order-total">
        <span>
          合计
          {product.feeCents > 0 ? <small>含 ¥{yuan(product.feeCents)} 手续费</small> : null}
        </span>
        <strong>
          <span>¥</span>
          <span>{yuan(total)}</span>
        </strong>
      </div>

      <button
        type="button"
        className="primary-button"
        disabled={!product.available || submitting}
        onClick={onConfirm}
      >
        <span>{!product.available ? '暂不可购买' : submitting ? '提交中…' : '确认订单'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </aside>
  )
}
