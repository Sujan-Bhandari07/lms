'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import Avatar from './Avatar'
import { I } from './Icon'
import { useGetProfileQuery } from '@/src/services/api/Userapi'
import {
  acquireChatSocket,
  connectChatSocket,
  releaseChatSocket,
  type ChatSocket,
} from '@/src/services/chatSocket'
import type {
  ChatContact,
  ChatConversationSummary,
  ChatMessage,
  ChatSocketEvents,
  ChatSocketAck,
} from '@lms/shared/chat'

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'auth-error'
type Conversation = ChatConversationSummary & {
  contact: ChatContact
  online: boolean
}
type OpenConversation = {
  conversationId: string
  contact: ChatContact
  hasMore: boolean
  nextCursor: string | null
}

function emitWithAck<T>(
  send: (acknowledge: (response: ChatSocketAck<T>) => void) => void,
) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('The chat server did not respond. Please try again.')),
      15000,
    )
    send((response) => {
      window.clearTimeout(timer)
      if (!response.success) {
        reject(new Error(response.error?.message ?? 'The chat request failed.'))
      } else if (response.payload === undefined) {
        reject(new Error('The chat server returned an empty response.'))
      } else {
        resolve(response.payload)
      }
    })
  })
}

function messageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function dayKey(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dayLabel(value: string) {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(value) === dayKey(today.toISOString())) return 'Today'
  if (dayKey(value) === dayKey(yesterday.toISOString())) return 'Yesterday'
  return date.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function conversationTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (dayKey(value) === dayKey(new Date().toISOString())) {
    return messageTime(value)
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function Messenger({ role }: { role: 'student' | 'instructor' }) {
  const { data: profileResponse, isLoading: profileLoading, isError: profileError } =
    useGetProfileQuery()
  const profile = profileResponse?.payload
  const userId = profile?._id ?? ''
  const expectedRole = role === 'student' ? 'student' : 'tutor'
  const [socket, setSocket] = useState<ChatSocket | null>(null)
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeParticipantId, setActiveParticipantId] = useState('')
  const [activeConversation, setActiveConversation] = useState<OpenConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState('')
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false)
  const scrollArea = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const shouldScrollToBottom = useRef(true)
  const activeConversationRef = useRef<OpenConversation | null>(null)
  const activeParticipantRef = useRef('')
  const typingParticipantRef = useRef('')
  const pendingMessageRef = useRef<{ text: string; clientMessageId: string } | null>(null)

  activeConversationRef.current = activeConversation
  activeParticipantRef.current = activeParticipantId

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) =>
      conversation.contact.fullname.toLocaleLowerCase().includes(query),
    )
  }, [conversations, search])

  const selectedConversation = conversations.find(
    (conversation) => conversation.contact.userid === activeParticipantId,
  )

  useEffect(() => {
    if (!profile || profile.role !== expectedRole) return
    const chatSocket = acquireChatSocket()
    setSocket(chatSocket)
    setConnection(chatSocket.connected ? 'connected' : 'connecting')

    const refreshConversations = () => {
      void emitWithAck<{ conversations: Conversation[] }>((acknowledge) =>
        chatSocket.emit('chat:conversations:list', null, acknowledge),
      )
        .then(({ conversations: next }) => {
          setConversations(next)
          setError('')
          if (
            activeParticipantRef.current &&
            !next.some(
              (conversation) =>
                conversation.contact.userid === activeParticipantRef.current,
            )
          ) {
            setActiveParticipantId('')
            setActiveConversation(null)
            setMessages([])
            setMobileConversationOpen(false)
          }
        })
        .catch((requestError: unknown) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not load eligible conversations.',
          )
        })
    }

    const onConnect = () => {
      setConnection('connected')
      setError('')
      refreshConversations()
    }
    const onDisconnect = () => {
      typingParticipantRef.current = ''
      setTyping(false)
      setConnection('disconnected')
    }
    const onConnectError = (connectionError: Error) => {
      const unauthorized = connectionError.message.toLowerCase().includes('unauthorized')
      setConnection(unauthorized ? 'auth-error' : 'disconnected')
      setError(
        unauthorized
          ? 'Your session could not be verified. Sign in again to use messages.'
          : 'Chat connection lost. Reconnecting…',
      )
    }
    const onNewMessage = (message: ChatMessage) => {
      const participantId =
        userId === message.studentId ? message.instructorId : message.studentId
      const pairKey = `${message.studentId}:${message.instructorId}`
      const isActive = activeConversationRef.current?.conversationId === message.conversationId
      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.pairKey === pairKey
              ? {
                  ...conversation,
                  conversationId: message.conversationId,
                  latestMessage: message.text,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    message.senderId === userId || isActive
                      ? conversation.unreadCount
                      : conversation.unreadCount + 1,
                }
              : conversation,
          )
          .sort(
            (left, right) =>
              new Date(right.lastMessageAt ?? 0).getTime() -
              new Date(left.lastMessageAt ?? 0).getTime(),
          ),
      )
      if (isActive) {
        setMessages((current) =>
          current.some((existing) => existing.id === message.id)
            ? current
            : [...current, message],
        )
        if (message.senderId !== userId) {
          void emitWithAck<{ conversationId: string; unreadCount: number }>(
            (acknowledge) =>
              chatSocket.emit(
                'chat:messages:read',
                { participantId },
                acknowledge,
              ),
          ).catch((requestError: unknown) => {
            setError(
              requestError instanceof Error
                ? requestError.message
                : 'Could not mark messages as read.',
            )
          })
        }
      }
    }
    const onConversationUpdated = (
      update: ChatSocketEvents['chat:conversation:updated'],
    ) => {
      setConversations((current) =>
        current
          .map((conversation) =>
            conversation.pairKey === update.pairKey
              ? {
                  ...conversation,
                  conversationId: conversation.conversationId,
                  latestMessage: update.latestMessage,
                  lastMessageAt: update.lastMessageAt,
                  unreadCount: update.unreadCount,
                }
              : conversation,
          )
          .sort(
            (left, right) =>
              new Date(right.lastMessageAt ?? 0).getTime() -
              new Date(left.lastMessageAt ?? 0).getTime(),
          ),
      )
    }
    const onRead = (update: ChatSocketEvents['chat:conversation:read']) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversationId === update.conversationId
            ? { ...conversation, unreadCount: update.unreadCount }
            : conversation,
        ),
      )
    }
    const onTyping = (update: ChatSocketEvents['chat:typing']) => {
      if (update.participantId === activeParticipantRef.current) {
        setTyping(update.typing)
      }
    }
    const onPresence = (update: ChatSocketEvents['chat:presence']) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.contact.userid === update.participantId
            ? { ...conversation, online: update.online }
            : conversation,
        ),
      )
    }
    const onSessionInvalid = () => {
      setConnection('auth-error')
      setError('Your session expired. Sign in again to continue chatting.')
    }
    const onServerError = (serverError: ChatSocketEvents['chat:error']) => {
      setError(serverError.message)
    }

    chatSocket.on('connect', onConnect)
    chatSocket.on('disconnect', onDisconnect)
    chatSocket.on('connect_error', onConnectError)
    chatSocket.on('chat:message:new', onNewMessage)
    chatSocket.on('chat:conversation:updated', onConversationUpdated)
    chatSocket.on('chat:conversation:read', onRead)
    chatSocket.on('chat:typing', onTyping)
    chatSocket.on('chat:presence', onPresence)
    chatSocket.on('chat:session:invalid', onSessionInvalid)
    chatSocket.on('chat:error', onServerError)
    if (chatSocket.connected) onConnect()
    else connectChatSocket(chatSocket)

    return () => {
      chatSocket.off('connect', onConnect)
      chatSocket.off('disconnect', onDisconnect)
      chatSocket.off('connect_error', onConnectError)
      chatSocket.off('chat:message:new', onNewMessage)
      chatSocket.off('chat:conversation:updated', onConversationUpdated)
      chatSocket.off('chat:conversation:read', onRead)
      chatSocket.off('chat:typing', onTyping)
      chatSocket.off('chat:presence', onPresence)
      chatSocket.off('chat:session:invalid', onSessionInvalid)
      chatSocket.off('chat:error', onServerError)
      releaseChatSocket(chatSocket)
    }
  }, [expectedRole, profile, userId])

  useEffect(() => {
    if (!socket?.connected || !activeParticipantId || connection !== 'connected') return
    let active = true
    setActiveConversation(null)
    setMessages([])
    setHasMore(false)
    setTyping(false)
    setError('')
    shouldScrollToBottom.current = true
    void emitWithAck<{
      conversationId: string
      contact: ChatContact
      messages: ChatMessage[]
      hasMore: boolean
      nextCursor: string | null
    }>((acknowledge) =>
      socket.emit(
        'chat:conversation:open',
        { participantId: activeParticipantId },
        acknowledge,
      ),
    )
      .then((result) => {
        if (!active) return
        setActiveConversation({
          conversationId: result.conversationId,
          contact: result.contact,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
        })
        setMessages(result.messages)
        setHasMore(result.hasMore)
        setConversations((current) =>
          current.map((conversation) =>
            conversation.contact.userid === activeParticipantId
              ? {
                  ...conversation,
                  conversationId: result.conversationId,
                  unreadCount: 0,
                }
              : conversation,
          ),
        )
        setMobileConversationOpen(true)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not open this conversation.',
          )
        }
      })
    return () => {
      active = false
    }
  }, [activeParticipantId, connection, socket, userId])

  useEffect(() => {
    if (shouldScrollToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  useEffect(() => {
    if (
      !socket ||
      !activeConversation ||
      !activeParticipantId ||
      connection !== 'connected'
    ) return
    const emitTyping = (participantId: string, typingNow: boolean) =>
      emitWithAck<{ sent: boolean }>((acknowledge) =>
        socket.emit(
          typingNow ? 'chat:typing:start' : 'chat:typing:stop',
          { participantId },
          acknowledge,
        ),
      )
    if (
      typingParticipantRef.current &&
      typingParticipantRef.current !== activeParticipantId
    ) {
      const previousParticipantId = typingParticipantRef.current
      typingParticipantRef.current = ''
      void emitTyping(previousParticipantId, false)
        .catch((requestError: unknown) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not stop the typing indicator.',
          )
        })
    }
    if (!draft.trim()) {
      if (!typingParticipantRef.current) return
      void emitTyping(activeParticipantId, false)
        .then(() => {
          typingParticipantRef.current = ''
        })
        .catch((requestError: unknown) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not stop the typing indicator.',
          )
        })
      return
    }
    const startTimer = window.setTimeout(() => {
      void emitTyping(activeParticipantId, true)
        .then(() => {
          typingParticipantRef.current = activeParticipantId
        })
        .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not send typing status.',
        )
      })
    }, 350)
    const stopTimer = window.setTimeout(() => {
      void emitTyping(activeParticipantId, false)
        .then(() => {
          typingParticipantRef.current = ''
        })
        .catch((requestError: unknown) => {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not stop the typing indicator.',
          )
        })
    }, 1400)
    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(stopTimer)
    }
  }, [activeConversation, activeParticipantId, connection, draft, socket])

  async function loadEarlierMessages() {
    if (!socket || !activeParticipantId || !messages.length || loadingHistory) return
    setLoadingHistory(true)
    shouldScrollToBottom.current = false
    try {
      const result = await emitWithAck<{
        conversationId: string
        messages: ChatMessage[]
        hasMore: boolean
        nextCursor: string | null
      }>((acknowledge) =>
        socket.emit(
          'chat:messages:history',
          {
            participantId: activeParticipantId,
            before: activeConversation?.nextCursor ?? messages[0].id,
            limit: 30,
          },
          acknowledge,
        ),
      )
      setMessages((current) => [
        ...result.messages.filter(
          (message) => !current.some((item) => item.id === message.id),
        ),
        ...current,
      ])
      setHasMore(result.hasMore)
      setActiveConversation((current) =>
        current
          ? {
              ...current,
              hasMore: result.hasMore,
              nextCursor: result.nextCursor,
            }
          : current,
      )
      setError('')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load earlier messages.',
      )
    } finally {
      setLoadingHistory(false)
    }
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    if (
      !socket ||
      !activeConversation ||
      !activeParticipantId ||
      !draft.trim() ||
      sending
    ) return
    const text = draft.trim()
    const pending =
      pendingMessageRef.current?.text === text
        ? pendingMessageRef.current
        : { text, clientMessageId: crypto.randomUUID() }
    pendingMessageRef.current = pending
    setSending(true)
    setError('')
    try {
      const result = await emitWithAck<{
        message: ChatMessage
        unreadCount: number
      }>((acknowledge) =>
        socket.emit(
          'chat:message:send',
          {
            participantId: activeParticipantId,
            clientMessageId: pending.clientMessageId,
            text,
          },
          acknowledge,
        ),
      )
      setDraft('')
      pendingMessageRef.current = null
      shouldScrollToBottom.current = true
      setMessages((current) =>
        current.some((message) => message.id === result.message.id)
          ? current
          : [...current, result.message],
      )
      setTyping(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Message could not be sent. Please retry.',
      )
    } finally {
      setSending(false)
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  function selectConversation(participantId: string) {
    setDraft('')
    setActiveParticipantId(participantId)
    setMobileConversationOpen(true)
  }

  if (profileLoading) {
    return <main className="grid min-h-[60vh] place-items-center text-sm text-muted">Loading messages…</main>
  }
  if (profileError || !profile || profile.role !== expectedRole) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-5">
        <p className="max-w-md text-center text-sm text-error" role="alert">
          Your account could not be verified for this messaging workspace. Refresh the page or sign in again.
        </p>
      </main>
    )
  }

  return (
    <main className="grid h-[calc(100dvh-4rem)] min-h-[420px] grid-cols-1 overflow-hidden bg-page md:h-dvh md:grid-cols-[320px_minmax(0,1fr)]">
      <aside
        className={`${mobileConversationOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-col border-r border-line bg-page`}
        aria-label="Conversation list"
      >
        <header className="border-b border-line p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="t-h3 !text-[22px]">Messages</h1>
              <p className="mt-1 text-xs capitalize text-muted">{role} workspace</p>
            </div>
            <span
              className={`bdg ${connection === 'connected' ? 'bdg-gold' : 'bdg-muted'}`}
              role="status"
            >
              {connection === 'connected'
                ? 'Connected'
                : connection === 'auth-error'
                  ? 'Sign in required'
                  : connection === 'connecting'
                    ? 'Connecting'
                    : 'Reconnecting'}
            </span>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5">
            <I n="search" c="size-4 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              type="button"
              key={conversation.pairKey}
              onClick={() => selectConversation(conversation.contact.userid)}
              aria-current={
                conversation.contact.userid === activeParticipantId ? 'true' : undefined
              }
              className={`flex w-full items-center gap-3 border-b border-line px-4 py-4 text-left transition hover:bg-surface ${
                conversation.contact.userid === activeParticipantId ? 'bg-surface' : ''
              }`}
            >
              <div className="relative">
                <Avatar
                  name={conversation.contact.fullname}
                  profilepic={conversation.contact.profilepic}
                  className="size-11 text-sm"
                  ring={false}
                />
                <span
                  className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-page ${
                    conversation.online ? 'bg-success' : 'bg-muted/50'
                  }`}
                  aria-label={conversation.online ? 'Online' : 'Offline'}
                />
              </div>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {conversation.contact.fullname}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {conversationTime(conversation.lastMessageAt)}
                  </span>
                </span>
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted">
                    {conversation.latestMessage ||
                      conversation.contact.courses.map((course) => course.coursename).join(', ')}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span
                      className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink"
                      aria-label={`${conversation.unreadCount} unread messages`}
                    >
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))}
          {!filteredConversations.length && (
            <div className="grid min-h-52 content-center justify-items-center px-6 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
                <I n="msg" />
              </span>
              <h2 className="t-h4 mt-4 !text-base">
                {search ? 'No matching conversations' : 'No eligible conversations yet'}
              </h2>
              <p className="mt-1 max-w-[240px] text-sm leading-6 text-muted">
                {search
                  ? 'Try another name.'
                  : role === 'student'
                    ? 'Your instructors appear here when you are enrolled in one of their courses.'
                    : 'Students enrolled in one of your courses will appear here.'}
              </p>
            </div>
          )}
        </div>
      </aside>

      <section
        className={`${mobileConversationOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-col bg-page`}
        aria-label="Message conversation"
      >
        {selectedConversation ? (
          <>
            <header className="flex min-h-[72px] items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
              <button
                type="button"
                className="btn btn-s !px-3 md:hidden"
                onClick={() => setMobileConversationOpen(false)}
              >
                Back
              </button>
              <Avatar
                name={selectedConversation.contact.fullname}
                profilepic={selectedConversation.contact.profilepic}
                className="size-10 text-sm"
                ring={false}
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold">
                  {selectedConversation.contact.fullname}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {selectedConversation.contact.courses
                    .map((course) => course.coursename)
                    .join(' · ')}
                  {selectedConversation.online ? ' · Online' : ''}
                </p>
              </div>
              <span className="hidden text-xs text-muted sm:inline">
                {connection === 'connected' ? 'Live chat' : 'Reconnecting…'}
              </span>
            </header>

            <div
              ref={scrollArea}
              onScroll={(event) => {
                const element = event.currentTarget
                shouldScrollToBottom.current =
                  element.scrollHeight - element.scrollTop - element.clientHeight < 120
              }}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8"
              aria-live="polite"
            >
              {hasMore && (
                <div className="mb-5 text-center">
                  <button
                    type="button"
                    className="btn btn-s !py-2 text-xs"
                    disabled={loadingHistory}
                    onClick={() => void loadEarlierMessages()}
                  >
                    {loadingHistory ? 'Loading…' : 'Load earlier messages'}
                  </button>
                </div>
              )}
              {messages.map((message, index) => {
                const previous = messages[index - 1]
                const isMine = message.senderId === userId
                return (
                  <div key={message.id}>
                    {(!previous || dayKey(previous.createdAt) !== dayKey(message.createdAt)) && (
                      <div className="my-5 flex items-center gap-3 text-[11px] text-muted">
                        <span className="h-px flex-1 bg-line" />
                        <span>{dayLabel(message.createdAt)}</span>
                        <span className="h-px flex-1 bg-line" />
                      </div>
                    )}
                    <div className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[min(82%,620px)] rounded-2xl px-4 py-3 ${
                          isMine
                            ? 'rounded-br-sm bg-gold-tint text-ink'
                            : 'rounded-bl-sm border border-line bg-surface text-ink'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.text}
                        </p>
                        <time
                          dateTime={message.createdAt}
                          className={`mt-1 block text-right text-[10px] ${
                            isMine ? 'text-ink/60' : 'text-muted'
                          }`}
                        >
                          {messageTime(message.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                )
              })}
              {typing && (
                <p className="mb-3 text-xs text-muted" role="status">
                  {selectedConversation.contact.fullname} is typing…
                </p>
              )}
              {activeConversation && messages.length === 0 && (
                <p className="py-12 text-center text-sm text-muted">
                  Start a conversation about {selectedConversation.contact.courses[0]?.coursename}.
                </p>
              )}
              {!activeConversation && !error && (
                <p className="py-12 text-center text-sm text-muted" role="status">
                  Opening conversation…
                </p>
              )}
              {error && (
                <p className="mx-auto my-3 max-w-xl rounded-card border border-error/30 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {error}
                </p>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={(event) => void sendMessage(event)} className="border-t border-line p-4 sm:p-5">
              <div className="mx-auto flex max-w-[900px] items-end gap-3 rounded-card border border-line bg-surface p-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                  maxLength={4000}
                  rows={1}
                  disabled={connection !== 'connected' || sending || !activeConversation}
                  aria-label="Write a message"
                  placeholder="Write a message…"
                  className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-2 py-3 text-sm leading-5 outline-none placeholder:text-muted disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={
                    !draft.trim() ||
                    sending ||
                    connection !== 'connected' ||
                    !activeConversation
                  }
                  className="btn btn-p size-11 shrink-0 !px-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  {sending ? <span className="animate-pulse">…</span> : <I n="send" c="s" />}
                </button>
              </div>
              <p className="mx-auto mt-2 max-w-[900px] text-[11px] text-muted">
                Enter to send · Shift+Enter for a new line
              </p>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface text-muted">
              <I n="msg" c="l" />
            </span>
            <h2 className="t-h3 mt-5">Choose a conversation</h2>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-muted">
              Select an eligible {role === 'student' ? 'instructor' : 'student'} to view messages and course context.
            </p>
            {error && (
              <p className="mt-4 text-sm text-error" role="alert">{error}</p>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
