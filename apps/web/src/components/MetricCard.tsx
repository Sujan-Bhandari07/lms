import { I } from './Icon'

export default function MetricCard({ label, value, note, icon, accent = false }: { label: string; value: string; note?: string; icon: string; accent?: boolean }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={`grid size-9 shrink-0 place-items-center rounded-ui ${accent ? 'bg-gold-tint text-gold-deep' : 'bg-surface text-muted'}`}><I n={icon} c="s" /></span>
      </div>
      <p className="mt-3 font-display text-[28px] leading-9 font-bold tracking-[-0.02em] sm:text-[32px] sm:leading-10">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  )
}
