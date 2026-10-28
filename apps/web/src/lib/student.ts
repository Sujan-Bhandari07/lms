export const student = { name: 'Aarav Khadka', first: 'Aarav' }

export const stats = [
  { label: 'Enrolled courses', value: '6', unit: '', icon: 'bookopen', note: '4 in progress' },
  { label: 'Hours learned', value: '84.5', unit: 'h', icon: 'clock', note: '+6.5h this week' },
  { label: 'Completed courses', value: '2', unit: '', icon: 'award', note: '2 certificates earned' },
  { label: 'Learning streak', value: '12', unit: ' days', icon: 'flame', note: 'Personal best: 21 days' },
]

export interface Enrolled {
  slug: string; title: string; instructor: string; category: string; order: number
  done: number; total: number; current?: string; currentNo?: number; last: string
}
export const progressOf = (e: Enrolled) => Math.round((e.done / e.total) * 100)

export const enrolled: Enrolled[] = [
  { slug: 'nestjs-backend-development', title: 'NestJS Backend Development', instructor: 'Daniel Reyes', category: 'Programming', order: 12, done: 16, total: 25, current: 'Guards and role-based access', currentNo: 17, last: '2 hours ago' },
  { slug: 'python-for-ai', title: 'Python for AI: From Zero to Models', instructor: 'Priya Raman', category: 'AI & ML', order: 7, done: 13, total: 30, current: 'Feature engineering basics', currentNo: 14, last: 'Yesterday' },
  { slug: 'typescript-mastery', title: 'TypeScript Mastery', instructor: 'Sarah Okafor', category: 'Programming', order: 8, done: 22, total: 25, current: 'Declaration files and tooling', currentNo: 23, last: '3 days ago' },
  { slug: 'nextjs-full-stack-apps', title: 'Next.js: Build Full-Stack Apps', instructor: 'Sarah Okafor', category: 'Web Development', order: 10, done: 5, total: 24, current: 'Server components and data fetching', currentNo: 6, last: '2 days ago' },
  { slug: 'ui-ux-design-fundamentals', title: 'UI/UX Design Fundamentals', instructor: 'Lena Fischer', category: 'Design', order: 4, done: 18, total: 18, last: 'Sep 12' },
  { slug: 'product-management-essentials', title: 'Product Management Essentials', instructor: 'Grace Liu', category: 'Business', order: 3, done: 16, total: 16, last: 'Aug 3' },
]

export const recommendedSlugs = ['machine-learning-foundations', 'prompt-engineering-llm-apps', 'docker-kubernetes-essentials']
export const interests = ['Backend development', 'AI & machine learning']

export const recentLessons = [
  { title: 'Guards and role-based access', course: 'NestJS Backend Development', when: '2 hours ago', pct: 72, slug: 'nestjs-backend-development' },
  { title: 'Feature engineering basics', course: 'Python for AI', when: 'Yesterday', pct: 100, slug: 'python-for-ai' },
  { title: 'Server components and data fetching', course: 'Next.js: Build Full-Stack Apps', when: '2 days ago', pct: 45, slug: 'nextjs-full-stack-apps' },
  { title: 'Utility types in practice', course: 'TypeScript Mastery', when: '3 days ago', pct: 100, slug: 'typescript-mastery' },
]

export const goals = [
  { title: 'Finish NestJS Backend Development', meta: 'Target: Nov 15', pct: 64 },
  { title: 'Complete 5 lessons this week', meta: '3 of 5 done', pct: 60 },
  { title: 'Start Machine Learning Foundations', meta: 'Not started yet', pct: 0 },
]

export const certificates = [
  { title: 'UI/UX Design Fundamentals', by: 'Lena Fischer', date: 'Sep 12, 2026', id: 'UJ-2026-48213' },
  { title: 'Product Management Essentials', by: 'Grace Liu', date: 'Aug 3, 2026', id: 'UJ-2026-39107' },
]

export const activity = [
  { icon: 'check', title: 'Completed a lesson', meta: 'Providers and dependency injection · NestJS', when: '2h ago' },
  { icon: 'okc', title: 'Passed a quiz', meta: 'Module 4 checkpoint · 92%', when: 'Yesterday' },
  { icon: 'spark', title: 'Asked Ujyalo AI', meta: 'Guards vs. interceptors in NestJS', when: 'Yesterday' },
  { icon: 'doc', title: 'Downloaded a resource', meta: 'Auth cheat sheet.pdf', when: '2 days ago' },
  { icon: 'award', title: 'Earned a certificate', meta: 'UI/UX Design Fundamentals', when: 'Sep 12' },
]
