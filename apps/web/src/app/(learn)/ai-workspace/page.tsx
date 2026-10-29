import type { Metadata } from 'next'
import AIWorkspace from '@/src/components/AIWorkspace'

export const metadata: Metadata = { title: 'AI Workspace' }
export default function Page() { return <AIWorkspace /> }
