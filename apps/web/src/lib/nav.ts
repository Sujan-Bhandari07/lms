export type NavItem = [label: string, href: string, icon: string]
export interface ShellConfig {
  nav: NavItem[]
  role: 'student' | 'tutor' | 'admin'
  home: string
}

export const STUDENT: ShellConfig = {
  home: '/dashboard',
  role: 'student',
  nav: [
    ['Dashboard', '/dashboard', 'grid'],
    ['AI workspace', '/ai-workspace', 'spark'],
    ['Messages', '/messages', 'msg'],
    ['Profile', '/profile', 'user'],
  ],
}

export const INSTRUCTOR: ShellConfig = {
  home: '/instructor',
  role: 'tutor',
  nav: [
    ['Overview', '/instructor', 'grid'],
    ['Create course', '/instructor/courses/new', 'plus'],
    ['Messages', '/instructor/messages', 'msg'],
    ['Profile', '/instructor/profile', 'user'],
  ],
}

export const ADMIN: ShellConfig = {
  home: '/admin',
  role: 'admin',
  nav: [
    ['Course approvals', '/admin', 'shield'],
  ],
}
