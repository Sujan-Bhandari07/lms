import { useState } from 'react'
import { initials } from '@/src/lib/courses'

export default function Avatar({
  name,
  profilepic,
  className = 'size-11 text-sm',
  ring = true,
}: {
  name: string
  profilepic?: string | null
  className?: string
  ring?: boolean
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const source = profilepic?.trim()
  const showImage = Boolean(source && source !== failedSource)

  return (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-ph2 font-display font-bold ${ring ? 'shadow-[0_0_0_3px_var(--bg),0_0_0_4px_var(--gold)]' : ''} ${className}`}>
      {showImage ? (
        <img
          src={source ?? ''}
          alt={name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedSource(source ?? null)}
        />
      ) : (
        initials(name)
      )}
    </div>
  )
}
