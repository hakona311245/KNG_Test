import { api, unwrapData } from '../lib/api'
import type { User } from '../types/api'

export type RegisterCustomerPayload = {
  email: string
  fullName: string
  password: string
  phoneNumber: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthUserResponse = {
  user: User
}

export const authApi = {
  register(payload: RegisterCustomerPayload) {
    return unwrapData<User>(api.post('/auth/register', payload))
  },

  login(payload: LoginPayload) {
    return unwrapData<AuthUserResponse>(api.post('/auth/login', payload))
  },

  refresh() {
    return unwrapData<AuthUserResponse>(api.post('/auth/refresh'))
  },

  logout() {
    return unwrapData<null>(api.post('/auth/logout'))
  },

  me() {
    return unwrapData<User>(api.get('/auth/me'))
  },
}
