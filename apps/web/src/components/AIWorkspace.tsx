'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { I } from './Icon'
import { Logo } from './Header'
import Avatar from './Avatar'
import {
  AiChatMessage,
  useGetAiConversationsQuery,
  useGetAiMessagesQuery,
  useGetProfileQuery,
  useSendAiChatMutation,
} from '@/src/services/api/Userapi'

const SUGGESTIONS = [
  {
    title: 'Explain a difficult concept',
    desc: 'Break down complex programming or science concepts step by step',
    prompt: 'Explain how asynchronous programming and event loops work in simple terms.',
  },
  {
    title: 'Help me build a study plan',
    desc: 'Generate a structured week-by-week learning roadmap',
    prompt: 'Create a 4-week study plan to master backend development with NestJS and TypeScript.',
  },
  {
    title: 'Recommend courses on Ujyalo',
    desc: 'Find the best course in the catalog for your goals',
    prompt: 'What courses are available on Ujyalo for backend development and programming?',
  },
  {
    title: 'Test my knowledge with a quiz',
    desc: 'Create practice questions with explanations',
    prompt: 'Give me a 3-question quiz on database indexing and explain the correct answers.',
  },
]

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function MarkdownContent({ text }: { text: string }) {
  const parts = useMemo(() => {
    // Split on code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
    const chunks: { type: 'text' | 'code'; content: string; lang?: string }[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        chunks.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }
      chunks.push({ type: 'code', content: match[2].trim(), lang: match[1] || 'code' })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
      chunks.push({ type: 'text', content: text.slice(lastIndex) })
    }
    return chunks
  }, [text])

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {parts.map((chunk, idx) => {
        if (chunk.type === 'code') {
          return (
            <div key={idx} className="my-3 overflow-hidden rounded-ui border border-line bg-page text-xs">
              <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-muted">
                <span className="font-mono text-[11px] uppercase">{chunk.lang}</span>
              </div>
              <pre className="overflow-x-auto p-3 font-mono leading-normal text-ink">
                <code>{chunk.content}</code>
              </pre>
            </div>
          )
        }

        // Render paragraphs and lists
        const paragraphs = chunk.content.split(/\n\n+/)
        return (
          <div key={idx} className="space-y-2">
            {paragraphs.map((paragraph, pIdx) => {
              const lines = paragraph.split('\n')
              const isList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s/.test(line.trim()))

              if (isList) {
                return (
                  <ul key={pIdx} className="list-disc space-y-1 pl-5">
                    {lines.map((line, lIdx) => {
                      const clean = line.replace(/^[-*]\s+|\d+\.\s+/, '')
                      return (
                        <li key={lIdx}>
                          <FormattedInline text={clean} />
                        </li>
                      )
                    })}
                  </ul>
                )
              }

              return (
                <p key={pIdx} className="whitespace-pre-wrap">
                  <FormattedInline text={paragraph} />
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function FormattedInline({ text }: { text: string }) {
  // Handle bold and inline code
  const tokens = useMemo(() => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g
    return text.split(regex).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[12px] text-gold-deep">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }, [text])

  return <>{tokens}</>
}

export default function AIWorkspace() {
  const { data: profileData } = useGetProfileQuery()
  const profile = profileData?.payload
  const { data: convData, isLoading: convsLoading, refetch: refetchConvs } = useGetAiConversationsQuery()
  const conversations = convData?.payload ?? []

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [sendChat] = useSendAiChatMutation()

  const { data: messagesData, isLoading: messagesLoading } = useGetAiMessagesQuery(
    { conversationId: activeConvId! },
    { skip: !activeConvId },
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync messages when query updates
  useEffect(() => {
    if (messagesData?.payload?.messages) {
      setMessages(messagesData.payload.messages)
    }
  }, [messagesData])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [prompt])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId),
    [conversations, activeConvId],
  )

  const startNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    setError(null)
    setSidebarOpen(false)
  }

  const handleSelectConv = (id: string) => {
    setActiveConvId(id)
    setError(null)
    setSidebarOpen(false)
  }

  const handleSubmit = async (overridePrompt?: string) => {
    const textToSend = (overridePrompt ?? prompt).trim()
    if (!textToSend || sending) return

    setPrompt('')
    setError(null)
    setSending(true)

    // Optimistically add user message
    const tempUserMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId ?? '',
      role: 'user',
      text: textToSend,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const response = await sendChat({
        conversationId: activeConvId ?? undefined,
        text: textToSend,
      }).unwrap()

      if (response?.payload) {
        const { conversation, userMessage, assistantMessage } = response.payload
        if (!activeConvId) {
          setActiveConvId(conversation.id)
        }
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id),
          userMessage,
          assistantMessage,
        ])
        void refetchConvs()
      }
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message || 'Failed to generate answer.'
          : 'Could not connect to the AI assistant. Please try again.'
      setError(msg)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const dashboardHref =
    profile?.role === 'admin' ? '/admin' : profile?.role === 'tutor' ? '/instructor' : '/dashboard'

  return (
    <main className="flex h-dvh flex-col bg-page">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-g size-9 !px-0 lg:hidden"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle conversation list"
          >
            <I n="panel" c="s" />
          </button>
          <Logo />
          <span className="hidden h-5 w-px bg-line sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="grid size-6 place-items-center rounded-full bg-gold-tint text-gold-deep">
              <I n="spark" c="s" />
            </span>
            <span className="text-sm font-semibold">AI Learning Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <Link href={dashboardHref} className="btn btn-s h-9 text-xs">
                Back to dashboard
              </Link>
              <Avatar
                name={profile.fullname}
                profilepic={profile.profilepic}
                ring={false}
                className="size-9 text-xs"
              />
            </>
          ) : (
            <Link href="/login" className="btn btn-p h-9 text-xs">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            <button
              type="button"
              onClick={startNewChat}
              className="btn btn-p flex w-full items-center justify-center gap-2 text-sm shadow-sm"
            >
              <I n="plus" c="s" />
              <span>New conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <p className="over px-2 pb-2 text-[11px]">Chat history</p>
            {convsLoading ? (
              <div className="space-y-2 p-2">
                <div className="h-10 animate-pulse rounded-ui bg-page" />
                <div className="h-10 animate-pulse rounded-ui bg-page" />
                <div className="h-10 animate-pulse rounded-ui bg-page" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted">
                No conversations yet. Start asking questions to begin!
              </div>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId
                  return (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectConv(conv.id)}
                        className={`group flex w-full flex-col rounded-ui p-2.5 text-left transition-colors ${
                          isActive
                            ? 'bg-page font-medium text-ink shadow-sm'
                            : 'text-muted hover:bg-page/60 hover:text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-semibold text-ink">
                            {conv.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted">
                            {formatDate(conv.updatedAt)}
                          </span>
                        </div>
                        {conv.latestMessage && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-muted">
                            {conv.latestMessage}
                          </p>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Chat Conversation Area */}
        <section className="flex flex-1 flex-col overflow-hidden bg-page">
          {/* Active Conversation Title Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-5">
            <span className="truncate text-xs font-semibold text-muted">
              {activeConversation ? activeConversation.title : 'New conversation'}
            </span>
            {activeConvId && (
              <button
                type="button"
                onClick={startNewChat}
                className="btn btn-g h-7 text-xs !px-2"
                title="Start a fresh chat"
              >
                <I n="plus" c="s" />
                <span>New</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {/* Empty state: No active messages */}
              {messages.length === 0 && !messagesLoading && (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-gold-tint text-gold-deep">
                    <I n="spark" c="l" />
                  </div>
                  <h1 className="t-h2 mt-4">How can I help you learn today?</h1>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Ask questions about your courses, programming, technical concepts, or get recommendations from Ujyalo LMS.
                  </p>

                  <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                    {SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => void handleSubmit(sug.prompt)}
                        className="card lift flex flex-col p-4 text-left hover:border-gold"
                      >
                        <span className="text-xs font-semibold text-ink">{sug.title}</span>
                        <span className="mt-1 text-xs text-muted">{sug.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading messages spinner */}
              {messagesLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-20 text-xs text-muted">
                  <span className="animate-spin mr-2">⏳</span> Loading conversation…
                </div>
              )}

              {/* Message History */}
              {messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {isUser ? (
                      <Avatar
                        name={profile?.fullname || 'You'}
                        profilepic={profile?.profilepic}
                        ring={false}
                        className="size-8 shrink-0 text-xs"
                      />
                    ) : (
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-tint text-gold-deep">
                        <I n="spark" c="s" />
                      </span>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-card p-4 sm:max-w-[78%] ${
                        isUser
                          ? 'bg-btn text-btn-fg'
                          : 'card bg-surface text-ink shadow-sm'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      ) : (
                        <MarkdownContent text={message.text} />
                      )}
                      <div
                        className={`mt-2 flex items-center justify-end text-[10px] ${
                          isUser ? 'text-btn-fg/60' : 'text-muted'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Generating response indicator */}
              {sending && (
                <div className="flex gap-3.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-tint text-gold-deep">
                    <I n="spark" c="s" />
                  </span>
                  <div className="card flex items-center gap-2 rounded-card bg-surface px-4 py-3 text-xs text-muted">
                    <span className="size-2 animate-bounce rounded-full bg-gold" />
                    <span className="size-2 animate-bounce rounded-full bg-gold [animation-delay:0.2s]" />
                    <span className="size-2 animate-bounce rounded-full bg-gold [animation-delay:0.4s]" />
                    <span className="ml-1">Thinking…</span>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="rounded-card border border-error/30 bg-error/10 p-4 text-xs text-error">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => void handleSubmit()}
                      className="btn btn-s h-7 text-xs !px-2 text-ink"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Prompt Input Form */}
          <div className="shrink-0 border-t border-line bg-page p-4 sm:p-5">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                void handleSubmit()
              }}
              className="mx-auto max-w-3xl"
            >
              <div className="card relative flex flex-col p-2.5 focus-within:border-gold">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Ujyalo AI anything… (Press Enter to send, Shift+Enter for new line)"
                  rows={2}
                  maxLength={8000}
                  disabled={sending}
                  className="w-full resize-none bg-transparent p-2 text-sm text-ink outline-none disabled:opacity-50"
                />

                <div className="flex items-center justify-between border-t border-line/60 pt-2 px-2">
                  <span className="text-[11px] text-muted">
                    {prompt.length > 0 ? `${prompt.length} / 8000` : 'Powered by Ujyalo AI Agent'}
                  </span>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || sending}
                    className="btn btn-p size-8 !px-0"
                    aria-label="Send message"
                  >
                    <I n="send" c="s" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted">
                Ujyalo AI can answer questions, explain concepts, and find courses from the platform.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
