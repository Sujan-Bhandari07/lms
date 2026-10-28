import { curriculum } from './courses'

export const flat = curriculum.flatMap((s, si) => s.lessons.map(([title, min], i) => ({ title, min, si, no: 0, first: i === 0 }))).map((l, i) => ({ ...l, no: i + 1 }))
export const START = 16 // zero-based index of the current lesson (lesson 17)
export const COMPLETED = Array.from({ length: START }, (_, i) => i)

const SPECIFIC: Record<string, { text: string; points: string[] }> = {
  'Guards and role-based access': {
    text: 'Guards decide whether a request is allowed to reach a route handler. In this lesson you’ll build a JWT auth guard, attach user roles to the request, and protect endpoints with a reusable @Roles decorator.',
    points: ['Implement CanActivate and read the request context', 'Create a custom @Roles decorator with metadata and Reflector', 'Combine authentication and role guards on a controller', 'Return clear 401 and 403 responses'],
  },
}
export function overview(title: string) {
  return SPECIFIC[title] ?? {
    text: `In this lesson you’ll work through “${title}” step by step, applying each idea to the course project so the concepts stay practical and easy to revisit.`,
    points: ['Understand the core idea and when to use it', 'Apply it to the running course project', 'Avoid the most common mistakes', 'Check your understanding with a short exercise'],
  }
}

export const resourcesFor = (title: string) => [
  { name: `${title} — slides.pdf`, kind: 'PDF', size: '1.8 MB' },
  { name: 'Lesson starter project.zip', kind: 'ZIP', size: '312 KB' },
  { name: 'NestJS quick-reference cheat sheet.pdf', kind: 'PDF', size: '640 KB' },
]
export const courseMaterials = [
  { name: 'Course syllabus.pdf', kind: 'PDF', size: '220 KB' },
  { name: 'Recommended reading list.pdf', kind: 'PDF', size: '180 KB' },
]

export const qa = [
  { q: 'Can I apply a guard globally and still skip it on specific routes?', by: 'Kofi Mensah', when: '3 days ago', a: 'Yes. Register the guard globally, then add a custom @Public() decorator and check for it with Reflector inside canActivate.', who: 'Daniel Reyes · Instructor', votes: 14 },
  { q: 'Why does my guard run before my pipe?', by: 'Sofia Alvarez', when: '1 week ago', a: 'Guards always run before interceptors and pipes in the NestJS request lifecycle, so validation happens only after authorization passes.', who: 'Daniel Reyes · Instructor', votes: 9 },
  { q: 'Is it better to store roles in the JWT or look them up each request?', by: 'Ben Whitaker', when: '2 weeks ago', a: '', who: '', votes: 4 },
]

export const seedNotes = [
  { t: 142, text: 'Guards run after middleware but before interceptors and pipes.' },
  { t: 615, text: 'Use Reflector.getAllAndOverride to read role metadata from handler and class.' },
]
export const clock = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
