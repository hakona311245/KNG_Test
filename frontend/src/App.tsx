import { Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import {
  AdminRouteGuard,
  AuthenticatedRouteGuard,
  CustomerRouteGuard,
} from './auth/RouteGuards'
import { AdminDashboardPage } from './routes/AdminDashboardPage'
import { CartPage } from './routes/CartPage'
import { CheckoutPage } from './routes/CheckoutPage'
import { HomePage } from './routes/HomePage'
import { LoginPage } from './routes/LoginPage'
import { NotFoundPage } from './routes/NotFoundPage'
import { ProductDetailPage } from './routes/ProductDetailPage'
import { ProfilePage } from './routes/ProfilePage'
import { ProductsPage } from './routes/ProductsPage'
import { RegisterPage } from './routes/RegisterPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route element={<AuthenticatedRouteGuard />}>
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route element={<CustomerRouteGuard />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<AdminRouteGuard />}>
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
