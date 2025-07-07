import { Box, Flex, FlexProps } from '@/styled-system/jsx'

export const Panel = ({ children, ...props }: { children: React.ReactNode } & FlexProps) => {
  return (
    <Flex
      flexDirection="column"
      border="1px solid {var(--primary)}"
      boxShadow={{ md: '8px 8px 0px {var(--primary)/15}' }}
      overflow="hidden"
      {...props}
    >
      {children}
    </Flex>
  )
}
