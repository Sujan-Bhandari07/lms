'use client'

import { io, Socket } from 'socket.io-client'
import type {
  ChatClientToServerEvents,
  ChatServerToClientEvents,
} from '@lms/shared/chat'

export type ChatSocket = Socket<
  ChatServerToClientEvents,
  ChatClientToServerEvents
>

let sharedSocket: ChatSocket | null = null
let activeConsumers = 0

function socketUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL?.trim()
  if (configuredUrl) return configuredUrl

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000/api'
  return backendUrl.replace(/\/api\/?$/, '')
}

export function acquireChatSocket() {
  if (typeof window === 'undefined') {
    throw new Error('Chat sockets can only be opened in the browser.')
  }
  if (!sharedSocket) {
    sharedSocket = io(socketUrl(), {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
    })
  }
  activeConsumers += 1
  return sharedSocket
}

export function connectChatSocket(socket: ChatSocket) {
  if (socket === sharedSocket && !socket.connected) socket.connect()
}

export function releaseChatSocket(socket: ChatSocket) {
  if (socket !== sharedSocket) return
  activeConsumers = Math.max(0, activeConsumers - 1)
  if (activeConsumers === 0) socket.disconnect()
}
