import { css } from '@/styled-system/css'
import { Box, Center } from '@/styled-system/jsx'
import { Select as S } from 'radix-ui'

export const Select = ({ children, ...props }: S.SelectProps) => {
  return (
    <S.Root {...props}>
      <S.Trigger
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minW: '150px',
          h: '32px',
          cursor: 'pointer',
          fontSize: '16px',
          backgroundColor: 'var(--screen-bg)',
          border: '1px solid var(--primary)',
        })}
      >
        <Box px="8px">
          <S.Value placeholder="Select an option" />
        </Box>
        <Center h="full" aspectRatio="1">
          <S.Icon />
        </Center>
      </S.Trigger>

      <S.Content
        position="popper"
        sideOffset={-1}
        className={css({
          position: 'relative',
          minW: 'var(--radix-select-trigger-width)',
          overflow: 'hidden',
          backgroundColor: 'var(--screen-bg)',
          border: '1px solid var(--primary)',
        })}
      >
        <S.Viewport>{children}</S.Viewport>
      </S.Content>
    </S.Root>
  )
}

export const SelectItem = ({ children, ...props }: S.SelectItemProps) => {
  return (
    <S.Item
      {...props}
      className={css({
        cursor: 'pointer',
        backgroundColor: 'var(--screen-bg)',
        px: '8px',
        py: '4px',
        fontSize: '16px',
        _hover: {
          backgroundColor: 'var(--primary)',
          color: 'var(--screen-bg)',
        },
      })}
    >
      <S.ItemText>{children}</S.ItemText>
    </S.Item>
  )
}
