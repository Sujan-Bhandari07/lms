import { I } from './Icon'

export type Status = 'Draft' | 'Pending Review' | 'Published' | 'Rejected' | 'Changes Requested'
const MAP: Record<Status, [cls: string, icon: string]> = {
  Draft: ['', 'pencil'], 'Pending Review': ['bdg-gold', 'clock'], Published: ['bdg-ok', 'okc'], Rejected: ['bdg-err', 'alert'], 'Changes Requested': ['bdg-out', 'refresh'],
}
/** Always pairs colour with an icon and a text label. */
export default function StatusBadge({ status }: { status: Status }) {
  const [cls, icon] = MAP[status]
  return <span className={`bdg gap-1.5 ${cls}`}><I n={icon} c="size-3" />{status}</span>
}
