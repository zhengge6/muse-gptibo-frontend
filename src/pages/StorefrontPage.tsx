import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckoutCard } from '../components/CheckoutCard'
import { ProductStage } from '../components/ProductStage'
import { SiteFooter, SiteHeader } from '../components/SiteHeader'
import { TermsDialog } from '../components/TermsDialog'
import { ToastHost } from '../components/Toast'
import {
  createOrder,
  errorMessage,
  fetchCatalog,
  mergeCatalog,
} from '../lib/api'
import { DEFAULT_PRODUCTS, yuan, type Product } from '../lib/products'

function productFromHash(hash: string): 'muse' | 'gemini' {
  return hash.replace(/^#/, '') === 'gemini' ? 'gemini' : 'muse'
}

export function StorefrontPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [productId, setProductId] = useState<'muse' | 'gemini'>(() =>
    productFromHash(location.hash),
  )
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [agreeError, setAgreeError] = useState('')
  const [termsOpen, setTermsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])

  const product: Product = products[productId]

  const toast = useCallback((text: string) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), text }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const selectProduct = useCallback(
    (id: 'muse' | 'gemini') => {
      setProductId(id)
      setEmailError('')
      setAgreeError('')
      navigate({ pathname: '/', hash: id === 'muse' ? '' : id }, { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    const id = productFromHash(location.hash)
    setProductId(id)
  }, [location.hash])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTermsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchCatalog()
      .then((res) => {
        if (cancelled) return
        setProducts(mergeCatalog(res.plans || []))
      })
      .catch(() => {
        /* 无后端时保留本地默认目录 */
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function onConfirm() {
    if (!product.available) {
      toast('该商品暂不可购买')
      return
    }
    const trimmed = email.trim()
    let ok = true
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError(trimmed ? '请填写有效的邮箱地址' : '请填写收件邮箱')
      ok = false
    } else {
      setEmailError('')
    }
    if (!agreed) {
      setAgreeError('请先阅读并同意购买须知')
      ok = false
    } else {
      setAgreeError('')
    }
    if (!ok) return

    setSubmitting(true)
    try {
      const { order } = await createOrder({
        plan: product.planId,
        email: trimmed,
        key: crypto.randomUUID(),
        expectedPrice: product.priceCents,
      })
      const fee = order.fee_cents ?? product.feeCents
      const total = order.price_cents + fee
      if (order.payment?.payUrl) {
        toast(`订单 ${order.id} 已创建，正在跳转支付…`)
        window.setTimeout(() => {
          window.location.href = order.payment!.payUrl!
        }, 400)
      } else {
        toast(
          `订单 ${order.id} 已创建 · ¥${yuan(total)}${order.payment?.mock ? '（模拟支付）' : ''}`,
        )
      }
    } catch (e) {
      toast(errorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`storefront ${product.theme}`}>
      <SiteHeader productId={productId} onSelect={selectProduct} />
      <main id="product-panel" className="product-layout" role="tabpanel">
        <ProductStage productId={productId} />
        <CheckoutCard
          product={product}
          email={email}
          agreed={agreed}
          emailError={emailError}
          agreeError={agreeError}
          submitting={submitting}
          onEmailChange={(v) => {
            setEmail(v)
            setEmailError('')
          }}
          onAgreeChange={(v) => {
            setAgreed(v)
            if (v) setAgreeError('')
          }}
          onOpenTerms={() => setTermsOpen(true)}
          onConfirm={() => void onConfirm()}
        />
      </main>
      <SiteFooter />
      <TermsDialog open={termsOpen} product={product} onClose={() => setTermsOpen(false)} />
      <ToastHost messages={toasts} onDismiss={dismissToast} />
    </div>
  )
}
