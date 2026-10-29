export interface ChatMsg { from: 'me' | 'them'; text: string; day: string; at: string; file?: string }
export interface Thread { id: string; name: string; role: string; course: string; slug: string; lesson?: string; unread: number; when: string; msgs: ChatMsg[] }

export const studentThreads: Thread[] = [
  { id: 's1', name: 'Daniel Reyes', role: 'Instructor', course: 'NestJS Backend Development', slug: 'nestjs-backend-development', lesson: 'Lesson 17 · Guards and role-based access', unread: 2, when: '10:42 AM', msgs: [
    { from: 'me', day: 'Yesterday', at: '4:12 PM', text: 'Hi Daniel, in Lesson 17 can the RolesGuard read the roles straight from the JWT payload?' },
    { from: 'them', day: 'Today', at: '10:38 AM', text: 'Hi Aarav! Yes. Decode the token in your auth guard, attach the user to the request, and read roles in RolesGuard through the request context.' },
    { from: 'them', day: 'Today', at: '10:42 AM', text: 'I’ve attached a small example you can drop into your project.', file: 'roles-guard-example.ts · 4 KB' },
  ] },
  { id: 's2', name: 'Priya Raman', role: 'Instructor', course: 'Python for AI', slug: 'python-for-ai', lesson: 'Lesson 14 · Feature engineering basics', unread: 0, when: 'Yesterday', msgs: [
    { from: 'me', day: 'Monday', at: '9:05 AM', text: 'Thanks for the notebook in the resources. Is it fine to use a different dataset for the project?' },
    { from: 'them', day: 'Yesterday', at: '2:20 PM', text: 'Absolutely, as long as it has at least 1,000 rows and a clear target column. Good luck!' },
  ] },
  { id: 's3', name: 'Sarah Okafor', role: 'Instructor', course: 'TypeScript Mastery', slug: 'typescript-mastery', unread: 0, when: 'Mon', msgs: [
    { from: 'them', day: 'Monday', at: '11:15 AM', text: 'Congratulations on finishing Section 5! Your quiz scores look great.' },
  ] },
  { id: 's4', name: 'Marcus Lindqvist', role: 'Instructor', course: 'Machine Learning Foundations', slug: 'machine-learning-foundations', unread: 0, when: '', msgs: [] },
]

export const instructorThreads: Thread[] = [
  { id: 'i1', name: 'Aarav Khadka', role: 'Student', course: 'NestJS Backend Development', slug: 'nestjs-backend-development', lesson: 'Lesson 17 · Guards and role-based access', unread: 2, when: '10:42 AM', msgs: [
    { from: 'them', day: 'Yesterday', at: '4:12 PM', text: 'Hi Daniel, in Lesson 17 can the RolesGuard read the roles straight from the JWT payload?' },
    { from: 'me', day: 'Today', at: '10:38 AM', text: 'Hi Aarav! Yes. Decode the token in your auth guard, attach the user to the request, and read roles in RolesGuard.' },
    { from: 'them', day: 'Today', at: '10:42 AM', text: 'That worked, thank you! One more question about refresh tokens.' },
  ] },
  { id: 'i2', name: 'Elena Marsh', role: 'Student', course: 'Docker & Kubernetes Essentials', slug: 'docker-kubernetes-essentials', unread: 1, when: '9:15 AM', msgs: [
    { from: 'them', day: 'Today', at: '9:15 AM', text: 'The Kubernetes deployment lesson was excellent. Could you share the YAML from the demo?' },
  ] },
  { id: 'i3', name: 'Kofi Mensah', role: 'Student', course: 'NestJS Backend Development', slug: 'nestjs-backend-development', unread: 1, when: 'Yesterday', msgs: [
    { from: 'them', day: 'Yesterday', at: '6:40 PM', text: 'Is there a recommended way to structure feature modules in a larger project?' },
  ] },
  { id: 'i4', name: 'Sofia Alvarez', role: 'Student', course: 'NestJS Backend Development', slug: 'nestjs-backend-development', unread: 0, when: 'Mon', msgs: [
    { from: 'me', day: 'Monday', at: '1:02 PM', text: 'Thanks for the great review, Sofia! Glad the certificate helped.' },
  ] },
]
