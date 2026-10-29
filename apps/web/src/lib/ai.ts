export interface Source { label: string; kind: 'lesson' | 'doc' }
export interface Msg { role: 'user' | 'ai'; text: string; sources?: Source[]; error?: boolean }

export const aiCourses = [
  { id: 'all', title: 'All my courses', slug: '', lesson: 'Search across every enrolled course', pct: 0 },
  { id: 'nest', title: 'NestJS Backend Development', slug: 'nestjs-backend-development', lesson: 'Lesson 17 · Guards and role-based access', pct: 64 },
  { id: 'py', title: 'Python for AI', slug: 'python-for-ai', lesson: 'Lesson 14 · Feature engineering basics', pct: 43 },
  { id: 'ts', title: 'TypeScript Mastery', slug: 'typescript-mastery', lesson: 'Lesson 23 · Declaration files and tooling', pct: 88 },
  { id: 'next', title: 'Next.js: Build Full-Stack Apps', slug: 'nextjs-full-stack-apps', lesson: 'Lesson 6 · Server components and data fetching', pct: 21 },
]

export const history: { id: string; title: string; group: string; course: string; msgs: Msg[] }[] = [
  { id: 'c1', title: 'Guards vs. interceptors', group: 'Today', course: 'nest', msgs: [
    { role: 'user', text: 'What’s the difference between a guard and an interceptor in NestJS?' },
    { role: 'ai', text: 'Guards decide whether a request is allowed to continue, for example by checking a JWT or a role. Interceptors wrap the route handler so you can transform the request or response, add logging, or cache results. In the request lifecycle, guards always run before interceptors.', sources: [{ label: 'Lesson 17 · 04:12', kind: 'lesson' }, { label: 'NestJS-auth-cheatsheet.pdf · p.4', kind: 'doc' }] },
  ] },
  { id: 'c2', title: 'Feature scaling in Python', group: 'Yesterday', course: 'py', msgs: [
    { role: 'user', text: 'When should I use StandardScaler instead of MinMaxScaler?' },
    { role: 'ai', text: 'Use StandardScaler when features are roughly bell-shaped or when your model assumes zero-centered data (such as linear models or SVMs). MinMaxScaler suits bounded inputs and neural networks, but it is sensitive to outliers.', sources: [{ label: 'Lesson 14 · 11:30', kind: 'lesson' }] },
  ] },
  { id: 'c3', title: 'Quiz: TypeScript generics', group: 'Yesterday', course: 'ts', msgs: [] },
  { id: 'c4', title: 'Server components notes', group: 'Previous 7 days', course: 'next', msgs: [] },
]

export const initialDocs: { id: number; name: string; meta: string; status: 'ready' | 'processing' | 'error'; use: boolean }[] = [
  { id: 1, name: 'NestJS-auth-cheatsheet.pdf', meta: '12 pages · 640 KB', status: 'ready', use: true },
  { id: 2, name: 'Week-3-reading.docx', meta: 'Processing…', status: 'processing', use: false },
  { id: 3, name: 'Lecture-notes-scan.pdf', meta: 'We couldn’t read this file. Try a text-based PDF.', status: 'error', use: false },
]

export const ACTIONS: { label: string; icon: string; prompt: string }[] = [
  { label: 'Summarize Lesson', icon: 'doc', prompt: 'Summarize the current lesson' },
  { label: 'Explain Concept', icon: 'info', prompt: 'Explain a concept from this lesson in simple terms' },
  { label: 'Generate Notes', icon: 'pencil', prompt: 'Generate study notes for this lesson' },
  { label: 'Create Quiz', icon: 'okc', prompt: 'Create a short quiz on this lesson' },
  { label: 'Ask About This Course', icon: 'bookopen', prompt: 'What will I learn next in this course?' },
]

export function answer(prompt: string, course: string, useDoc: boolean): Msg {
  const p = prompt.toLowerCase()
  const doc: Source[] = useDoc ? [{ label: 'NestJS-auth-cheatsheet.pdf · p.4', kind: 'doc' }] : []
  const les = (l: string): Source => ({ label: l, kind: 'lesson' })
  if (p.includes('summar')) return { role: 'ai', text: `Lesson summary:\n• Guards implement CanActivate and return true or false.\n• A JWT guard authenticates the user; a roles guard checks permissions.\n• Metadata set by a custom @Roles decorator is read with Reflector.\n• Unauthorized requests return 401, forbidden ones return 403.`, sources: [les('Lesson 17 · 00:00–48:30'), ...doc] }
  if (p.includes('notes')) return { role: 'ai', text: `Study notes: Guards & roles\n1. Guards run after middleware and before pipes and interceptors.\n2. Use @UseGuards() at controller or handler level.\n3. Store roles with SetMetadata, then read them via Reflector.getAllAndOverride.\n4. Keep authentication and authorization in separate guards.`, sources: [les('Lesson 17 · 04:12'), les('Lesson 17 · 21:05'), ...doc] }
  if (p.includes('quiz')) return { role: 'ai', text: `Quick quiz (3 questions)\n1. Which interface must a guard implement?\n2. In what order do guards and interceptors run?\n3. Which HTTP status should a missing role return?\n\nReply with your answers and I’ll check them.`, sources: [les('Lesson 17 · 04:12')] }
  if (p.includes('next in this course') || p.includes('what will i learn')) return { role: 'ai', text: 'Next up is “Securing your API” (42 min), then Section 5 on validation, testing and error handling. You’re 64% through the course. Open the course player to continue the lesson.', sources: [les('Course curriculum')] }
  if (p.includes('explain')) return { role: 'ai', text: 'Think of a guard as a security checkpoint at a building entrance: it checks who you are and whether you’re allowed in, before you reach any office (the route handler). It does not change what happens inside.', sources: [les('Lesson 17 · 04:12'), ...doc] }
  return { role: 'ai', text: 'Guards decide whether a request may continue, such as checking a JWT and the user’s role. Interceptors wrap the handler to transform input or output. Guards always run first.', sources: [les('Lesson 17 · 04:12'), ...doc] }
}
