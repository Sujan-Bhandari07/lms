import type { Status } from '@/src/components/StatusBadge'

export const adminStats = [
  { label: 'Total students', value: '48,213', note: '+1,284 this month', icon: 'users' },
  { label: 'Instructors', value: '312', note: '9 new this month', icon: 'user' },
  { label: 'Courses', value: '1,284', note: '1,198 published', icon: 'bookopen' },
  { label: 'Enrollments', value: '126,540', note: '+4.2% vs last month', icon: 'trend' },
  { label: 'Pending approvals', value: '14', note: '3 waiting over 3 days', icon: 'shield' },
]
export interface Queue { id: number; title: string; instructor: string; category: string; icon: string; submitted: string; status: Status }
export const queue: Queue[] = [
  { id: 1, title: 'GraphQL APIs with NestJS', instructor: 'Daniel Reyes', category: 'Programming', icon: 'code', submitted: 'Oct 27, 2026', status: 'Pending Review' },
  { id: 2, title: 'Data Visualization with D3', instructor: 'Maya Chen', category: 'Data Science', icon: 'chart', submitted: 'Oct 26, 2026', status: 'Pending Review' },
  { id: 3, title: 'Brand Identity Design Basics', instructor: 'Lena Fischer', category: 'Design', icon: 'layers', submitted: 'Oct 26, 2026', status: 'Pending Review' },
  { id: 4, title: 'Startup Fundraising 101', instructor: 'Ravi Shankar', category: 'Business', icon: 'brief', submitted: 'Oct 25, 2026', status: 'Changes Requested' },
  { id: 5, title: 'Rust for Backend Developers', instructor: 'Tomás Silva', category: 'Programming', icon: 'code', submitted: 'Oct 24, 2026', status: 'Pending Review' },
]
export const adminActivity = [
  { event: 'Course published', who: 'Priya Raman', detail: 'Prompt Engineering & LLM Apps', when: '12 min ago', icon: 'okc' },
  { event: 'Instructor application', who: 'Omar Haddad', detail: 'Design · 4 sample lessons attached', when: '48 min ago', icon: 'user' },
  { event: 'Course submitted', who: 'Daniel Reyes', detail: 'GraphQL APIs with NestJS', when: 'Yesterday, 4:12 PM', icon: 'shield' },
  { event: 'Content report', who: 'Student #20481', detail: 'Reported lesson audio quality', when: 'Yesterday, 11:30 AM', icon: 'flag' },
  { event: 'Refund processed', who: 'Student #19377', detail: 'Next.js: Build Full-Stack Apps · $59', when: 'Oct 26', icon: 'dollar' },
  { event: 'Category updated', who: 'Maya Patel', detail: 'Renamed “AI” to “AI & ML”', when: 'Oct 25', icon: 'layers' },
]
