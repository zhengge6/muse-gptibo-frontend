import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteHeader'
import { errorMessage, listOrders, type Order } from '../lib/api'
import { yuan } from '../lib/products'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.orders || [])
      })
      .catch((e) => {
        if (!cancelled) {
          setOrders([])
          setError(errorMessage(e))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="storefront theme-muse">
      <SiteHeader showSwitch={false} rightTo="/" rightLabel="返回商店" />
      <div className="orders-page">
        <h1>我的订单</h1>
        <p className="lead">
          通过浏览器会话查询近期订单。未接入后端时显示空状态；接入 CoolkHz/gptibo 兼容 API 后自动列出。
        </p>
        {error ? <p className="field-error" style={{ display: 'block' }}>{error}</p> : null}
        {orders === null ? (
          <p className="lead">正在加载…</p>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3>暂无订单</h3>
            <Link className="primary-button" to="/">
              去选购
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <ul className="order-list" style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'grid', gap: 12 }}>
            {orders.map((o) => (
              <li
                key={o.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e4e6ea',
                  borderRadius: 16,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <strong>{o.plan_name || o.plan}</strong>
                  <span>¥{yuan(o.price_cents + (o.fee_cents || 0))}</span>
                </div>
                <div style={{ color: '#6b7280', marginTop: 6, fontSize: 13 }}>
                  {o.id} · {o.status}
                  {o.customer_email ? ` · ${o.customer_email}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
