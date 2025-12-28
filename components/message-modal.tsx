import { X, Copy, Loader2, Check } from "lucide-react"
import { useState, useEffect } from "react"
import type { MatchedConnection } from "@/lib/match-connections"

interface MessageModalProps {
  connection: MatchedConnection | null
  resolution: string
  isOpen: boolean
  onClose: () => void
}

export function MessageModal({ connection, resolution, isOpen, onClose }: MessageModalProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateMessage = async () => {
    if (!resolution.trim()) {
      setError("Resolution is required to generate a message")
      return
    }

    if (!connection) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const fullName = `${connection["First Name"]} ${connection["Last Name"]}`
      const position = connection.Position || ""
      const company = connection.Company || ""

      const response = await fetch("/api/draft-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution: resolution.trim(),
          name: fullName,
          position,
          company,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate message")
      }

      const data = await response.json()
      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate message")
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate message when modal opens
  useEffect(() => {
    if (isOpen && connection && !message && !loading && !error && resolution.trim()) {
      generateMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, connection])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessage(null)
      setError(null)
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen || !connection) return null

  const fullName = `${connection["First Name"]} ${connection["Last Name"]}`
  const position = connection.Position || ""
  const company = connection.Company || ""

  // Extract user ID from LinkedIn URL for messaging compose
  const getLinkedInMessagingUrl = (profileUrl: string): string => {
    try {
      // LinkedIn profile URLs are typically: https://www.linkedin.com/in/username/
      // For messaging, we can use the username or try to extract numeric ID
      // LinkedIn messaging compose accepts the profile URL or username as recipient
      const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/)
      if (urlMatch && urlMatch[1]) {
        const username = urlMatch[1]
        // Use the username as recipient (LinkedIn accepts this format)
        return `https://www.linkedin.com/messaging/compose?recipient=${encodeURIComponent(username)}`
      }
      // Fallback: use the full profile URL as recipient
      return `https://www.linkedin.com/messaging/compose?recipient=${encodeURIComponent(profileUrl)}`
    } catch {
      // If URL parsing fails, return the messaging compose URL with the profile URL as recipient
      return `https://www.linkedin.com/messaging/compose?recipient=${encodeURIComponent(profileUrl)}`
    }
  }

  const messagingUrl = connection.URL ? getLinkedInMessagingUrl(connection.URL) : null

  const copyToClipboard = async () => {
    if (!message) return

    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleClose = () => {
    setMessage(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Draft Message</h2>
            <p className="text-sm text-slate-400 mt-1">
              To: {fullName} {company && `at ${company}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!message && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-slate-300 mb-4">
                Generate a personalized LinkedIn message for {fullName}
              </p>
              <button
                onClick={generateMessage}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
              >
                Generate Message
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="ml-3 text-slate-300">Generating your message...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-200">
              <p className="font-medium">Error: {error}</p>
              <button
                onClick={generateMessage}
                className="mt-3 text-sm text-red-300 hover:text-red-100 underline"
              >
                Try again
              </button>
            </div>
          )}

          {message && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {message}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {message.length} characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
                {messagingUrl && (
                  <a
                    href={messagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Message on LinkedIn
                  </a>
                )}
              </div>

              <button
                onClick={generateMessage}
                className="w-full px-4 py-2 text-slate-400 hover:text-slate-200 text-sm border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                Regenerate Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

