"use client"

import { Target } from "lucide-react"

interface GoalInputProps {
    value: string
    onChange: (value: string) => void
    typingText: string
    onStopTyping: () => void
    onResumeTyping: () => void
}

/**
 * Goal input component with typing animation overlay
 */
export function GoalInput({
    value,
    onChange,
    typingText,
    onStopTyping,
    onResumeTyping,
}: GoalInputProps) {
    return (
        <div className="mb-6">
            <label
                htmlFor="resolution"
                className="flex items-center gap-2 text-slate-300 mb-3 text-lg font-medium"
            >
                <Target className="w-5 h-5 text-purple-400" />
                Your Goal
            </label>
            <div className="relative">
                <textarea
                    id="resolution"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value)
                        onStopTyping() // Stop animation when user types
                    }}
                    onFocus={() => onStopTyping()} // Stop animation on focus
                    onBlur={() => {
                        // Resume animation if empty
                        if (value.trim().length === 0) {
                            onResumeTyping()
                        }
                    }}
                    placeholder=""
                    className="w-full min-h-[120px] px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg relative z-10"
                />
                {value.trim().length === 0 && typingText && (
                    <div className="absolute inset-0 px-6 py-4 pointer-events-none z-0">
                        <div className="text-slate-500 text-lg whitespace-pre-wrap">
                            {typingText}
                            <span className="animate-pulse">|</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

