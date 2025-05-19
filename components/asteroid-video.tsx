'use client'

import { Box, HTMLStyledProps, styled } from '@/styled-system/jsx'
import { useEffect, useRef, useState } from 'react'

// Define a styled video element that we can easily control with classes
const Video = styled('video', {
  base: {
    position: 'absolute',
    inset: 0,
    w: '100%',
    h: '100%',
    objectFit: 'cover',
    opacity: 0,
    // transition: 'opacity 0.4s ease',
    '&.visible': {
      opacity: 1,
    },
    '&.glitch': {
      animation: 'glitch 0.3s steps(5) infinite',
      filter: 'contrast(1.2) saturate(1.5)',
      mixBlendMode: 'exclusion',
    },
  },
})

export function AsteroidVideo(props: HTMLStyledProps<'video'>) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  // 0 -> first video visible, 1 -> second video visible
  const [current, setCurrent] = useState<0 | 1>(0)

  // Keep references in an array for easy access
  const refs = [video1Ref, video2Ref]

  // Utility: add / remove class helpers
  const addClass = (el: HTMLVideoElement | null, cls: string) => el && el.classList.add(cls)
  const removeClass = (el: HTMLVideoElement | null, cls: string) => el && el.classList.remove(cls)

  // Inject the keyframes *once* when the component mounts
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `@keyframes glitch {
        0% { transform: translate(0);} 
        20% { transform: translate(-2px,2px); }
        40% { transform: translate(-2px,-2px); }
        60% { transform: translate(2px,2px); }
        80% { transform: translate(2px,-2px); }
        100% { transform: translate(0);} 
      }`
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Core logic: ensure only the current video is playing & visible
  useEffect(() => {
    const cur = refs[current].current
    const next = refs[1 - current].current

    if (!cur || !next) return

    // Prepare current video
    addClass(cur, 'visible')
    removeClass(cur, 'glitch')
    cur.playbackRate = 1
    cur.play().catch(() => {})

    // Hide & pause the other one
    removeClass(next, 'visible')
    removeClass(next, 'glitch')
    next.pause()

    // Listener that checks when we should start the transition
    const handleTimeUpdate = () => {
      if (!cur.duration || isNaN(cur.duration)) return

      // Start transition when 1 second remains
      if (cur.duration - cur.currentTime <= 1) {
        // Remove this listener – we'll reattach when videos swap
        cur.removeEventListener('timeupdate', handleTimeUpdate)
        startTransition()
      }
    }

    cur.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      cur.removeEventListener('timeupdate', handleTimeUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  // Handles the glitch transition between videos
  const startTransition = () => {
    const curIdx = current
    const nextIdx = 1 - curIdx
    const cur = refs[curIdx].current
    const next = refs[nextIdx].current
    if (!cur || !next) return

    // Reset next video to start and make it visible (but underneath glitch overlay)
    next.currentTime = 0
    next.playbackRate = 0.2
    addClass(next, 'visible')

    // Apply glitch to both
    addClass(cur, 'glitch')
    addClass(next, 'glitch')

    // After short delay, swap the videos & clean up classes
    setTimeout(() => {
      removeClass(cur, 'visible')
      removeClass(cur, 'glitch')
      cur.pause()
      removeClass(next, 'glitch')

      // Start playing the next video
      next.playbackRate = 1
      next.play().catch(() => {})

      // Swap state – kicks off new effect cycle
      setCurrent(nextIdx as 0 | 1)
    }, 500) // duration of glitch effect
  }

  return (
    <Box position="relative" w="100vw" h="100vh" aspectRatio="16/9" overflow="hidden" bg="orange">
      <Video
        src="/video/spinning-asteroid1.mp4"
        ref={video1Ref}
        muted
        preload="auto"
        playsInline
        mixBlendMode="difference"
        {...props}
      />
      <Video
        src="/video/wireframe-asteroid.mp4"
        ref={video2Ref}
        muted
        preload="auto"
        playsInline
        mixBlendMode="hard-light"
        {...props}
      />
    </Box>
  )
}
