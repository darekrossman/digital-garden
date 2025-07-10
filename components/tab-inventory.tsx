import { slugify } from '@/lib/helpers'
import { Grid, Stack, Box, styled } from '@/styled-system/jsx'
import { inventoryObjects } from '@/lib/constants'
import { useState } from 'react'
import { ImageCanvas } from './img-canvas'

export const InventoryTab = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  return (
    <Grid gridTemplateColumns="auto 1fr" gap="8" h="full">
      <Grid gridTemplateColumns="repeat(4, 66px)" gap="4" h="fit-content">
        {inventoryObjects.slice(0, 10).map((item) => (
          <Box
            key={item}
            role="button"
            border="1px solid var(--primary)"
            borderColor={
              !selectedItem
                ? 'var(--primary)'
                : selectedItem === item
                  ? 'var(--primary)'
                  : 'var(--primary)/50'
            }
            _hover={{ borderColor: 'var(--primary)' }}
            cursor="pointer"
            onClick={() => {
              setSelectedItem(item)
            }}
          >
            <ImageCanvas src={`/images/assets/${slugify(item)}.png`} />
          </Box>
        ))}
      </Grid>

      <Stack border="1px solid var(--primary)" p="4" h="full">
        <styled.span fontSize="16px">{selectedItem}</styled.span>
      </Stack>
    </Grid>
  )
}
