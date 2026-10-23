export type ProductNote = { title: string; body: string }

export type Product = {
  id: 'muse' | 'gemini'
  /** catalog plan id used when calling gptibo-compatible APIs */
  planId: string
  name: string
  label: string
  unit: string
  priceCents: number
  feeCents: number
  delivery: string
  available: boolean
  theme: 'theme-muse' | 'theme-gemini'
  notes: ProductNote[]
  warnings: string[]
}

/** 本地默认目录；有 API 时会被 /api/catalog 覆盖价格与可用性 */
export const DEFAULT_PRODUCTS: Record<'muse' | 'gemini', Product> = {
  muse: {
    id: 'muse',
    planId: 'muse-account',
    name: 'Muse AI',
    label: '成品账号',
    unit: '1 Billion',
    priceCents: 1200,
    feeCents: 17,
    delivery: '账号资料发送至邮箱',
    available: true,
    theme: 'theme-muse',
    notes: [
      { title: '仅质保首次登录', body: '不提供后续使用质保。首次登录有问题，请保留订单号和截图联系支持。' },
      { title: '交付邮箱与接码链接', body: '账号邮箱和接码链接发送至收件邮箱，通过接码链接获取登录验证码。' },
      { title: '登录后立即更换邮箱', body: '首次登录成功后，请立即在 Muse 内更换为自己的邮箱，并删除旧邮箱。' },
    ],
    warnings: [],
  },
  gemini: {
    id: 'gemini',
    planId: 'gemini-pro-18m',
    name: 'Gemini Ai Pro',
    label: '18 个月会员',
    unit: '会员订阅',
    priceCents: 1990,
    feeCents: 0,
    delivery: '领取链接发送至邮箱',
    available: false,
    theme: 'theme-gemini',
    notes: [
      { title: '需自行领取', body: '通过邮件中的领取链接按指引操作，付款后不会自动开通会员。' },
      { title: '核对 Google 账号', body: '领取前确认账号，完成后登录对应账号查看会员状态。' },
      { title: '确认收件邮箱', body: '请填写可正常收件的邮箱，并检查垃圾邮件。' },
    ],
    warnings: [
      '已开通 Gemini AI Pro 的账号无法领取。',
      '美国等发达国家的代理节点无法领取，请尝试台湾、韩国、香港等地区的节点。',
      '会员可能不定期失效，购买前请注意。',
      '发货后请及时兑换；除链接失效问题外，概不退款。',
    ],
  },
}

export function yuan(cents: number): string {
  return (cents / 100).toFixed(2)
}
