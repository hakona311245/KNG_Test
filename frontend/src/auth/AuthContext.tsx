import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  authApi,
  type LoginPayload,
  type RegisterCustomerPayload,
} from '../api/authApi'
import { toApiError } from '../lib/api'
import type { ApiError, User } from '../types/api'
import { AuthContext, type AuthContextValue } from './authContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [authError, setAuthError] = useState<ApiError | null>(null)

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
      setAuthError(null)
      return currentUser
    } catch (error) {
      const apiError = toApiError(error)
      setUser(null)
      setAuthError(apiError)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      try {
        const currentUser = await authApi.me()

        if (isMounted) {
          setUser(currentUser)
          setAuthError(null)
        }
      } catch (error) {
        if (isMounted) {
          setUser(null)
          setAuthError(toApiError(error))
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [])

  const register = useCallback(async (payload: RegisterCustomerPayload) => {
    const registeredUser = await authApi.register(payload)
    setAuthError(null)
    return registeredUser
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload)
    setUser(response.user)
    setAuthError(null)
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
      setAuthError(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: user !== null,
      isAdmin: user?.role === 'ADMIN',
      authError,
      clearAuthError,
      refreshCurrentUser,
      register,
      login,
      logout,
    }),
    [
      authError,
      clearAuthError,
      isBootstrapping,
      login,
      logout,
      refreshCurrentUser,
      register,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
