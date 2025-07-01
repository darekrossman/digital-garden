import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
  regenerateKey: number
}

// const colors = ['black', 'blue', 'green', 'red', 'yellow', 'gray', ]
// const colors = ['black', 'orange.700', 'fuchsia.700', 'cyan.200', 'lime.700']
const colors = ['white', 'black']

/**
 * Convert markdown string to React components
 */
export function Markdown({ regenerateKey, children }: MarkdownProps) {
  // Save makeWild and only update when children changes
  const [makeWild, setMakeWild] = useState(() => Math.random() < 1)

  useEffect(() => {
    setMakeWild(Math.random() < 0.4)
  }, [])

  const randomFont = useMemo(() => {
    return token(`fonts.${getRandomFontFamily({ majorMono: 0.2, mono: 0.8 })}` as Token)
  }, [regenerateKey])

  const randomColor = useMemo(() => {
    const colorToken = colors[getRandomInt(0, colors.length - 1)]
    return token(`colors.${colorToken}` as Token)
  }, [regenerateKey])

  return (
    <ReactMarkdown
      components={{
        h1: ({ children, node, ...props }) => {
          return (
            <styled.h1
              {...props}
              fontFamily="pixel"
              style={
                makeWild
                  ? {
                      fontSize: '100px',
                      lineHeight: '80px',
                      color: regenerateKey % 2 === 0 ? 'white' : 'black',
                      textWrap: 'balance',
                      whiteSpace: 'nowrap',
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
                fontFamily: randomFont,
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
          return (
            <styled.h3 {...props} fontFamily="pixel">
              {children}
            </styled.h3>
          )
        },
        h4: ({ children, node, ...props }) => {
          return (
            <styled.h4 {...props} fontFamily="pixel" style={{ color: randomColor }}>
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
              fontFamily="mono"
              style={{
                color: randomColor,
                opacity: Math.random() * 0.2 + 1,
                lineHeight: makeWild ? '95%' : '100%',
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
              lineHeight="1.1em"
              fontSize="sm"
              fontFamily="mono"
              textWrap="auto"
            >
              {children}
            </styled.pre>
          )
        },

        code: ({ children }) => {
          const bg = regenerateKey % 2 === 0 ? 'black' : 'white'
          const fg = bg === 'black' ? 'white' : 'black'

          return (
            <styled.code
              overflow="hidden"
              fontFamily="mono"
              fontSize="sm"
              className={css({
                bg: 'var(--bg)',
                color: 'var(--fg)',
              })}
              style={
                {
                  ['--bg']: token(`colors.${bg}` as Token),
                  ['--fg']: token(`colors.${fg}` as Token),
                } as React.CSSProperties
              }
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
