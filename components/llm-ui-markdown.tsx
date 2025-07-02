import { getRandomFontFamily, getRandomInt } from '@/lib/helpers'
import { css } from '@/styled-system/css'
import { Box, Stack, styled } from '@/styled-system/jsx'
import { Token, token } from '@/styled-system/tokens'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
  regenerateKey: number
  align?: 'left' | 'center' | 'right'
}

export function Markdown({ regenerateKey, children }: MarkdownProps) {
  return (
    <Stack>
      <ReactMarkdown
        components={{
          h1(props) {
            return <styled.h1 {...props} />
          },
          h2(props) {
            return <styled.h2 {...props} fontFamily="pixel" fontSize="32px" lineHeight="32px" />
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
            return <styled.pre {...props} lineHeight="1.1em" fontSize="sm" />
          },
          code(props) {
            return <styled.code {...props} bg="white" color="black" />
          },
          p(props) {
            return <styled.p {...props} />
          },
          ul(props) {
            return <styled.ul {...props} />
          },
          ol(props) {
            return <styled.ol {...props} />
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
          hr(props) {
            return <styled.hr {...props} />
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
        }}
      >
        {children}
      </ReactMarkdown>
    </Stack>
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
