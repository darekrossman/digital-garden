'use client'

import { css } from '@/styled-system/css'
import { Box, Center, Flex, styled } from '@/styled-system/jsx'
import { MotionValue, motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ParticleField } from '../components/ParticleField'

export default function Home() {
  return (
    <Box position="relative">
      <PageSection>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={css({ w: '400px', h: '400px', position: 'absolute' })}
        >
          <ParticleField />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <Box w="300px" color="gray.800">
            <styled.h1 mb="3">I'm Darek Rossman.</styled.h1>

            <styled.p mb="3">
              I live in St. Pete, FL and I've been working on physical and digital creations for the
              last two decades.
            </styled.p>

            <styled.p>
              I adapt to complexity and I strive for simplicity. I design for clarity and I build
              for scale. I lead with curiosity and I ask better questions.
            </styled.p>
          </Box>
        </motion.div>
      </PageSection>
    </Box>
  )
}

function PageSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const y = useParallax(scrollYProgress, 300)

  return (
    <Center ref={ref} h="100dvh" scrollSnapAlign="start" position="relative">
      {children}
    </Center>
  )
}

function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance])
}
