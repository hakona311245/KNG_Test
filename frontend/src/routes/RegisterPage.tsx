import { PageFrame } from '../components/PageFrame'

export function RegisterPage() {
  return (
    <PageFrame
      title="Register"
      description="Registration will collect email, full name, password, and phone number for POST /api/auth/register."
    />
  )
}
