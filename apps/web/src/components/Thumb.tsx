import { I } from './Icon'

const TONES = ['bg-ph1', 'bg-ph2', 'bg-ph3']
/** Course thumbnail placeholder (swap for a real <Image/>). */
export default function Thumb({ i = 0, icon = 'code', className = 'h-14 w-[88px]' }: { i?: number; icon?: string; className?: string }) {
  return (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl text-muted ${TONES[i % 3]} ${className}`}>
      <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
      <I n={icon} c="relative size-6 [stroke-width:1.25]" />
    </div>
  )
}
