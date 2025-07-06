import { Box, Flex } from '@/styled-system/jsx'
import { useEffect, useRef, useState } from 'react'

export const Scrollbar = ({
  scrollContainerRef,
}: { scrollContainerRef: React.RefObject<HTMLDivElement | null> }) => {
  const scrollNibRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  const scrollbarWidth = 16

  // Check if user is at bottom of scroll container
  const isAtBottom = () => {
    if (!scrollContainerRef.current) return false
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    return scrollTop + clientHeight >= scrollHeight - 50 // 10px threshold
  }

  // Auto-scroll to bottom when completion changes, but only if user hasn't scrolled up
  // useEffect(() => {
  //   if (scrollContainerRef.current && !isUserScrolling) {
  //     const scrollContainer = scrollContainerRef.current
  //     scrollContainer.scrollTop = scrollContainer.scrollHeight
  //   }
  // }, [completion, currentCompletionRef.current, isUserScrolling])

  // Handle scroll events to detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const nib = scrollNibRef.current
    if (!scrollContainer || !nib) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer

      const y = scrollTop / (scrollHeight - clientHeight)

      console.log(scrollTop, scrollHeight, clientHeight)

      nib.style.transform = `translateY(${y * (clientHeight - scrollbarWidth)}px)`

      const atBottom = isAtBottom()
      console.log('atBottom', atBottom)
      setIsUserScrolling(!atBottom)
    }

    // nib.style.transform = 'translateY(0)'

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // Function to scroll to bottom manually
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      setIsUserScrolling(false)
    }
  }

  return (
    <Flex
      position="relative"
      h="full"
      flexDirection="column"
      color="white"
      borderLeft="1px solid white"
      style={{ width: scrollbarWidth }}
    >
      <Box
        position="absolute"
        inset="0"
        opacity="0.4"
        backgroundImage="url(/images/dot.png)"
        backgroundRepeat="repeat"
        backgroundSize="3px 3px"
        overflow="hidden"
      />
      <Box
        ref={scrollNibRef}
        bg="white"
        style={{ height: scrollbarWidth, width: scrollbarWidth }}
      />
    </Flex>
  )
}
