import { I } from './Icon'

export default function Messenger({ role }: { role: 'student' | 'instructor' }) {
  return (
    <main className="grid h-[calc(100dvh-4rem)] md:h-dvh md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-line bg-page">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h1 className="t-h3 !text-[22px]">Messages</h1>
            <p className="mt-1 text-xs capitalize text-muted">{role} workspace</p>
          </div>
          <span className="bdg bdg-gold">Coming soon</span>
        </div>
        <div className="grid flex-1 content-center justify-items-center px-6 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted"><I n="msg" /></span>
          <h2 className="t-h4 mt-4 !text-base">No conversations yet</h2>
          <p className="mt-1 max-w-[240px] text-sm leading-6 text-muted">Conversation history will appear here when messaging is connected.</p>
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col bg-page" aria-label="Message conversation">
        <header className="flex h-[72px] items-center gap-3 border-b border-line px-5">
          <span className="grid size-10 place-items-center rounded-full bg-surface text-muted"><I n="msg" /></span>
          <div>
            <h2 className="text-sm font-semibold">Conversation</h2>
            <p className="mt-0.5 text-xs text-muted">Messaging is not connected</p>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-surface text-muted"><I n="msg" c="l" /></span>
          <h2 className="t-h3 mt-5">Messages are coming soon</h2>
          <p className="mt-2 max-w-[420px] text-sm leading-6 text-muted">
            The backend currently exposes no messaging API. This page does not load sample conversations or send messages.
          </p>
          <div aria-hidden="true" className="mt-8 grid w-full max-w-[520px] gap-3">
            <div className="h-10 w-3/5 rounded-2xl rounded-bl-sm bg-surface" />
            <div className="ml-auto h-10 w-2/5 rounded-2xl rounded-br-sm bg-gold-tint" />
          </div>
        </div>
        <div className="border-t border-line p-4 sm:p-5">
          <div className="mx-auto flex max-w-[760px] items-end gap-3 rounded-card border border-line bg-surface p-3">
            <textarea
              disabled
              rows={1}
              aria-label="Message (not connected)"
              placeholder="Messaging will be available when the API is ready."
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none disabled:cursor-not-allowed"
            />
            <button type="button" disabled className="btn btn-p size-11 shrink-0 !px-0 opacity-50" aria-label="Send message">
              <I n="send" c="s" />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-[760px] text-xs text-muted">Sending is disabled because no messaging API is available.</p>
        </div>
      </section>
    </main>
  )
}
