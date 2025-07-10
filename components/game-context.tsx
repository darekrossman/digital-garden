'use client'

import { createSystemPrompt } from '@/lib/rpg-prompts'
import { Plot } from '@/lib/rpg-schemas'
import { generatePlot } from './inference/generate-plot'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { colors } from '@/lib/theme-utils'

type RPGMessage = {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
}

type ThemeColor = {
  label: string
  value: string
}

type InfoTabs = 'inventory' | 'profile' | 'contacts' | 'settings' | 'logs'

interface GameContextType {
  messages: RPGMessage[]
  sceneDescription: string
  imagePrompt: string
  lastUserMessage: string | undefined
  isStarted: boolean
  isLoading: boolean
  plot: Plot | undefined
  isGeneratingPlot: boolean
  playerImage: string | undefined
  infoDialogOpen: InfoTabs | boolean
  theme: {
    screenBg: string
    primary: string
    primaryColorLabel: string
  }
  setPlayerImage: (playerImage: string) => void
  setIsLoading: (isLoading: boolean) => void
  setSceneDescription: (sceneDescription: string) => void
  setImagePrompt: (imagePrompt: string) => void
  addMessage: (message: RPGMessage) => void
  startGame: () => void
  setTheme: (theme: { bg?: ThemeColor; fg?: ThemeColor }) => void
  generatePlot: () => void
  setInfoDialogOpen: Dispatch<SetStateAction<InfoTabs | boolean>>
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<RPGMessage[]>([])
  const [sceneDescription, setSceneDescription] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [plot, setPlot] = useState<Plot | undefined>()
  const [isGeneratingPlot, setIsGeneratingPlot] = useState(false)
  const [playerImage, setPlayerImage] = useState<string | undefined>()
  const [infoDialogOpen, setInfoDialogOpen] = useState<InfoTabs | boolean>(false)

  const [_theme, _setTheme] = useState({
    bg: { label: 'black', value: 'rgb(0,0,0)' },
    fg: { label: 'black', value: 'rgb(0,0,0)' },
  })

  const theme = useMemo(() => {
    return {
      screenBg: _theme.bg.value,
      primary: _theme.fg.value,
      primaryColorLabel: _theme.fg.label,
    }
  }, [_theme])

  const setTheme = (theme: { bg?: ThemeColor; fg?: ThemeColor }) => {
    _setTheme((prev) => ({
      ...prev,
      ...theme,
    }))
  }

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      _setTheme(JSON.parse(theme))
    } else {
      _setTheme({ ..._theme, fg: colors.Orange })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(_theme))
  }, [_theme])

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
    theme,
    setTheme,
    sceneDescription,
    setSceneDescription,
    imagePrompt,
    setImagePrompt,
    plot,
    generatePlot: initializeGame,
    isGeneratingPlot,
    playerImage,
    setPlayerImage,
    infoDialogOpen,
    setInfoDialogOpen,
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
