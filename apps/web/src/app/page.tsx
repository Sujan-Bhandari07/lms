import Link from 'next/link'
import Avatar from '@/src/components/Avatar'
import CourseCard from '@/src/components/CourseCard'
import { I, Stars } from '@/src/components/Icon'
import Search from '@/src/components/Search'
import SectionHead from '@/src/components/SectionHead'
import { courses } from '@/src/lib/courses'

const SEC = 'py-12 md:py-16 lg:py-24'
const HOVER = 'transition duration-200 ease-ujyalo hover:-translate-y-0.5 hover:shadow-md'
const CATS = [['Web Development', '62', 'code'], ['Backend & Cloud', '38', 'server'], ['AI & Machine Learning', '45', 'cpu'], ['Data Science', '31', 'chart'], ['UI/UX Design', '27', 'layers'], ['Business & Product', '24', 'brief']]
const FEATURED = ['nestjs-backend-development', 'nextjs-full-stack-apps', 'python-for-ai', 'machine-learning-foundations'].map((s) => courses.find((c) => c.id === s)!)
const INSTRUCTORS = [['Daniel Reyes', 'Senior Backend Engineer', 6, '31k', 4.9], ['Sarah Okafor', 'Full-Stack Developer', 9, '52k', 4.8], ['Priya Raman', 'AI Research Engineer', 5, '44k', 4.9], ['Marcus Lindqvist', 'Machine Learning Lead', 7, '28k', 4.7]] as const
const QUOTES = [
  ['Aarav Khadka', 'Backend Developer', 'The curriculum is perfectly sequenced. I finished the NestJS course in five weeks and shipped my first production API.'],
  ['Elena Marsh', 'Data Analyst', 'The AI assistant pointed me to the exact timestamp whenever I got stuck. It feels like a study partner who has watched every lesson.'],
  ['James Tan', 'Product Manager', 'I earned my Python for AI certificate while working full-time. Learning at my own pace made all the difference.'],
]

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-linear-to-b from-surface to-page to-[85%] py-14 lg:pt-24 lg:pb-20">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div>
            <span className="inline-flex h-7 items-center gap-2 rounded-full border border-line bg-page px-3 text-[13px] leading-none text-muted"><I n="spark" c="size-4 text-gold" />Self-paced courses with an AI learning assistant</span>
            <h1 className="t-display my-6">Learn Skills That <em className="not-italic shadow-[inset_0_-.18em_0_var(--gold)]">Move You</em> Forward.</h1>
            <p className="t-lead max-w-[520px]">Master practical, career-ready skills through structured online courses, recorded video lessons, hands-on quizzes and AI-powered learning support, at your own pace.</p>
            <Search action="/courses" placeholder="Search courses, e.g. NestJS, Python, Machine Learning" />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span>Popular:</span>
              {['Next.js', 'Python for AI', 'NestJS', 'Machine Learning'].map((t) => <Link key={t} href={`/courses?q=${encodeURIComponent(t)}`} className="rounded-full border border-line bg-page px-2.5 py-0.5 text-ink hover:bg-surface">{t}</Link>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-p btn-lg max-sm:flex-1" href="/courses">Explore Courses<I n="arrow" c="s" /></Link>
              <Link className="btn btn-s btn-lg max-sm:flex-1" href="#ai"><I n="play" c="s" />See How It Works</Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 max-sm:gap-x-6">
              {[['240+', 'Structured courses'], ['48k', 'Active learners'], ['4.8', 'Average rating']].map(([b, s]) => (
                <div key={s}><b className="block font-display text-[28px] leading-none font-bold tracking-[-0.02em]">{b}</b><span className="text-[13px] text-muted">{s}</span></div>
              ))}
            </div>
          </div>
          <div className="relative hidden max-w-[520px] sm:block">
            <div role="img" aria-label="Learner studying a recorded course lesson" className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-card border border-line bg-ph3 text-muted">
              <svg className="absolute inset-0 size-full text-ink"><rect width="100%" height="100%" fill="url(#dots)" /></svg>
              <I n="play" c="size-14 [stroke-width:1]" />
            </div>
            <div className="absolute bottom-12 -left-2 w-[250px] rounded-card border border-line bg-page p-4 shadow-md lg:-left-8">
              <small className="block text-xs leading-[18px] font-medium text-muted">Continue learning</small>
              <strong className="text-sm leading-[22px] font-semibold">NestJS Backend Development</strong>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface"><i className="block h-full w-[68%] rounded-full bg-gold" /></div>
              <small className="mt-2 block text-xs leading-[18px] font-medium text-muted">Lesson 17 of 25 · 68% complete</small>
            </div>
            <div className="absolute top-10 -right-2 flex items-center gap-3 rounded-card border border-line bg-page p-4 shadow-md lg:-right-4">
              <div className="grid size-10 place-items-center rounded-full bg-gold-tint text-gold-deep"><I n="award" /></div>
              <div><strong className="block text-sm leading-[22px] font-semibold">Certificate earned</strong><small className="text-xs leading-[18px] font-medium text-muted">Python for AI</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className={SEC}><div className="wrap">
        <SectionHead over="Categories" title="Popular categories to build your next skill" link="Browse all categories" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATS.map(([n, k, ic]) => (
            <Link key={n} href="/courses" className={`card flex items-center gap-5 p-6 ${HOVER}`}>
              <span className="grid size-[52px] shrink-0 place-items-center rounded-xl bg-surface"><I n={ic} c="l" /></span>
              <div><h3 className="t-h4 !text-lg !leading-[26px]">{n}</h3><p className="text-sm leading-[22px] text-muted">{k} courses</p></div>
              <I n="arrow" c="s ml-auto text-muted" />
            </Link>
          ))}
        </div>
      </div></section>

      {/* Featured courses */}
      <section id="courses" className={`bg-surface ${SEC}`}><div className="wrap">
        <SectionHead over="Featured courses" title="Structured learning, led by working practitioners" link="View all courses" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{FEATURED.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        <div className="mt-12 flex justify-center"><Link className="btn btn-s btn-lg" href="/courses">Explore All Courses</Link></div>
      </div></section>

      {/* Instructors */}
      <section id="instructors" className={SEC}><div className="wrap">
        <SectionHead over="Instructors" title="Learn from experts who publish world-class courses" link="Become an Instructor" href="#" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {INSTRUCTORS.map(([n, r, c, s, rt]) => (
            <Link key={n} href="#" className={`card px-6 py-8 text-center ${HOVER}`}>
              <Avatar name={n} className="mx-auto mb-5 size-[88px] text-[26px] !shadow-[0_0_0_4px_var(--bg),0_0_0_5px_var(--gold)]" />
              <h3 className="t-h4 !text-lg !leading-[26px]">{n}</h3><p className="text-sm text-muted">{r}</p>
              <div className="mt-5 flex justify-center gap-5 border-t border-line pt-5 text-[13px] text-muted">
                {[[c, 'Courses'], [s, 'Students'], [rt, 'Rating']].map(([v, l]) => <div key={l}><b className="block text-base leading-6 font-semibold text-ink">{v}</b>{l}</div>)}
              </div>
            </Link>
          ))}
        </div>
      </div></section>

      {/* AI assistant */}
      <section id="ai" className="pb-12 md:pb-16 lg:pb-24"><div className="wrap">
        <div className="grid items-center gap-10 rounded-card bg-panel p-8 text-white max-sm:px-5 lg:grid-cols-2 lg:gap-16 lg:p-16">
          <div>
            <span className="over !text-gold">AI Learning Assistant</span>
            <h2 className="mt-4 mb-5 font-display text-[30px] leading-[38px] font-bold tracking-[-0.02em] !text-white sm:text-[40px] sm:leading-[48px]">Stuck on a lesson? Ask Ujyalo AI.</h2>
            <p className="text-base leading-[26px] text-[#B9B5AC] sm:text-lg sm:leading-[30px]">An AI learning aid built into every course. It answers questions from the lesson you’re watching and points you to the exact moment in the video.</p>
            <ul className="my-8 grid gap-4">
              {['Instant answers grounded in course lessons', 'Lesson summaries and timestamped references', 'Practice quizzes generated from what you’ve studied'].map((t) => <li key={t} className="flex gap-3 text-[15px] text-[#E8E4DB]"><I n="check" c="mt-[3px] text-gold" />{t}</li>)}
            </ul>
            <Link className="btn btn-lg border-[#F5F2EC] bg-[#F5F2EC] text-[#111] hover:bg-white" href="#">Try the AI Assistant</Link>
          </div>
          <div role="img" aria-label="Example conversation with the Ujyalo AI assistant" className="grid gap-3 rounded-card bg-page p-5 text-ink">
            <div className="flex items-center gap-2.5 border-b border-line pb-3.5 text-sm font-semibold">
              <span className="grid size-8 place-items-center rounded-full bg-btn text-gold"><I n="spark" c="s" /></span>Ujyalo AI<span className="bdg bdg-gold ml-auto">AI</span>
            </div>
            <div className="ml-auto max-w-[88%] rounded-xl border border-line bg-page px-4 py-3 text-sm leading-[22px]">What’s the difference between a guard and an interceptor in NestJS?</div>
            <div className="max-w-[88%] rounded-xl bg-surface px-4 py-3 text-sm leading-[22px]">
              <small className="mb-1 block text-[11px] font-semibold tracking-[0.08em] text-muted">AI</small>
              Guards decide whether a request may proceed, such as authentication. Interceptors wrap the handler to transform requests or responses.<br />
              {['Lesson 9 · 04:12', 'Lesson 11 · 12:40'].map((t) => <span key={t} className="mt-2 mr-1.5 inline-flex items-center gap-1 rounded-full bg-gold-tint px-2.5 py-0.5 text-xs leading-[18px] font-semibold text-gold-deep"><I n="play" c="s" />{t}</span>)}
            </div>
            <div className="ml-auto max-w-[88%] rounded-xl border border-line bg-page px-4 py-3 text-sm leading-[22px]">Quiz me on this.</div>
          </div>
        </div>
      </div></section>

      {/* Testimonials */}
      <section className={`bg-surface ${SEC}`}><div className="wrap">
        <SectionHead over="Student stories" title="Learners moving forward, one lesson at a time" />
        <div className="grid gap-6 lg:grid-cols-3">
          {QUOTES.map(([n, r, q], i) => (
            <figure key={n} className={`card m-0 flex flex-col gap-5 p-8 ${i === 2 ? 'md:max-lg:col-span-full' : ''}`}>
              <Stars /><p>“{q}”</p>
              <div className="mt-auto flex items-center gap-3 border-t border-line pt-5">
                <Avatar name={n} ring={false} className="size-11 text-sm" />
                <div><b className="block text-sm leading-5 font-semibold">{n}</b><span className="text-[13px] text-muted">{r}</span></div>
              </div>
            </figure>
          ))}
        </div>
      </div></section>

      {/* Final CTA */}
      <section className={SEC}><div className="wrap">
        <div className="rounded-card border border-line bg-surface px-5 py-14 text-center sm:px-6 sm:py-24">
          <span className="over">Start today</span>
          <h2 className="mx-auto my-4 max-w-[640px] font-display text-[30px] leading-[38px] font-bold tracking-[-0.02em] sm:text-[40px] sm:leading-[48px]">Your next skill is one course away.</h2>
          <p className="mx-auto mb-8 max-w-[480px] text-base text-muted sm:text-lg">Join thousands of learners building practical skills with structured, self-paced courses.</p>
          <div className="flex flex-wrap justify-center gap-3"><Link className="btn btn-p btn-lg" href="#">Get Started</Link><Link className="btn btn-s btn-lg" href="/courses">Explore Courses</Link></div>
        </div>
      </div></section>
    </main>
  )
}
