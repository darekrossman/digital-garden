import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { Box, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useGlitch } from './glitch'

interface MarkdownProps {
  children: string
  className?: string
  regenerateKey: number
  align?: 'left' | 'center' | 'right'
}

// const colors = ['black', 'blue', 'green', 'red', 'yellow', 'gray', ]
// const colors = ['black', 'orange.700', 'fuchsia.700', 'cyan.200', 'lime.700']
const colors = ['white', 'black']

/**
 * Convert markdown string to React components
 */
export function Markdown({ regenerateKey, align = 'left', children }: MarkdownProps) {
  const glitchRef = useGlitch(regenerateKey, 0.05)

  const [makeWild, setMakeWild] = useState(() => Math.random() < 1)

  useEffect(() => {
    setMakeWild(Math.random() < 0.4)
  }, [regenerateKey])

  const randomFont = useMemo(() => {
    return token(`fonts.${getRandomFontFamily({ majorMono: 0.2, mono: 0.8 })}` as Token)
  }, [regenerateKey])

  const randomColor = useMemo(() => {
    const colorToken = colors[getRandomInt(0, colors.length - 1)]
    return token(`colors.${colorToken}` as Token)
  }, [regenerateKey])

  const randomGap = useMemo(() => {
    return getRandomInt(4, 12)
  }, [regenerateKey])

  const randomScale = useMemo(() => {
    return Math.random() * 0.4 + 0.8
  }, [regenerateKey])

  const xOffset = (460 - 460 / randomScale) / 2

  return (
    <div ref={glitchRef}>
      <Stack
        style={{
          textAlign: align,
          gap: randomGap,
          transform: `scale(${randomScale})`,
          marginLeft: align === 'left' ? xOffset : 0,
          marginRight: align === 'right' ? xOffset : 0,
        }}
        suppressHydrationWarning
      >
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
                          color:
                            Math.random() < 0.1
                              ? Math.random() < 0.5
                                ? 'white'
                                : 'black'
                              : regenerateKey % 2 === 0
                                ? 'white'
                                : 'black',
                          overflowWrap: 'normal',
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
                    overflowWrap: 'normal',
                    ...(makeWild && {
                      fontSize: '68px',
                      lineHeight: '58px',
                      fontFamily: token('fonts.pixel'),
                      color: regenerateKey % 2 !== 0 ? 'white' : 'black',
                      letterSpacing: regenerateKey % 2 !== 0 ? '0' : '-6px',
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
                    color:
                      Math.random() < 0.1 ? (Math.random() < 0.5 ? 'white' : 'black') : randomColor,
                    opacity: Math.random() * 0.3 + 0.7,
                    // lineHeight: makeWild ? '95%' : '100%',
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
      </Stack>
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
