export type NavItem = [label: string, href: string, icon: string, count?: number]
export interface ShellConfig { nav: NavItem[]; user: { name: string; role: string }; home: string; card?: { title: string; sub: string; pct: number } | null }

export const STUDENT: ShellConfig = {
  home: '/dashboard', user: { name: 'Aarav Khadka', role: 'Student' },
  card: { title: 'Weekly goal', sub: '3 of 5 lessons completed', pct: 60 },
  nav: [['Dashboard', '/dashboard', 'grid'], ['Explore Courses', '/courses', 'compass'], ['My Learning', '#', 'bookopen'], ['AI Workspace', '/ai-workspace', 'spark'],
    ['Certificates', '#', 'award'], ['Messages', '/messages', 'msg', 2], ['Notifications', '#', 'bell', 3], ['Settings', '#', 'gear']],
}
export const INSTRUCTOR: ShellConfig = {
  home: '/instructor', user: { name: 'Daniel Reyes', role: 'Instructor' },
  card: { title: 'Instructor tip', sub: 'Courses with 3+ resources per module get higher completion.', pct: 0 },
  nav: [['Overview', '/instructor', 'grid'], ['My Courses', '/instructor#courses', 'bookopen'], ['Create Course', '/instructor/courses/new', 'plus'], ['Students', '#', 'users'],
    ['Analytics', '#', 'chart'], ['Messages', '/instructor/messages', 'msg', 4], ['Settings', '#', 'gear']],
}
export const ADMIN: ShellConfig = {
  home: '/admin', user: { name: 'Maya Patel', role: 'Administrator' }, card: null,
  nav: [['Overview', '/admin', 'grid'], ['Users', '#', 'users'], ['Instructors', '#', 'user'], ['Courses', '#', 'bookopen'], ['Course Approvals', '/admin#approvals', 'shield', 14],
    ['Categories', '#', 'layers'], ['Reports', '#', 'flag'], ['Settings', '#', 'gear']],
}
