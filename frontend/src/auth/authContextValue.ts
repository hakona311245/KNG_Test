import { createContext } from 'react'
import type {
  LoginPayload,
  RegisterCustomerPayload,
} from '../api/authApi'
import type { ApiError, User } from '../types/api'

export type AuthContextValue = {
  user: User | null
  isBootstrapping: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  authError: ApiError | null
  clearAuthError: () => void
  refreshCurrentUser: () => Promise<User | null>
  register: (payload: RegisterCustomerPayload) => Promise<User>
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
