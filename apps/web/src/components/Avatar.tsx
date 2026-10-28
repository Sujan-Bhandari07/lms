import { initials } from '@/src/lib/courses'

export default function Avatar({ name, className = 'size-11 text-sm', ring = true }: { name: string; className?: string; ring?: boolean }) {
  return (
    <div className={`grid shrink-0 place-items-center rounded-full border border-line bg-ph2 font-display font-bold ${ring ? 'shadow-[0_0_0_3px_var(--bg),0_0_0_4px_var(--gold)]' : ''} ${className}`}>
      {initials(name)}
    </div>
  )
}
