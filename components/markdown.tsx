import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
}

// const colors = ['black', 'blue', 'green', 'red', 'yellow', 'gray', ]
const colors = ['black', 'gray', 'blue']

/**
 * Convert markdown string to React components
 */
export function Markdown({ children }: MarkdownProps) {
  // Save makeWild and only update when children changes
  const [makeWild, setMakeWild] = useState(() => Math.random() < 1)
  useEffect(() => {
    setMakeWild(Math.random() < 0.2)
  }, [children])

  return (
    <ReactMarkdown
      components={{
        h1: ({ children, node, ...props }) => {
          return (
            <styled.h1
              {...props}
              style={
                makeWild
                  ? {
                      fontSize: '100px',
                      lineHeight: '80px',
                      fontFamily: token('fonts.pixel'),
                      color: 'red',
                    }
                  : {}
              }
            >
              {children}
            </styled.h1>
          )
        },
        h2: ({ children, node, ...props }) => {
          return (
            <styled.h2
              {...props}
              style={{
                fontFamily: token(
                  `fonts.${getRandomFontFamily({ majorMono: 0.2, mono: 0.8 })}` as Token,
                ),
                ...(makeWild && {
                  fontSize: '88px',
                  lineHeight: '80px',
                  fontFamily: token('fonts.pixel'),
                  color: 'black',
                }),
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
            <styled.p
              {...props}
              style={{
                opacity: Math.random() * 0.2 + 1,
                lineHeight: `${getRandomInt(95, 105)}%`,
                transform: Math.random() < 0.01 ? 'scaleX(20)' : 'none',
              }}
            >
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
