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
import { useEffect, useRef, useState } from 'react'
import Asteroid from './asteroid'
import AsteroidFiber from './asteroid-fiber'
import { GenerativeBgAlt } from './generative-bg-alt'
import { ImageFrame } from './image-frame'

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

  const [regenKey, setRegenKey] = useState(0)

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setRegenKey((prev) => prev + 1)
    // }, 500)
    // return () => clearInterval(interval)
  }, [])

  const baseColor = 'rgb(65, 65, 65)'

  return (
    <StyledMotion
      ref={scrollContainerRef}
      position="absolute"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      overflow="scroll"
      // backgroundImage={`radial-gradient(circle, rgba(0,0,0,0), rgba(0, 0, 0, 1) 50%), url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=)`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      style={{ background: baseColor }}
    >
      <MotionCenter zIndex="4" position="fixed" pointerEvents="none">
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

      <Box w="100vw" h="500dvh" position="relative" zIndex="-1" />

      <StyledMotion zIndex="4" style={{ y: y }}>
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

      <Box
        position="fixed"
        inset="0"
        pointerEvents="none"
        zIndex="2"
        mixBlendMode="exclusion"
        style={{ backgroundColor: '#4a2859' }}
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
        // style={{ scale: 1, filter: blur }}
      >
        <Center id="genbox" position="relative" zIndex="1" w="100vw" h="100vh">
          {/* <HStack gap="8" h="full" alignItems="center" justifyItems="center">
            <ImageFrame regenerateKey={regenKey + 1} key={1} />
            <ImageFrame regenerateKey={regenKey + 2} key={2} />
            <Box w="200px" />
            <ImageFrame regenerateKey={regenKey + 3} key={3} />
            <ImageFrame regenerateKey={regenKey + 4} key={4} />
          </HStack> */}
          {/* <Box bg="red" mr="50vw" w="50vw" h="100vh" /> */}
        </Center>

        <MotionCenter
          zIndex="2"
          style={{ filter: 'contrast(1.1)' }}
          pointerEvents="none"
          // mixBlendMode="exclusion"
        >
          <AsteroidFiber />
        </MotionCenter>
        {/* <MotionCenter zIndex="2" style={{ filter: 'contrast(1.1)' }}>
          <Asteroid
            autoRotate={true}
            autoRotateAxes={['x', 'y', 'z']}
            autoRotateSpeedX={0.001} // faster X rotation
            autoRotateSpeedY={0.007} // medium Y rotation
            autoRotateSpeedZ={0.003} // slower Z rotation
            directionalLight={{
              color: baseColor,
              x: scale,
              // y: lightY,
              // z: lightZ,
            }}
            ambientLight={{ color: baseColor }}
            // rotationY={tr}
            width={900}
          />
        </MotionCenter> */}

        {/* <Video
          src="/video/Dithered Black May 22 1556 (2).mp4"
          // src="/video/Dithered Black May 22.mp4"
          ref={video3Ref}
          autoPlay
          loop
          muted
          preload="auto"
          playsInline
          filter="contrast(1.2)"
          minW="100vw"
          h="100vh"
          mixBlendMode="saturation"
          style={{ scale: bigScale, filter: blur, opacity, x: '-50%', y: '-50%' }}
        /> */}

        <Box
          position="absolute"
          inset="0"
          pointerEvents="none"
          zIndex="2"
          mixBlendMode="saturation"
          style={{ backgroundColor: baseColor }}
        />
      </StyledMotion>

      <MotionCenter
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
      />
    </StyledMotion>
  )
}
