'use client'

import { createSystemPrompt } from '@/lib/rpg-prompts'
import { Plot } from '@/lib/rpg-schemas'
import { generatePlot } from './inference/generate-plot'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GameContextType {
  messages: RPGMessage[]
  sceneDescription: string
  imagePrompt: string
  lastUserMessage: string | undefined
  isStarted: boolean
  isLoading: boolean
  plot: Plot | undefined
  isGeneratingPlot: boolean
  currentScreen: 'chat' | 'inventory'
  setCurrentScreen: (screen: 'chat' | 'inventory') => void
  theme: {
    screenBg: string
    primary: string
  }
  setIsLoading: (isLoading: boolean) => void
  setSceneDescription: (sceneDescription: string) => void
  setImagePrompt: (imagePrompt: string) => void
  addMessage: (message: RPGMessage) => void
  startGame: () => void
  setTheme: (theme: { screenBg: string; primary: string }) => void
  generatePlot: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({
  theme,
  children,
}: { theme?: { screenBg: string; primary: string }; children: ReactNode }) {
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<RPGMessage[]>([])
  const [sceneDescription, setSceneDescription] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [plot, setPlot] = useState<Plot | undefined>()
  const [isGeneratingPlot, setIsGeneratingPlot] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<'chat' | 'inventory'>('chat')

  const [_theme, setTheme] = useState(
    theme || {
      screenBg: 'black',
      primary: 'rgb(255, 165, 0)',
    },
  )

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

  const initializeGame = async () => {
    setIsGeneratingPlot(true)
    const plot = await generatePlot()

    setPlot(plot)

    console.log(plot)

    const systemPrompt = createSystemPrompt(plot)

    setMessages([
      { id: 0, role: 'system', content: systemPrompt },
      { id: 0, role: 'user', content: `Begin the story.` },
    ])

    setIsGeneratingPlot(false)
    startGame()
  }

  const value: GameContextType = {
    messages,
    addMessage,
    lastUserMessage,
    isStarted,
    isLoading,
    setIsLoading,
    startGame,
    theme: _theme,
    setTheme,
    sceneDescription,
    setSceneDescription,
    imagePrompt,
    setImagePrompt,
    plot,
    generatePlot: initializeGame,
    isGeneratingPlot,

    currentScreen: 'chat',
    setCurrentScreen: (screen: 'chat' | 'inventory') => {
      setCurrentScreen(screen)
    },
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
