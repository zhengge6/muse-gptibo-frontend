import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { OrdersPage } from './pages/OrdersPage'
import { StorefrontPage } from './pages/StorefrontPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
