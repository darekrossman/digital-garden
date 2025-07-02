'use client'

import {
  Box,
  Center,
  Circle,
  Grid,
  HStack,
  HTMLStyledProps,
  Stack,
  styled,
} from '@/styled-system/jsx'
import { token } from '@/styled-system/tokens'
import {
  MotionValue,
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import { startTransition, useEffect, useRef, useState } from 'react'
// import Asteroid from './asteroid'
import AsteroidFiber from './asteroid-fiber'
// import { GenerativeBgAlt } from './generative-bg-alt'
import { ImageFrame } from './image-frame'
import { LLMCanvas } from './llm-canvas'

// Define a styled video element that we can easily control with classes
const Video = styled(motion.video, {
  base: {
    position: 'absolute',
    top: '50%',
    left: '50%',
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
  const video3Ref = useRef<HTMLVideoElement>(null)
  const refs = [video1Ref, video2Ref]
  const [current, setCurrent] = useState<0 | 1>(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollY, scrollYProgress } = useScroll({
    container: scrollContainerRef,
  })

  const y = useTransform(scrollYProgress, [0, 1], ['100%', '-50%'])
  const rotate = useTransform(scrollYProgress, [0, 1], [45, 90])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })
  const bigScale = useTransform(scrollYProgress, [0, 1], [1, 4], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })
  const bg = useTransform(scrollYProgress, [0, 1], ['#FFA500', '#FFF'])
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(20px)'], {
    ease: cubicBezier(0.7, 0, 0.84, 0),
  })
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })
  const opacityUp = useTransform(scrollYProgress, [0, 1], [0, 1], {
    ease: cubicBezier(0.11, 0, 0.7, -0.018),
  })

  const [pause, setPause] = useState(false)
  const baseColor = 'rgb(95, 95, 95)'

  return (
    <StyledMotion
      ref={scrollContainerRef}
      position="absolute"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      overflow="scroll"
      style={{ background: baseColor }}
    >
      <Box
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="2"
        mixBlendMode="exclusion"
        backgroundImage={`radial-gradient(circle, #0f6760, #4a2859), url(/images/noise.svg)`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
      />

      <StyledMotion
        id="asteroid-wrapper"
        position="fixed"
        inset={0}
        w="full"
        h="full"
        zIndex="1"
        pointerEvents="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Center id="genbox" position="relative" zIndex="1" w="100vw" h="100vh">
          {/* <HStack gap="8" h="full" alignItems="center" justifyItems="center">
            <Box w="460px">
              <LLMCanvas pause={pause} align="right" />
            </Box>
            <Box w="460px">
              <LLMCanvas pause={pause} align="left" />
            </Box>
          </HStack> */}
        </Center>

        <MotionCenter zIndex="2" style={{ filter: 'contrast(1.2)' }} pointerEvents="none">
          <AsteroidFiber />
        </MotionCenter>

        <MotionCenter zIndex="4" position="fixed" pointerEvents="none">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: cubicBezier(0.66, 0, 0.34, 1), delay: 0.5 }}
          >
            <styled.h1
              pos="relative"
              fontFamily="pixel"
              fontSize="3xl"
              pt="3px"
              pb="4px"
              px="0.5"
              bg="black"
              color="white"
              textBox="trim-both cap alphabetic"
            >
              About Me
            </styled.h1>
          </motion.div>
        </MotionCenter>

        {/* <Video
          src="/video/Black and White Esoteric Grid Patterns Video.mp4"
          ref={video3Ref}
          autoPlay
          loop
          muted
          preload="auto"
          playsInline
          filter="contrast(0.8)"
          w="100vw"
          h="100vh"
          mixBlendMode="saturation"
          position="absolute"
          opacity="0.7"
          style={{ x: '-50%', y: '-50%' }}
        /> */}

        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          zIndex="2"
          mixBlendMode="saturation"
          style={{ backgroundColor: baseColor }}
          opacity="0.2"
          backgroundImage={`url(/images/noise.svg)`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
        />
      </StyledMotion>

      {/* <MotionCenter
        mixBlendMode="overlay"
        position="fixed"
        pointerEvents="none"
        aspectRatio="1"
        overflow="hidden"
        zIndex="3"
        bg="orange.400"
        style={{
          width: '200vw',
          // scaleX: scale,
          // scaleY: inverseScale,
          opacity: opacityUp,
          rotate: 45,
          x: '-50%',
          y: '-50%',
        }}
      /> */}

      <styled.button
        position="fixed"
        bottom="0"
        right="0"
        zIndex={99}
        bg="black"
        color="white"
        onClick={() => setPause(!pause)}
      >
        {pause ? 'RESUME' : 'PAUSE'}
      </styled.button>
    </StyledMotion>
  )
}
