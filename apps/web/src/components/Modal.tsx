'use client'
import { useEffect } from 'react'
import { I } from './Icon'

/** Design-system modal: bottom sheet on mobile, centred 440/560px dialog on larger screens. */
export default function Modal({ open, onClose, title, children, footer, size = 'sm' }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer: React.ReactNode; size?: 'sm' | 'md' }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[rgba(17,17,17,.48)] backdrop-blur-[2px] sm:place-items-center sm:p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`relative w-full animate-[up_.2s_var(--ease-ujyalo)] rounded-t-card bg-page p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-lg sm:rounded-card sm:p-8 ${size === 'sm' ? 'sm:max-w-[440px]' : 'sm:max-w-[560px]'}`}>
        <button className="absolute top-3 right-3 grid size-11 cursor-pointer place-items-center text-muted hover:text-ink" aria-label="Close" onClick={onClose}><I n="x" /></button>
        <h3 id="modal-title" className="t-h3 mb-3 pr-8">{title}</h3>
        <div className="text-[15px] leading-6 text-muted">{children}</div>
        <div className="mt-6 flex justify-end gap-3 max-sm:*:flex-1">{footer}</div>
      </div>
    </div>
  )
}
