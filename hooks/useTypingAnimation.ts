import { useState, useEffect } from "react"
import { EXAMPLE_GOALS, TYPING_SPEED } from "@/lib/constants"

/**
 * Custom hook for typing animation effect on goal input
 * @param resolution - Current resolution/goal text to determine if animation should stop
 * @returns Object with typingText and control functions
 */
export function useTypingAnimation(resolution: string) {
    const [typingText, setTypingText] = useState("")
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0)
    const [isTyping, setIsTyping] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    // Stop typing animation
    const stopTyping = () => {
        setIsTyping(false)
    }

    // Resume typing animation (resets to first goal)
    const resumeTyping = () => {
        setIsTyping(true)
        setIsDeleting(false)
        setTypingText("")
        setCurrentGoalIndex(0)
    }

    // Typing animation effect
    useEffect(() => {
        if (!isTyping || resolution.trim().length > 0) {
            return // Stop animation if user is typing
        }

        const currentGoal = EXAMPLE_GOALS[currentGoalIndex]
        let timeout: NodeJS.Timeout

        if (isDeleting) {
            // Delete characters
            if (typingText.length > 0) {
                timeout = setTimeout(() => {
                    setTypingText((prev) => prev.slice(0, -1))
                }, TYPING_SPEED.DELETE)
            } else {
                // Move to next goal
                setIsDeleting(false)
                setCurrentGoalIndex((prev) => (prev + 1) % EXAMPLE_GOALS.length)
            }
        } else {
            // Type characters
            if (typingText.length < currentGoal.length) {
                timeout = setTimeout(() => {
                    setTypingText((prev) => currentGoal.slice(0, prev.length + 1))
                }, TYPING_SPEED.TYPE)
            } else {
                // Wait before deleting
                timeout = setTimeout(() => {
                    setIsDeleting(true)
                }, TYPING_SPEED.PAUSE)
            }
        }

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [typingText, isTyping, isDeleting, currentGoalIndex, resolution])

    return {
        typingText,
        stopTyping,
        resumeTyping,
    }
}
