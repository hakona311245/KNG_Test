import axios, { AxiosError, type AxiosResponse } from 'axios'
import type { ApiError, ApiResponse } from '../types/api'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

type BackendErrorPayload = {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export async function unwrapData<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
) {
  try {
    const response = await request
    return response.data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined
    const message = data?.message

    return {
      message: Array.isArray(message)
        ? message.join(', ')
        : message ?? error.message,
      statusCode: data?.statusCode ?? error.response?.status,
      error: data?.error,
      details: Array.isArray(message) ? message : undefined,
    }
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: 'Unexpected API error.' }
}
