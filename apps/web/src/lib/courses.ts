export type Level = 'Beginner' | 'Intermediate' | 'Advanced'
export interface Course {
  slug: string; title: string; instructor: string; category: string; level: Level
  rating: number; students: number; minutes: number; price: number; was?: number; badge?: string; order: number
}

export const courses: Course[] = [
  { slug: 'nestjs-backend-development', title: 'NestJS Backend Development', instructor: 'Daniel Reyes', category: 'Programming', level: 'Intermediate', rating: 4.9, students: 12480, minutes: 860, price: 64, was: 99, badge: 'New', order: 12 },
  { slug: 'nextjs-full-stack-apps', title: 'Next.js: Build Full-Stack Apps', instructor: 'Sarah Okafor', category: 'Web Development', level: 'Intermediate', rating: 4.8, students: 18260, minutes: 1005, price: 59, was: 89, badge: 'Bestseller', order: 10 },
  { slug: 'python-for-ai', title: 'Python for AI: From Zero to Models', instructor: 'Priya Raman', category: 'AI & ML', level: 'Beginner', rating: 4.9, students: 26900, minutes: 1090, price: 69, badge: 'Premium', order: 7 },
  { slug: 'machine-learning-foundations', title: 'Machine Learning Foundations', instructor: 'Marcus Lindqvist', category: 'AI & ML', level: 'Advanced', rating: 4.7, students: 9730, minutes: 1350, price: 79, order: 5 },
  { slug: 'ui-ux-design-fundamentals', title: 'UI/UX Design Fundamentals', instructor: 'Lena Fischer', category: 'Design', level: 'Beginner', rating: 4.8, students: 14320, minutes: 540, price: 49, order: 4 },
  { slug: 'design-systems-in-figma', title: 'Design Systems in Figma', instructor: 'Omar Haddad', category: 'Design', level: 'Intermediate', rating: 4.7, students: 6210, minutes: 450, price: 54, order: 9 },
  { slug: 'product-management-essentials', title: 'Product Management Essentials', instructor: 'Grace Liu', category: 'Business', level: 'Beginner', rating: 4.6, students: 11050, minutes: 480, price: 39, order: 3 },
  { slug: 'financial-modeling-for-startups', title: 'Financial Modeling for Startups', instructor: 'Ravi Shankar', category: 'Business', level: 'Intermediate', rating: 4.7, students: 5480, minutes: 660, price: 59, order: 6 },
  { slug: 'typescript-mastery', title: 'TypeScript Mastery', instructor: 'Sarah Okafor', category: 'Programming', level: 'Intermediate', rating: 4.9, students: 21700, minutes: 720, price: 49, was: 69, badge: 'Bestseller', order: 8 },
  { slug: 'react-tailwind-modern-interfaces', title: 'React & Tailwind: Modern Interfaces', instructor: 'Tomás Silva', category: 'Web Development', level: 'Beginner', rating: 4.8, students: 23400, minutes: 780, price: 0, badge: 'Free', order: 2 },
  { slug: 'prompt-engineering-llm-apps', title: 'Prompt Engineering & LLM Apps', instructor: 'Priya Raman', category: 'AI & ML', level: 'Intermediate', rating: 4.8, students: 7820, minutes: 390, price: 44, badge: 'New', order: 11 },
  { slug: 'docker-kubernetes-essentials', title: 'Docker & Kubernetes Essentials', instructor: 'Daniel Reyes', category: 'Programming', level: 'Advanced', rating: 4.6, students: 8340, minutes: 900, price: 69, order: 1 },
]

export const categories: [string, string][] = [['Programming', 'code'], ['Web Development', 'globe'], ['AI & ML', 'cpu'], ['Design', 'layers'], ['Business', 'brief']]
export const categoryIcon = Object.fromEntries(categories) as Record<string, string>

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug)
export const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2)
export function fmtDur(m: number) {
  const h = Math.floor(m / 60), r = m % 60
  return h ? `${h}h${r ? ` ${r}m` : ''}` : `${r}m`
}

export type Lesson = [title: string, minutes: number, preview?: boolean]
export const curriculum: { title: string; lessons: Lesson[] }[] = [
  { title: 'Getting Started with NestJS', lessons: [['Course overview and project roadmap', 15, true], ['Setting up Node, TypeScript and the Nest CLI', 28, true], ['Anatomy of a NestJS application', 32], ['Your first endpoint', 25]] },
  { title: 'Controllers, Providers & Modules', lessons: [['Controllers and routing', 34], ['Providers and dependency injection', 42], ['Organizing code into modules', 38], ['Custom providers and scopes', 45], ['Checkpoint project: task API', 36]] },
  { title: 'Databases with TypeORM & PostgreSQL', lessons: [['Connecting to PostgreSQL', 40], ['Entities and migrations', 52], ['Relations and query builders', 48], ['Transactions and performance', 44], ['Repository pattern in practice', 46]] },
  { title: 'Authentication & Authorization', lessons: [['Password hashing and user signup', 38], ['JWT login and refresh tokens', 45], ['Guards and role-based access', 50], ['Securing your API', 42]] },
  { title: 'Validation, Testing & Error Handling', lessons: [['DTOs, pipes and class-validator', 30], ['Exception filters and interceptors', 36], ['Unit testing with Jest', 32], ['End-to-end testing', 28]] },
  { title: 'Deployment & Production', lessons: [['Containerizing with Docker', 12], ['Deploying to the cloud', 10], ['Next steps and course wrap-up', 12]] },
]

export const reviews = [
  { name: 'Aarav Khadka', when: '2 weeks ago', text: 'Perfectly sequenced. I shipped my first production API five weeks in. The testing module alone was worth the price.' },
  { name: 'Elena Marsh', when: '1 month ago', text: 'Daniel explains the why behind every pattern. The AI assistant linked me to the exact lesson moment whenever I got stuck.' },
  { name: 'Kofi Mensah', when: '1 month ago', text: 'Clear, calm and practical. I would love more on microservices, but the fundamentals here are rock solid.' },
  { name: 'Sofia Alvarez', when: '2 months ago', text: 'Finished the certificate while working full-time. The downloadable starter code kept me on track.' },
  { name: 'Ben Whitaker', when: '2 months ago', text: 'The authentication section is the best explanation of guards and JWT I’ve found.' },
  { name: 'Mei Lin', when: '3 months ago', text: 'Great structure, quizzes after each module, and a deployment lesson that actually works.' },
]

export interface Content { subtitle: string; outcomes: string[]; requirements: string[]; about: string[]; audience: string }
export const nestContent: Content = {
  subtitle: 'Learn to design, secure, test and deploy scalable REST APIs with NestJS, TypeScript and PostgreSQL, step by step through recorded lessons and real projects.',
  outcomes: ['Architect modular, scalable REST APIs with NestJS', 'Model relational data with TypeORM and PostgreSQL', 'Implement JWT authentication and role-based access', 'Validate requests with pipes, DTOs and class-validator', 'Write unit and end-to-end tests with Jest', 'Handle errors with exception filters and interceptors', 'Document your API automatically with Swagger', 'Containerize with Docker and deploy to the cloud'],
  requirements: ['Working knowledge of modern JavaScript (ES6+)', 'Node.js 20 or later and npm installed on your computer', 'A code editor such as VS Code. TypeScript basics are covered in a short refresher.'],
  about: ['NestJS brings structure to Node.js back ends. In this course you’ll build a complete task-management API from an empty folder to a live deployment, learning the framework’s architecture the way professional teams use it.', 'Each module combines concise recorded lessons, downloadable starter code and a checkpoint quiz. When you get stuck, the Ujyalo AI assistant answers questions from the lessons and links you to the exact moment in the video.'],
  audience: 'Front-end and full-stack developers moving into back-end work, Node.js developers who want a maintainable architecture, and students preparing for engineering roles.',
}
// Placeholder copy for courses that don't have full content yet. Replace with real data/CMS.
export const contentFor = (c: Course): Content =>
  c.slug === 'nestjs-backend-development' ? nestContent : {
    subtitle: `A structured, self-paced ${c.level.toLowerCase()} course in ${c.category} taught by ${c.instructor}, with recorded lessons, quizzes and a certificate.`,
    outcomes: ['Understand the core concepts step by step', 'Apply them in hands-on projects', 'Test your knowledge with module quizzes', 'Earn a certificate of completion'],
    requirements: ['No special equipment needed', 'Curiosity and a few hours each week'],
    about: [`${c.title} is a structured course designed for self-paced learning, combining concise recorded lessons, downloadable resources and checkpoint quizzes.`],
    audience: 'Learners who want a clear path from fundamentals to practical, job-ready skills.',
  }
