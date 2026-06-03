import { PageFrame } from './ProductsPage'

export function LoginPage() {
  return (
    <PageFrame
      title="Login"
      description="Login will submit email and password to POST /api/auth/login and rely on HttpOnly cookies for the session."
    />
  )
}
