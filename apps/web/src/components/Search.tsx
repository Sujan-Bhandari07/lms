import { I } from './Icon'

type Props = { value?: string; onChange?: (v: string) => void; action?: string; placeholder: string }

/** Prominent course search. Controlled when onChange is given, otherwise a plain GET form to `action`. */
export default function Search({ value, onChange, action, placeholder }: Props) {
  return (
    <form
      role="search" action={action} onSubmit={onChange ? (e) => e.preventDefault() : undefined}
      className="mt-8 flex max-w-[680px] flex-wrap items-center gap-2 rounded-ui border border-line bg-page p-3 shadow-md transition focus-within:border-ink focus-within:ring-2 focus-within:ring-gold sm:h-[60px] sm:flex-nowrap sm:gap-3 sm:py-0 sm:pr-2 sm:pl-5"
    >
      <I n="search" c="hidden text-muted sm:block" />
      <input
        type="search" name="q" aria-label="Search courses" placeholder={placeholder}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        className="h-11 min-w-0 flex-[1_0_70%] bg-transparent text-base text-ink outline-none placeholder:text-muted sm:h-full sm:flex-1"
      />
      <button className="btn btn-p h-11 w-full sm:w-auto" type="submit">Search</button>
    </form>
  )
}
