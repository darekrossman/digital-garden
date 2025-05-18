'use client'

import { HTMLStyledProps, styled } from '@/styled-system/jsx'
import { useEffect, useRef } from 'react'

export function Video(props: HTMLStyledProps<'video'>) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1
    }
  }, [])

  return <styled.video ref={videoRef} autoPlay loop muted preload="auto" {...props} />
}
