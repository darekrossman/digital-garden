import { styled } from '@/styled-system/jsx'
import { Dialog, Tabs, VisuallyHidden } from 'radix-ui'
import { useCallback, useEffect, useState } from 'react'
import { Panel } from './ui/panel'
import { useGame } from './game-context'
import { css } from '@/styled-system/css'
import { InventoryTab } from './tab-inventory'
import { ContactsTab } from './tab-contacts'
import { LogsTab } from './tab-logs'
import { SettingsTab } from './tab-settings'
import { ProfileTab } from './tab-profile'

const DialogContent = styled(Dialog.Content, {
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

const TabContent = styled(Tabs.Content, {
  base: {
    flex: 1,
    overflow: 'hidden',
  },
})

export const InfoDialog = () => {
  const { infoDialogOpen, setInfoDialogOpen } = useGame()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'i' && event.ctrlKey) {
        event.preventDefault()
        setInfoDialogOpen((prev) => !Boolean(prev))
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const open = Boolean(infoDialogOpen)

  return (
    <Dialog.Root open={open} onOpenChange={setInfoDialogOpen}>
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
      <DialogContent>
        <Panel p="8" w="full" h="full" boxShadow="8px 8px 0px {var(--primary)/50}">
          {/* <Dialog.Close>Close</Dialog.Close> */}

          <Tabs.Root
            defaultValue={typeof infoDialogOpen === 'string' ? infoDialogOpen : 'inventory'}
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '12',
              h: 'full',
            })}
          >
            <Tabs.List
              className={css({
                display: 'flex',
                gap: '6',
                '& > button': {
                  fontSize: '16px',
                  cursor: 'pointer',
                  _focus: {
                    outline: 'none',
                  },
                  '&[data-state="active"]': {
                    bg: 'var(--primary)',
                    color: 'var(--screen-bg)',
                  },
                },
              })}
            >
              <Tabs.Trigger value="inventory">Inventory</Tabs.Trigger>
              <Tabs.Trigger value="contacts">Contacts</Tabs.Trigger>
              <Tabs.Trigger value="logs">Logs</Tabs.Trigger>
              <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>

            <TabContent value="inventory">
              <InventoryTab />
            </TabContent>
            <TabContent value="contacts">
              <ContactsTab />
            </TabContent>
            <TabContent value="logs">
              <LogsTab />
            </TabContent>
            <TabContent value="profile">
              <ProfileTab />
            </TabContent>
            <TabContent value="settings">
              <SettingsTab />
            </TabContent>
          </Tabs.Root>
        </Panel>

        <VisuallyHidden.Root asChild>
          <Dialog.Title>Info</Dialog.Title>
        </VisuallyHidden.Root>
        <VisuallyHidden.Root asChild>
          <Dialog.Description>Info</Dialog.Description>
        </VisuallyHidden.Root>
      </DialogContent>
    </Dialog.Root>
  )
}
