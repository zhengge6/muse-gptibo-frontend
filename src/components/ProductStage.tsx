export function ProductStage({ productId }: { productId: 'muse' | 'gemini' }) {
  return (
    <section className="product-stage" aria-hidden="false">
      <div className="stage-halo" aria-hidden="true" />
      <div className="logo-composition">
        <div className={`hero-mark mark-muse${productId === 'muse' ? ' is-active' : ''}`} data-mark="muse">
          <div className="floating-mark">
            <img src="/assets/muse-logo.svg" alt="" draggable={false} />
          </div>
        </div>
        <div className={`hero-mark mark-gemini${productId === 'gemini' ? ' is-active' : ''}`} data-mark="gemini">
          <div className="gemini-orbit orbit-inner" aria-hidden="true">
            <i />
          </div>
          <div className="gemini-orbit orbit-outer" aria-hidden="true">
            <i />
          </div>
          <span className="gemini-spark spark-one" aria-hidden="true">
            ✦
          </span>
          <span className="gemini-spark spark-two" aria-hidden="true">
            ✦
          </span>
          <div className="floating-mark">
            <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="geminiGrad" x1="19" y1="118" x2="135" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2789f5" />
                  <stop offset=".34" stopColor="#567cee" />
                  <stop offset=".65" stopColor="#9673d9" />
                  <stop offset="1" stopColor="#d67da1" />
                </linearGradient>
              </defs>
              <path
                fill="url(#geminiGrad)"
                d="M80 5C90.5 48 112 69.5 155 80C112 90.5 90.5 112 80 155C69.5 112 48 90.5 5 80C48 69.5 69.5 48 80 5Z"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="stage-caption">
        <div className="stage-product-name">{productId === 'muse' ? 'Muse AI' : 'Gemini'}</div>
        <div className="stage-pagination" aria-hidden="true">
          <i className={productId === 'muse' ? 'active' : ''} />
          <i className={productId === 'gemini' ? 'active' : ''} />
        </div>
      </div>
    </section>
  )
}
