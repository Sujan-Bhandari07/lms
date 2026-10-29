import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

function messageFrom(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value !== 'object' || value === null || !('message' in value)) return undefined

  const message = value.message
  if (typeof message === 'string' && message.trim()) return message.trim()
  if (Array.isArray(message)) {
    const messages = message.filter((item): item is string => typeof item === 'string' && !!item.trim())
    if (messages.length) return messages.join(' ')
  }
  return undefined
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  if (typeof error !== 'object' || error === null || !('status' in error)) return false
  const { status } = error
  if (typeof status === 'number') return 'data' in error
  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || status === 'CUSTOM_ERROR') {
    return 'error' in error && typeof error.error === 'string'
  }
  return status === 'PARSING_ERROR'
    && 'error' in error && typeof error.error === 'string'
    && 'data' in error
    && 'originalStatus' in error && typeof error.originalStatus === 'number'
}

export function getApiErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'The request could not be completed. Please try again.'
  }

  if (typeof error.status === 'number') {
    return messageFrom(error.data) ?? `Request failed with status ${error.status}.`
  }

  switch (error.status) {
    case 'FETCH_ERROR':
      return 'Could not connect to the server. Check that the API gateway is running.'
    case 'PARSING_ERROR':
      return `The server returned an invalid response (HTTP ${error.originalStatus}).`
    case 'TIMEOUT_ERROR':
      return 'The request timed out. Please try again.'
    case 'CUSTOM_ERROR':
      return error.error || 'The request could not be completed.'
  }
}

export function getApiSuccessMessage(data: unknown, fallback: string): string {
  return messageFrom(data) ?? fallback
}

export function isApiFailure(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'success' in data && data.success === false
}
