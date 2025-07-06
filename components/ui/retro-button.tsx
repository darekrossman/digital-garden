import { styled, type HTMLStyledProps } from '@/styled-system/jsx'

export const RetroButton = (props: HTMLStyledProps<'button'>) => {
  return (
    <styled.button
      position="relative"
      display="flex"
      gap="2"
      py="3"
      px="4"
      fontSize="16px"
      lineHeight="1.25"
      textAlign="left"
      color="black"
      bg="white/60"
      border="3px outset {colors.black/60}"
      cursor="pointer"
      _hover={{
        bg: 'white/40',
      }}
      _active={{
        border: '3px inset {colors.black/60}',
      }}
      {...props}
    />
  )
}
