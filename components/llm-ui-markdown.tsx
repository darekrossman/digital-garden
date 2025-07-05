import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { Box, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
  regenerateKey?: number
}

export function Markdown({ regenerateKey = 1, children }: MarkdownProps) {
  const components: ComponentProps<typeof ReactMarkdown>['components'] = useMemo(() => {
    return {
      h1(props) {
        return <styled.h1 {...props} fontFamily="pixel" fontSize="22px" lineHeight="28px" />
      },
      h2(props) {
        return <styled.h2 {...props} fontFamily="pixel" fontSize="22px" lineHeight="28px" />
      },
      h3(props) {
        return <styled.h3 {...props} />
      },
      h4(props) {
        return <styled.h4 {...props} />
      },
      h5(props) {
        return <styled.h5 {...props} />
      },
      h6(props) {
        return <styled.h6 {...props} />
      },
      pre(props) {
        return <styled.pre {...props} />
      },
      code(props) {
        return (
          <styled.code
            {...props}
            // bg={reverse ? 'transparent' : 'red.500'}
            // color={reverse ? 'red.500' : 'white'}
          />
        )
      },
      p(props) {
        return <styled.p {...props} />
      },
      ul(props) {
        return <styled.ul {...props} />
      },
      ol(props) {
        return <styled.ol {...props} listStyleType="decimal" pl="2em" />
      },
      li(props) {
        return <styled.li {...props} />
      },
      blockquote(props) {
        return <styled.blockquote {...props} />
      },
      img(props) {
        return <styled.img {...props} />
      },
      a(props) {
        return <styled.a {...props} />
      },
      table(props) {
        return <styled.table {...props} />
      },
      tbody(props) {
        return <styled.tbody {...props} />
      },
      td(props) {
        return <styled.td {...props} />
      },
      tr(props) {
        return <styled.tr {...props} />
      },
      th(props) {
        return <styled.th {...props} />
      },
      hr(props) {
        const size = useMemo(() => {
          return Math.floor(Math.random() * 16 + 8)
        }, [regenerateKey])

        const length = useMemo(() => {
          return Math.floor(Math.random() * 8 + 1)
        }, [regenerateKey])

        return (
          <styled.pre
            key={regenerateKey}
            // lineHeight="24px"
            style={{
              fontSize: `${size}px`,
              color: 'white',
              // opacity: Math.random() * 0.5 + 0.5,
            }}
          >
            {Array.from({ length }).map((_, i) => {
              return <styled.span key={i}>✖</styled.span>
            })}
          </styled.pre>
        )
      },
    }
  }, [regenerateKey])

  return (
    <Box
      key={regenerateKey}
      fontSize="16px"
      lineHeight="1.6"
      className={css({
        // Typography spacing
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          marginTop: '1.5em',
          marginBottom: '0.75em',
          '&:first-child': {
            marginTop: 0,
          },
        },
        '& p': {
          marginBottom: '1em',
          '&:last-child': {
            marginBottom: 0,
          },
        },
        // List spacing
        '& ul, & ol': {
          marginBottom: '1em',
        },
        '& li': {
          marginBottom: '0.25em',
        },
        '& li > p': {
          marginBottom: '0.5em',
        },
        // Blockquote spacing
        '& blockquote': {
          marginTop: '1em',
          marginBottom: '2em',
          paddingLeft: '1em',
          borderLeft: '2px solid currentColor',
          opacity: 0.8,
        },
        // Code spacing
        '& pre': {
          marginTop: '1em',
          marginBottom: '1em',
          // padding: '0.75em',
          overflow: 'auto',
        },
        '& code': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          // padding: '0.125em 0.25em',
          // color: 'white',
          // backgroundColor: 'black',
        },
        '& pre code': {
          padding: 0,
          // color: 'red',
          // backgroundColor: 'rgba(255, 255, 255, 1)',
        },
        // Table spacing
        '& table': {
          marginTop: '1em',
          marginBottom: '1em',
          width: '100%',
          borderCollapse: 'collapse',
        },
        '& th, & td': {
          padding: '0.5em',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '& th': {
          fontWeight: 'bold',
        },
        // Horizontal rule spacing
        '& hr': {
          marginTop: '1.5em',
          marginBottom: '1.5em',
        },
        // Image spacing
        '& img': {
          marginTop: '1em',
          marginBottom: '1em',
          maxWidth: '100%',
          height: 'auto',
        },
        // Link styling
        '& a': {
          textDecoration: 'underline',
          textDecorationColor: 'rgba(255, 255, 255, 0.5)',
          '&:hover': {
            textDecorationColor: 'currentColor',
          },
        },
      })}
    >
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </Box>
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
