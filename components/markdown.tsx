import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
}

const colors = ['blue', 'green', 'red', 'yellow', 'gray', 'black']

/**
 * Convert markdown string to React components
 */
export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children, node, ...props }) => {
          return <styled.h1 {...props}>{children}</styled.h1>
        },
        h2: ({ children, node, ...props }) => {
          return (
            <styled.h2
              {...props}
              style={{
                fontFamily: token(
                  `fonts.${getRandomFontFamily({ majorMono: 0.2, mono: 0.8 })}` as Token,
                ),
              }}
            >
              {children}
            </styled.h2>
          )
        },
        h3: ({ children, node, ...props }) => {
          return <styled.h3 {...props}>{children}</styled.h3>
        },
        h4: ({ children, node, ...props }) => {
          return (
            <styled.h4
              {...props}
              fontFamily="pixel"
              style={{ color: colors[getRandomInt(0, colors.length - 1)] }}
            >
              {children}
            </styled.h4>
          )
        },
        h5: ({ children, node, ...props }) => {
          return <styled.h5 {...props}>{children}</styled.h5>
        },

        p: ({ children, node, ...props }) => {
          return (
            <styled.p {...props} style={{ opacity: Math.random() * 0.2 + 1 }}>
              {children}
            </styled.p>
          )
        },

        pre: ({ children, node, ...props }) => {
          return (
            <styled.pre
              {...props}
              lineHeight="1"
              fontFamily="mono"
              bg="var(--prebg)"
              style={{
                ['--prebg' as string]: Math.random() < 0.05 ? 'black' : 'transparent',
              }}
            >
              {children}
            </styled.pre>
          )
        },

        code: ({ children }) => {
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
