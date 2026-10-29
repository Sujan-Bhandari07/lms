import type { Metadata } from 'next'
import Messenger from '@/src/components/Messenger'

export const metadata: Metadata = { title: 'Messages' }

export default function InstructorMessagesPage() {
  return <Messenger role="instructor" />
}
