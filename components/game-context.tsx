'use client'

import { createSystemPrompt } from '@/lib/rpg-prompts'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GameContextType {
  messages: RPGMessage[]
  addMessage: (message: RPGMessage) => void
  lastUserMessage: string | undefined
  isStarted: boolean
  startGame: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [isStarted, setIsStarted] = useState(false)
  const [messages, setMessages] = useState<RPGMessage[]>([])

  useEffect(() => {
    setMessages([
      { id: 0, role: 'system', content: createSystemPrompt() },
      { id: 0, role: 'user', content: `Begin the story.` },
    ])
  }, [])

  const lastUserMessage = useMemo(() => {
    const msg = messages.findLast((message) => message.role === 'user')
    if (msg?.id === 0) {
      return undefined // we dont want to show the initial message
    }
    return msg?.content
  }, [messages])

  const addMessage = (message: RPGMessage) => {
    setMessages((prev) => [...prev, message])
  }

  const startGame = () => {
    setIsStarted(true)
  }

  const value: GameContextType = {
    messages,
    addMessage,
    lastUserMessage,
    isStarted,
    startGame,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
