import { Box, HStack, styled } from '@/styled-system/jsx'
import { useGame } from './game-context'
import { Select, SelectItem } from './ui/select'
import { colors } from '@/lib/theme-utils'

export const SettingsTab = () => {
  const { theme, setTheme } = useGame()

  return (
    <HStack gap="4">
      <styled.p fontSize="16px">Theme:</styled.p>
      <Select
        value={theme.primaryColorLabel}
        onValueChange={(value) =>
          setTheme({
            ...theme,
            fg: colors[value as keyof typeof colors],
          })
        }
      >
        {Object.values(colors).map((color) => (
          <SelectItem key={color.label} value={color.label}>
            {color.label}
          </SelectItem>
        ))}
      </Select>
    </HStack>
  )
}
