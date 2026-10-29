import Link from 'next/link'
import { I } from './Icon'
import { Logo } from './Header'

const suggestions = [
  'Explain a difficult concept step by step',
  'Help me make a study plan',
  'Create practice questions for a topic',
]

export default function AIWorkspace() {
  return (
    <main className="min-h-dvh bg-page">
      <header className="flex h-16 items-center gap-4 border-b border-line px-5 sm:px-8">
        <Logo />
        <span className="hidden h-6 w-px bg-line sm:block" />
        <span className="hidden text-sm font-semibold sm:block">AI learning assistant</span>
        <span className="bdg bdg-gold ml-auto">Coming soon</span>
        <Link href="/login" className="btn btn-s h-10">Sign in</Link>
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-12">
        <aside className="card h-fit p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-btn text-gold"><I n="spark" /></span>
            <div>
              <h2 className="text-sm font-semibold">Study companion</h2>
              <p className="mt-0.5 text-xs text-muted">Not connected to an AI service</p>
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="over">Suggested prompts</p>
            <ul className="mt-3 grid gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion} className="rounded-ui border border-line bg-page p-3 text-sm text-muted">{suggestion}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="card flex min-h-[620px] flex-col items-center justify-center p-6 text-center sm:p-10" aria-labelledby="ai-title">
          <span className="grid size-14 place-items-center rounded-full bg-btn text-gold"><I n="spark" c="l" /></span>
          <h1 id="ai-title" className="t-h2 mt-5">Your learning assistant is on its way</h1>
          <p className="mt-3 max-w-[520px] text-sm leading-6 text-muted">
            The AI service is not available through the API gateway yet. This preview is static; no prompts or files are sent and no generated answers are shown.
          </p>
          <div className="mt-8 w-full max-w-[620px] rounded-card border border-line bg-page p-3 text-left">
            <textarea
              disabled
              rows={3}
              aria-label="AI prompt (not connected)"
              placeholder="Prompts will be available when the assistant is connected."
              className="w-full resize-none bg-transparent p-2 text-sm text-muted outline-none disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-xs text-muted">AI features are not connected</span>
              <button type="button" disabled className="btn btn-p size-10 !px-0 opacity-50" aria-label="Send prompt">
                <I n="send" c="s" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
