import { css } from '@/styled-system/css'
import { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { getRandomInt } from './helpers'

interface MarkdownProps {
  children: string
  className?: string
}

/**
 * Convert markdown string to React components
 */
export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          pre: ({ children, node, ...props }) => (
            <pre
              {...props}
              className={css({
                lineHeight: '1',
              })}
            >
              {children}
            </pre>
          ),
          code: ({ children }) => {
            const colors = ['blue', 'green', 'red', 'yellow', 'gray', 'black']

            const bg = colors[getRandomInt(0, colors.length - 1)]
            const fg = bg === 'yellow' ? 'black' : 'white'

            return (
              <code
                className={css({
                  bg: 'var(--bg)',
                  color: 'var(--fg)',
                  overflow: 'hidden',
                  fontFamily: 'mono',
                  fontSize: 'sm',
                })}
                style={{
                  ['--bg' as string]: bg,
                  ['--fg' as string]: fg,
                }}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Create custom renderers for markdown components
 */
export function createMarkdownOptions(
  components: Record<string, React.ComponentType<any> | React.ElementType>,
) {
  return {
    components,
  }
}
