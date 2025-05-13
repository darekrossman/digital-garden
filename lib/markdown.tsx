import { css } from '@/styled-system/css'
import { Stack, styled } from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'
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
    <ReactMarkdown
      components={{
        h1: ({ children, node, ...props }) => {
          return <styled.h1 {...props}>{children}</styled.h1>
        },
        h2: ({ children, node, ...props }) => {
          return <styled.h2 {...props}>{children}</styled.h2>
        },
        h3: ({ children, node, ...props }) => {
          return <styled.h3 {...props}>{children}</styled.h3>
        },
        h4: ({ children, node, ...props }) => {
          return <styled.h4 {...props}>{children}</styled.h4>
        },
        h5: ({ children, node, ...props }) => {
          return <styled.h5 {...props}>{children}</styled.h5>
        },

        pre: ({ children, node, ...props }) => {
          return (
            <styled.pre
              {...props}
              lineHeight="1"
              fontFamily="mono"
              bg="var(--prebg)"
              style={{
                ['--prebg' as string]: Math.random() < 0.1 ? 'black' : 'transprent',
              }}
            >
              {children}
            </styled.pre>
          )
        },

        code: ({ children }) => {
          const colors = ['blue', 'green', 'red', 'yellow', 'gray', 'black']
          const bg = colors[getRandomInt(0, colors.length - 1)]
          const fg = bg === 'yellow' ? 'black' : 'white'

          return (
            <styled.code
              overflow="hidden"
              fontFamily="mono"
              fontSize="sm"
              className={css({
                bg: 'var(--bg)',
                color: 'var(--fg)',
              })}
              style={{
                ['--bg' as string]: bg,
                ['--fg' as string]: fg,
              }}
            >
              {children}
            </styled.code>
          )
        },
      }}
    >
      {children}
    </ReactMarkdown>
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
