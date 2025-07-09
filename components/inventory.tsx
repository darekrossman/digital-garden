import { inventoryObjects } from '@/lib/constants'
import { Box, Grid, Stack, styled } from '@/styled-system/jsx'
import { Dialog, VisuallyHidden } from 'radix-ui'
import { useEffect, useRef, useState } from 'react'
import { Panel } from './ui/panel'
import { useGame } from './game-context'
import { slugify } from '@/lib/helpers'
import { convertToGrayscale, pixelate } from '@/lib/image-processing'
import { css } from '@/styled-system/css'

const StyledContent = styled(Dialog.Content, {
  base: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    w: 'full',
    h: 'full',
    maxW: '800px',
    maxH: '500px',
    _focus: {
      outline: 'none',
    },
  },
})

export const InventoryDialog = () => {
  const { theme } = useGame()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && event.ctrlKey) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay
        className={css({
          position: 'fixed',
          top: '0',
          left: '0',
          w: 'full',
          h: 'full',
          bg: 'rgba(0, 0, 0, 0.5)',
        })}
      />
      <StyledContent>
        <Panel p="8" w="full" h="full" boxShadow="8px 8px 0px {var(--primary)/50}">
          <Stack gap="8" h="full">
            <Dialog.Title>
              <styled.span fontSize="16px" bg="var(--primary)" color="var(--screen-bg)">
                Inventory
              </styled.span>
            </Dialog.Title>
            {/* <Dialog.Close>Close</Dialog.Close> */}
            <VisuallyHidden.Root asChild>
              <Dialog.Description>Inventory</Dialog.Description>
            </VisuallyHidden.Root>

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
          </Stack>
        </Panel>
      </StyledContent>
    </Dialog.Root>
  )
}

const ImageCanvas = ({ src }: { src: string }) => {
  const { theme } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = 64

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size)
        const processedData = pixelate(convertToGrayscale(imageData, theme.primary), 2)
        ctx.putImageData(processedData, 0, 0)
      }
    }
  }, [src])

  return (
    <canvas
      width={size}
      height={size}
      ref={canvasRef}
      className={css({
        filter: 'brightness(1.3)',
      })}
    />
  )
}
