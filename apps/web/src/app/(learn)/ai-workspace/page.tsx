import type { Metadata } from 'next'
import AIWorkspace from '@/src/components/AIWorkspace'

export const metadata: Metadata = { title: 'AI workspace' }

export default function AIWorkspacePage() {
  return <AIWorkspace />
}
