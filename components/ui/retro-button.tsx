import { styled, type HTMLStyledProps } from '@/styled-system/jsx'

export const RetroButton = (props: HTMLStyledProps<'button'>) => {
  return (
    <styled.button
      position="relative"
      display="flex"
      gap="2"
      p={{ base: '4', md: '5' }}
      fontSize={{ base: '14px', md: '16px' }}
      lineHeight="1.25"
      textAlign="left"
      border="1px solid {var(--primary)}"
      boxShadow="4px 4px 0px {var(--primary)/35}"
      cursor="pointer"
      _hover={{
        bg: 'var(--primary)',
        color: 'var(--screen-bg)',
      }}
      _active={
        {
          // border: '3px inset {colors.black/60}',
        }
      }
      {...props}
    />
  )
}
