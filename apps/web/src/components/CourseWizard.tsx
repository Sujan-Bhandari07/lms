'use client'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { I } from './Icon'

const STEPS = ['Course Information', 'Learning Outcomes', 'Curriculum', 'Pricing and Thumbnail', 'Preview and Submit']
const CATEGORIES = ['Programming', 'Web Development', 'AI & ML', 'Data Science', 'Design', 'Business']
const LANGS = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Nepali']
const LEVELS: [string, string][] = [['Beginner', 'No prior experience needed'], ['Intermediate', 'Some experience expected'], ['Advanced', 'For experienced learners'], ['All levels', 'Suitable for everyone']]
const INPUT = 'w-full rounded-ui border bg-page px-4 text-base text-ink outline-none transition placeholder:text-muted hover:border-[#CFCCC4] focus:border-ink focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-page'

type Form = { title: string; subtitle: string; description: string; category: string; level: string; language: string; audience: string; objectives: string[] }
const INITIAL: Form = { title: '', subtitle: '', description: '', category: '', level: '', language: 'English', audience: '', objectives: ['', '', ''] }

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.title.trim().length < 10) e.title = 'Enter a course title of at least 10 characters.'
  if (f.subtitle.trim().length < 20) e.subtitle = 'Enter a subtitle of at least 20 characters.'
  if (f.description.trim().length < 100) e.description = 'Describe your course in at least 100 characters.'
  if (!f.category) e.category = 'Choose a category.'
  if (!f.level) e.level = 'Choose a difficulty level.'
  if (f.audience.trim().length < 20) e.audience = 'Describe who this course is for (at least 20 characters).'
  if (f.objectives.filter((o) => o.trim()).length < 3) e.objectives = 'Add at least 3 learning objectives.'
  return e
}

function Field({ id, label, help, error, count, max, children }: { id: string; label: string; help?: string; error?: string; count?: number; max?: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm leading-[22px] font-medium">{label} <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
        {max && <span className={`text-xs tabular-nums ${count! > max ? 'text-error' : 'text-muted'}`}>{count}/{max}</span>}
      </div>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-2 flex items-start gap-2 text-[13px] leading-5 text-error"><I n="alert" c="mt-px size-4" />{error}</p>
        : help && <p id={`${id}-help`} className="mt-2 text-[13px] leading-5 text-muted">{help}</p>}
    </div>
  )
}

export default function CourseWizard() {
  const [f, setF] = useState<Form>(INITIAL)
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState('')
  const [ok, setOk] = useState(false)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); if (submitted) setErrors(validate({ ...f, [k]: v })) }
  const border = (k: keyof Form) => (errors[k] ? 'border-error' : 'border-line')
  const aria = (k: keyof Form, id = k as string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${id}-err` : `${id}-help` })

  function saveDraft() { setSaved(`Draft saved at ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`) }
  function next(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const v = validate(f)
    setErrors(v); setOk(false)
    if (Object.keys(v).length) { setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0); return }
    saveDraft(); setOk(true)
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex gap-2 text-[13px] text-muted" aria-label="Breadcrumb"><Link href="/instructor" className="hover:text-ink">Instructor</Link><span>/</span><span className="text-ink">Create Course</span></nav>
          <h1 className="t-h1 mt-3">Create a new course</h1>
          <p className="mt-2 max-w-[560px] text-base text-muted">Build a structured, self-paced course from recorded lessons. You can save a draft at any time and come back later.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted" aria-live="polite">{saved}</span>
          <button type="button" className="btn btn-s h-11" onClick={saveDraft}><I n="check" c="s" />Save Draft</button>
        </div>
      </div>

      {/* Step indicator */}
      <nav aria-label="Course creation progress" className="mt-8">
        <p className="mb-3 text-sm font-medium sm:hidden">Step 1 of 5 · <span className="text-muted">{STEPS[0]}</span></p>
        <ol className="flex items-start gap-2">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === 0 ? 'step' : undefined} className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${i === 0 ? 'bg-btn text-btn-fg ring-2 ring-gold ring-offset-2 ring-offset-page' : 'border border-line bg-page text-muted'}`}>{i + 1}</span>
                {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i === 0 ? 'bg-gold' : 'bg-line'}`} />}
              </div>
              <span className={`mt-2 hidden pr-2 text-[13px] leading-[18px] sm:block ${i === 0 ? 'font-semibold text-ink' : 'text-muted'}`}>{s}</span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={next} noValidate className="card p-5 sm:p-8">
          <h2 className="t-h3">Course information</h2>
          <p className="mt-1 mb-8 text-sm text-muted">Fields marked <span className="text-error">*</span> are required.</p>
          {ok && <div role="status" className="mb-6 flex gap-3 rounded-ui border border-ok/40 bg-ok/10 p-4 text-sm"><I n="okc" c="text-ok" /><p>Step 1 is complete and saved. Next up: <b>Learning Outcomes</b>.</p></div>}
          {submitted && Object.keys(errors).length > 0 && <div role="alert" className="mb-6 flex gap-3 rounded-ui border border-error/40 bg-error/10 p-4 text-sm"><I n="alert" c="text-error" /><p>Please fix {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'field' : 'fields'} before continuing.</p></div>}

          <div className="grid gap-7">
            <Field id="title" label="Course title" help="Be specific and keep it clear. Example: “NestJS Backend Development: Build Production-Ready APIs”." error={errors.title} count={f.title.length} max={80}>
              <input id="title" value={f.title} maxLength={90} onChange={(e) => set('title', e.target.value)} placeholder="What will learners be able to do?" className={`${INPUT} h-12 ${border('title')}`} {...aria('title')} />
            </Field>
            <Field id="subtitle" label="Subtitle" help="One sentence that explains the outcome and who it’s for." error={errors.subtitle} count={f.subtitle.length} max={120}>
              <input id="subtitle" value={f.subtitle} maxLength={130} onChange={(e) => set('subtitle', e.target.value)} placeholder="Learn to design, secure and deploy scalable APIs" className={`${INPUT} h-12 ${border('subtitle')}`} {...aria('subtitle')} />
            </Field>
            <Field id="description" label="Course description" help="Explain what the course covers, how it’s structured and what learners will build. Minimum 100 characters." error={errors.description} count={f.description.length} max={2000}>
              <textarea id="description" rows={6} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your course…" className={`${INPUT} resize-y py-3 ${border('description')}`} {...aria('description')} />
            </Field>

            <div className="grid gap-7 sm:grid-cols-2">
              <Field id="category" label="Category" help="Helps learners find your course." error={errors.category}>
                <select id="category" value={f.category} onChange={(e) => set('category', e.target.value)} className={`${INPUT} select-arrow h-12 cursor-pointer appearance-none pr-10 ${border('category')} ${f.category ? '' : 'text-muted'}`} {...aria('category')}>
                  <option value="">Select a category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="language" label="Course language" help="The language spoken in your videos.">
                <select id="language" value={f.language} onChange={(e) => set('language', e.target.value)} className={`${INPUT} select-arrow h-12 cursor-pointer appearance-none pr-10 border-line`}>
                  {LANGS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <fieldset aria-describedby={errors.level ? 'level-err' : 'level-help'}>
              <legend className="mb-2 text-sm leading-[22px] font-medium">Difficulty level <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(required)</span></legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {LEVELS.map(([l, d]) => (
                  <label key={l} className={`flex min-h-[60px] cursor-pointer items-center gap-3 rounded-ui border p-4 text-sm transition-colors ${f.level === l ? 'border-ink bg-gold-tint' : errors.level ? 'border-error' : 'border-line hover:border-[#CFCCC4]'}`}>
                    <input type="radio" name="level" value={l} checked={f.level === l} onChange={() => set('level', l)} className="size-[18px] accent-btn" {...(errors.level && l === 'Beginner' ? { 'aria-invalid': true } : {})} />
                    <span><b className="block font-semibold">{l}</b><span className="text-[13px] text-muted">{d}</span></span>
                  </label>
                ))}
              </div>
              {errors.level ? <p id="level-err" role="alert" className="mt-2 flex gap-2 text-[13px] text-error"><I n="alert" c="mt-px size-4" />{errors.level}</p> : <p id="level-help" className="mt-2 text-[13px] text-muted">Be honest, so learners choose the right course.</p>}
            </fieldset>

            <Field id="audience" label="Intended audience" help="Who is this course for? Who should skip it?" error={errors.audience} count={f.audience.length} max={500}>
              <textarea id="audience" rows={3} value={f.audience} onChange={(e) => set('audience', e.target.value)} placeholder="e.g. Front-end developers who want to move into back-end work…" className={`${INPUT} resize-y py-3 ${border('audience')}`} {...aria('audience')} />
            </Field>

            <fieldset aria-describedby={errors.objectives ? 'obj-err' : 'obj-help'}>
              <legend className="mb-2 text-sm leading-[22px] font-medium">Learning objectives <span className="text-error" aria-hidden="true">*</span><span className="sr-only">(required)</span></legend>
              <div className="grid gap-3">
                {f.objectives.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <input aria-label={`Learning objective ${i + 1}`} value={o} onChange={(e) => set('objectives', f.objectives.map((x, j) => (j === i ? e.target.value : x)))} placeholder={i === 0 ? 'Build a REST API with NestJS' : 'Learners will be able to…'} className={`${INPUT} h-12 ${errors.objectives && !o.trim() ? 'border-error' : 'border-line'}`} {...(errors.objectives && i === 0 ? { 'aria-invalid': true } : {})} />
                    {f.objectives.length > 3 && <button type="button" onClick={() => set('objectives', f.objectives.filter((_, j) => j !== i))} aria-label={`Remove objective ${i + 1}`} className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-ui text-muted hover:bg-surface hover:text-ink"><I n="trash" /></button>}
                  </div>
                ))}
              </div>
              {f.objectives.length < 8 && <button type="button" onClick={() => set('objectives', [...f.objectives, ''])} className="btn btn-g mt-2 -ml-3"><I n="plus" c="s" />Add another objective</button>}
              {errors.objectives ? <p id="obj-err" role="alert" className="mt-2 flex gap-2 text-[13px] text-error"><I n="alert" c="mt-px size-4" />{errors.objectives}</p> : <p id="obj-help" className="mt-2 text-[13px] text-muted">Start each with an action verb. Add 3 to 8 objectives. You can refine these in the next step.</p>}
            </fieldset>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 max-sm:flex-col-reverse max-sm:*:w-full">
            <Link href="/instructor" className="btn btn-g h-12 text-muted">Cancel</Link>
            <div className="flex gap-3 max-sm:flex-col-reverse max-sm:*:w-full">
              <button type="button" className="btn btn-s h-12" onClick={saveDraft}>Save Draft</button>
              <button type="submit" className="btn btn-p h-12 px-8">Continue<I n="cr" c="s" /></button>
            </div>
          </div>
        </form>

        <aside className="grid gap-4 xl:sticky xl:top-8">
          <div className="rounded-card bg-surface p-6">
            <h3 className="t-h4 !text-base">Tips for a clear course</h3>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              {['Lead with the outcome learners will achieve.', 'Write objectives that can be demonstrated, such as “Deploy an API with Docker”.', 'Name the audience precisely to reduce refunds and improve reviews.'].map((t) => <li key={t} className="flex gap-3"><I n="check" c="mt-0.5 size-4 text-gold-deep" />{t}</li>)}
            </ul>
          </div>
          <div className="card p-6 text-sm"><b className="flex items-center gap-2 font-semibold"><I n="info" c="s" />How review works</b><p className="mt-2 text-muted">After you submit, our team reviews quality and completeness, usually within 2–3 business days. You’ll be notified of any requested changes.</p></div>
        </aside>
      </div>
    </main>
  )
}
