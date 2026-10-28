import { SPRITE } from './sprite'

export function Sprite() {
  return <svg width="0" height="0" className="absolute" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE }} />
}

/** n = symbol id, c = size shortcut ('s' 16px, 'l' 24px) or any Tailwind utilities */
export function I({ n, c = '' }: { n: string; c?: string }) {
  const cls = c === 's' ? 'size-4' : c === 'l' ? 'size-6' : c
  return (
    <svg className={`i ${cls}`.trim()} aria-hidden="true">
      <use href={`#${n}`} />
    </svg>
  )
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }, (_, k) => <I key={k} n="star" c="size-4 fill-gold stroke-gold" />)}
    </span>
  )
}
