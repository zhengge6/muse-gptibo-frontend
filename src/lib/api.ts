import { DEFAULT_PRODUCTS, type Product } from './products'

/** 可配置 API 根；空字符串表示同源 /api（Vite 代理或反向代理） */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export class RequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, data?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    method: data === undefined ? 'GET' : 'POST',
    credentials: 'include',
    headers: data === undefined ? {} : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) {
    throw new RequestError(result?.error ?? '请求失败，请稍后重试。', res.status)
  }
  if (!result) throw new RequestError('服务返回异常，请稍后重试。', 503)
  return result as T
}

export type CatalogPlan = {
  id: string
  product_id: string
  name: string
  price_cents: number
  fee_cents?: number
  enabled: number | boolean
  version?: number
  purchase_note?: string
  delivery_instructions?: string
}

export type CatalogResponse = {
  plans: CatalogPlan[]
  mode?: string
  checkoutEnabled?: boolean
}

export type Order = {
  id: string
  plan: string
  plan_name: string
  price_cents: number
  fee_cents?: number
  status: string
  payment_status?: string
  customer_email?: string
  created_at: number
  payment?: {
    method?: string
    payUrl?: string | null
    qrContent?: string | null
    mock?: boolean
  } | null
}

/** 对齐 CoolkHz/gptibo：GET /api/catalog */
export async function fetchCatalog(): Promise<CatalogResponse> {
  return request<CatalogResponse>('/api/catalog')
}

/** 对齐 CoolkHz/gptibo：POST /api/orders */
export async function createOrder(input: {
  plan: string
  email: string
  key: string
  expectedPrice: number
}): Promise<{ order: Order }> {
  return request<{ order: Order }>('/api/orders', input)
}

/** 对齐 CoolkHz/gptibo：GET /api/orders */
export async function listOrders(): Promise<{ orders: Order[] }> {
  return request<{ orders: Order[] }>('/api/orders')
}

/** 将 catalog plans 合并进本地 Muse/Gemini 产品展示 */
export function mergeCatalog(plans: CatalogPlan[]): Record<'muse' | 'gemini', Product> {
  const next = structuredClone(DEFAULT_PRODUCTS)
  for (const key of ['muse', 'gemini'] as const) {
    const p = next[key]
    const plan =
      plans.find((x) => x.id === p.planId) ||
      plans.find((x) => x.product_id === key) ||
      plans.find((x) => x.id.toLowerCase().includes(key))
    if (!plan) continue
    p.planId = plan.id
    p.priceCents = plan.price_cents
    if (typeof plan.fee_cents === 'number') p.feeCents = plan.fee_cents
    p.available = Boolean(plan.enabled)
    if (plan.name) p.name = plan.name
    if (plan.delivery_instructions) p.delivery = plan.delivery_instructions
  }
  return next
}

export const errorMessage = (e: unknown) =>
  e instanceof RequestError ? e.message : '网络暂时不可用，请稍后重试。'
