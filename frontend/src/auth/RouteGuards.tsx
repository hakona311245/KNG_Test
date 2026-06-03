import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function GuardLoadingState() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-zinc-600 sm:px-6 lg:px-8">
      Loading session...
    </div>
  )
}

export function CustomerRouteGuard() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <GuardLoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function AdminRouteGuard() {
  const { isAdmin, isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <GuardLoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/products" replace />
  }

  return <Outlet />
}
