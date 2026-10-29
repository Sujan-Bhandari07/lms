import type { Status } from '@/src/components/StatusBadge'

export const instructor = { first: 'Daniel', name: 'Daniel Reyes' }
export interface IC { title: string; category: string; icon: string; order: number; students: number; updated: string; status: Status; note?: string }
export const myCourses: IC[] = [
  { title: 'NestJS Backend Development', category: 'Programming', icon: 'code', order: 12, students: 12480, updated: '2 days ago', status: 'Published' },
  { title: 'Docker & Kubernetes Essentials', category: 'Programming', icon: 'code', order: 1, students: 8340, updated: '3 weeks ago', status: 'Published' },
  { title: 'GraphQL APIs with NestJS', category: 'Programming', icon: 'code', order: 11, students: 0, updated: 'Submitted yesterday', status: 'Pending Review', note: 'Review usually takes 2–3 business days' },
  { title: 'Testing Node.js Applications', category: 'Programming', icon: 'code', order: 8, students: 0, updated: '4 days ago', status: 'Draft', note: 'Curriculum: 3 of 6 sections' },
  { title: 'Microservices Fundamentals', category: 'Programming', icon: 'code', order: 5, students: 0, updated: '1 week ago', status: 'Rejected', note: 'Reviewer feedback available' },
]
export const instructorStats = [
  { label: 'Published courses', value: '2', note: '1 pending review · 1 draft', icon: 'bookopen' },
  { label: 'Total enrollments', value: '20,820', note: '+312 this week', icon: 'users' },
  { label: 'Course engagement', value: '71%', note: 'Avg. completion rate, +4%', icon: 'trend' },
  { label: 'Revenue this month', value: 'रु 9,860', note: 'After platform fees', icon: 'rupee' },
]
export const instructorActivity = [
  { icon: 'users', text: '24 new students enrolled in NestJS Backend Development', when: 'Today' },
  { icon: 'star', text: 'Sofia Alvarez left a 5-star review on NestJS Backend Development', when: '3h ago' },
  { icon: 'msg', text: 'Kofi Mensah asked a question in Lesson 17: Guards and role-based access', when: '5h ago' },
  { icon: 'shield', text: '“GraphQL APIs with NestJS” was submitted for review', when: 'Yesterday' },
  { icon: 'alert', text: '“Microservices Fundamentals” needs changes before it can be published', when: '1 week ago' },
]
