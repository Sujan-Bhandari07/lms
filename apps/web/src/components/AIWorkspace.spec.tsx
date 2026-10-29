import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownContent } from './AIWorkspace'

describe('MarkdownContent', () => {
  it('renders course catalog markdown, GFM tables, images, and escaped separators', () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        text={[
          '\\### Courses Available on Ujyalo',
          '',
          '**Full-Stack Web Development with AI**',
          '',
          '\\| Course \\| Image \\| Tech Stack \\| Price \\|',
          '\\| --- \\| --- \\| --- \\| --- \\|',
          '\\| Full Stack \\| [![Course image](https://res.cloudinary.com/demo/image/upload/course.jpg)](https://example.com/course) \\| TypeScript, NestJS, and a long description \\| NPR 111.23 \\|',
          '',
          '&#x20;Courses are available.',
        ].join('\n')}
      />,
    )

    expect(markup).toContain('<h3>Courses Available on Ujyalo</h3>')
    expect(markup).toContain('<strong>Full-Stack Web Development with AI</strong>')
    expect(markup).toContain('overflow-x-auto')
    expect(markup).toContain('<table')
    expect(markup).toContain('res.cloudinary.com/demo/image/upload/course.jpg')
    expect(markup).toContain('<img')
    expect(markup).toContain('Courses are available.')
    expect(markup).not.toContain('&#x20;')
    expect(markup).not.toContain('\\|')
  })

  it('renders links, lists, quotes, inline code, and fenced code without normalizing code contents', () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        text={[
          '1. First item',
          '2. Second item with *emphasis*',
          '',
          '> A useful note.',
          '',
          'Use `npm test`.',
          '',
          '[Documentation](https://example.com/docs)',
          '',
          '```ts',
          '\\### this is code, not a heading',
          'const value = `\\|`',
          '```',
        ].join('\n')}
      />,
    )

    expect(markup).toContain('<ol>')
    expect(markup).toContain('<em>emphasis</em>')
    expect(markup).toContain('<blockquote class="border-l-2 border-gold pl-4 text-muted">')
    expect(markup).toContain('href="https://example.com/docs"')
    expect(markup).toContain('<pre')
    expect(markup).toContain('\\### this is code, not a heading')
    expect(markup).toContain('const value = `\\|`')
  })

  it('does not render dangerous links or raw HTML', () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        text={'[unsafe](javascript:alert(1))\n\n<script>alert("x")</script>'}
      />,
    )

    expect(markup).not.toContain('href="javascript:')
    expect(markup).not.toContain('<script>')
  })

  it('does not make video playback links clickable', () => {
    const markup = renderToStaticMarkup(
      <MarkdownContent
        text={[
          '[Watch lesson](https://res.cloudinary.com/demo/video/upload/course/lesson.mp4)',
          '',
          '[Course details](https://ujyalo.example.com/courses/abc)',
          '',
          '![Course image](https://res.cloudinary.com/demo/image/upload/course.jpg)',
        ].join('\n')}
      />,
    )

    expect(markup).not.toContain('href="https://res.cloudinary.com/demo/video/upload')
    expect(markup).toContain('Watch lesson')
    expect(markup).toContain('href="https://ujyalo.example.com/courses/abc"')
    expect(markup).toContain('<img')
    expect(markup).toContain('https://res.cloudinary.com/demo/image/upload/course.jpg')
  })
})
