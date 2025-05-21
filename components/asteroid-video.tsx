'use client'

import { Box, Center, HTMLStyledProps, Stack, styled } from '@/styled-system/jsx'
import {
  MotionValue,
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// Define a styled video element that we can easily control with classes
const Video = styled('video', {
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    w: '400px',
    aspectRatio: '1/1',
    maxHeight: '100vh',
    objectFit: 'cover',
    opacity: 1,
  },
})

const StyledMotion = styled(motion.div)
const MotionCenter = styled(StyledMotion, {
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
})

export function AsteroidVideo(props: HTMLStyledProps<'video'>) {
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)
  const refs = [video1Ref, video2Ref]
  const [current, setCurrent] = useState<0 | 1>(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollY, scrollYProgress } = useScroll({
    container: scrollContainerRef,
    // target: scrollContainerRef,
  })

  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)

  useEffect(() => {
    setScreenWidth(scrollContainerRef.current?.clientWidth ?? 0)
    setScreenHeight(scrollContainerRef.current?.clientHeight ?? 0)

    const handleResize = () => {
      setScreenWidth(scrollContainerRef.current?.clientWidth ?? 0)
      setScreenHeight(scrollContainerRef.current?.clientHeight ?? 0)
    }

    let reverseAnimationFrame: number | null = null
    const startTime = 2
    const maxStep = 1 / 12 // Fastest at the start
    const minStep = 1 / 64 // Slowest at the end
    const reversePlayback = () => {
      const video = video1Ref.current
      if (video) {
        if (video.currentTime > 0) {
          const t = Math.max(0, video.currentTime / startTime) // 1 to 0
          const ease = t * t * t // cubic ease-out
          const step = minStep + (maxStep - minStep) * ease
          video.currentTime = Math.max(0, video.currentTime - step)
          reverseAnimationFrame = requestAnimationFrame(reversePlayback)
        } else {
          video.currentTime = 0
          if (reverseAnimationFrame) cancelAnimationFrame(reverseAnimationFrame)
        }
      }
    }

    if (video1Ref.current) {
      video1Ref.current.currentTime = startTime
      // Start reverse playback
      reversePlayback()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (reverseAnimationFrame) cancelAnimationFrame(reverseAnimationFrame)
    }
  }, [])

  const y = useTransform(scrollYProgress, [0, 1], ['100%', '-50%'])
  const rotate = useTransform(scrollYProgress, [0, 1], [45, 90])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })
  const bg = useTransform(scrollYProgress, [0, 1], ['#FFA500', '#FFF'])
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(8px)'], {
    ease: cubicBezier(0.7, 0, 0.84, 0),
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })
  const paneW = useTransform(
    scrollYProgress,
    [0, 1],
    [0, Math.max(screenWidth * 2, screenHeight * 2)],
    {
      ease: cubicBezier(0.11, 0, 0.7, -0.018),
    },
  )
  const vidFrame = useTransform(scrollYProgress, [0, 1], [0, 8])

  useMotionValueEvent(vidFrame, 'change', (val) => {
    if (video1Ref.current) {
      video1Ref.current.currentTime = val
    }
    if (video2Ref.current) {
      video2Ref.current.currentTime = val
    }
  })

  return (
    <StyledMotion
      ref={scrollContainerRef}
      position="absolute"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      overflow="scroll"
      background="radial-gradient(circle, transparent 20%, rgba(0,0,0,0.2) 100%)"
    >
      <MotionCenter zIndex="3" position="fixed">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: cubicBezier(0.66, 0, 0.34, 1) }}
        >
          <styled.h1
            pos="relative"
            fontFamily="majorMono"
            fontSize="4xl"
            fontWeight="extrabold"
            color="white"
          >
            About Me
          </styled.h1>
        </motion.div>
      </MotionCenter>

      <Box position="fixed" inset="0" pointerEvents="none" zIndex="1" />

      <Box w="100vw" h="100dvh" position="relative" mixBlendMode="multiply"></Box>
      <Box w="100vw" h="100dvh" mixBlendMode="multiply" position="relative"></Box>
      <Box w="100vw" h="100dvh" mixBlendMode="multiply" position="relative"></Box>
      <Box w="100vw" h="100dvh" mixBlendMode="multiply" position="relative"></Box>

      <StyledMotion zIndex="2" style={{ y: -y }}>
        <Center>
          <Stack w="full" maxW="376px" gap="8">
            {/* <styled.p>
              I'm driven by a mix of curiosity and anxiety — a restless fascination with the way
              complexity gives way to simplicity, and how beauty tends to emerge right at that edge.
              Early on, I fell in love with electronic music and interface design. I became obsessed
              with the tools — not just what they could do, but how they could shape ideas,
              expression, and interaction.
            </styled.p>
            <styled.p>
              My technical skills didn't come from a traditional path. They came from the need to
              bring creativity to life. I didn't set out to be a developer — I just wanted to make
              things. And in the process, I discovered that what really drives me is solving
              problems. That's the common thread in most creative work: understanding something
              deeply enough to shape it, challenge it, or make it sing.
            </styled.p>
            <styled.p>
              The web became my medium — a space where I could explore systems, sound, design, and
              behavior all at once. But over the last decade, I've come to care just as much about
              the people I build with as the things I build. Relationships, trust, clarity — these
              matter as much as code.
            </styled.p>
            <styled.p>
              I try to bring people along with me: to coach, teach, and share what I've learned. I
              move ahead only when I can help carry something heavier. I listen closely, because
              often the most important things people say aren't the ones they say directly.
            </styled.p>
            <styled.p>
              At the end of the day, I'm in it for those shared "wow" moments — the spark when
              something clicks, when an idea takes shape, when the work matters to more than just
              me.
            </styled.p> */}
          </Stack>
        </Center>
      </StyledMotion>

      <StyledMotion
        position="fixed"
        inset={0}
        w="full"
        h="full"
        mixBlendMode="multiply"
        pointerEvents="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ scale, filter: blur }}
      >
        <Video
          src="/video/asteroid_cropped_keyframe1.mp4"
          // src="/video/wireframe-asteroid4_cropped_keyframe1.mp4"
          ref={video1Ref}
          muted
          preload="auto"
          playsInline
          mixBlendMode="normal"
          filter="contrast(1.2)"
        />
      </StyledMotion>

      <MotionCenter
        bg="blue.500"
        mixBlendMode="multiply"
        position="fixed"
        pointerEvents="none"
        aspectRatio="1"
        overflow="hidden"
        style={{ width: paneW, rotate: 45, x: '-50%', y: '-50%' }}
      />
    </StyledMotion>
  )
}
