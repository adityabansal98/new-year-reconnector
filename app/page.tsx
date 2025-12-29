"use client"

import { useState, useMemo, useEffect } from "react"
import { Upload, Target, Sparkles, Loader2, Users, LogOut, User, Database, RefreshCw, FileText, Settings } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { parseCSV, type LinkedInConnection } from "@/lib/csv-parser"
import { matchConnections, type MatchedConnection } from "@/lib/match-connections"
import { ConnectionCard } from "@/components/connection-card"
import { MessageModal } from "@/components/message-modal"
import { trackFileUpload, trackButtonClick, trackSearch, trackPageView } from "@/lib/analytics"

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [resolution, setResolution] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connections, setConnections] = useState<LinkedInConnection[] | null>(null)
  const [keywords, setKeywords] = useState<string[] | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<MatchedConnection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [savedConnections, setSavedConnections] = useState<LinkedInConnection[] | null>(null)
  const [usingSavedConnections, setUsingSavedConnections] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)

  // Load saved connections when user signs in
  useEffect(() => {
    if (isSignedIn && !savedConnections && !loadingSaved) {
      loadSavedConnections()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

  // Track page view
  useEffect(() => {
    trackPageView("/")
  }, [])

  // Compute matched connections when we have both connections and keywords
  const matchedConnections = useMemo(() => {
    if (!connections || !keywords || keywords.length === 0) {
      return []
    }
    return matchConnections(connections, keywords)
  }, [connections, keywords])

  const loadSavedConnections = async () => {
    if (!isSignedIn) return

    setLoadingSaved(true)
    try {
      const response = await fetch("/api/load-connections")
      if (response.ok) {
        const data = await response.json()
        if (data.connections) {
          setSavedConnections(data.connections)
        }
      }
    } catch (err) {
      console.error("Failed to load saved connections:", err)
    } finally {
      setLoadingSaved(false)
    }
  }

  const handleLoadSavedConnections = () => {
    if (savedConnections) {
      setConnections(savedConnections)
      setUsingSavedConnections(true)
      setFile(null) // Clear file since we're using saved
      trackButtonClick("load_saved_connections", "saved_connections_banner")
    }
  }

  const saveConnections = async (connectionsToSave: LinkedInConnection[]) => {
    if (!isSignedIn) return

    try {
      await fetch("/api/save-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connections: connectionsToSave }),
      })
      // Update saved connections state
      setSavedConnections(connectionsToSave)
    } catch (err) {
      console.error("Failed to save connections:", err)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0]
      // If a different file is uploaded, clear existing connections to force re-parsing
      if (file && (file.name !== newFile.name || file.size !== newFile.size || file.lastModified !== newFile.lastModified)) {
        setConnections(null)
        setKeywords(null)
      }
      setFile(newFile)
      setUsingSavedConnections(false) // Switch to new file mode
      trackFileUpload(newFile.name)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

  const handleFindConnections = async () => {
    // Need resolution and either a file OR saved connections loaded
    if (!resolution.trim() || (!file && !connections)) {
      if (!resolution.trim()) {
        setError("Please enter your goal")
      } else if (!file && !connections) {
        setError("Please upload a CSV file or load your saved connections")
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Parse CSV (only if we don't have connections yet or file changed)
      let parsedConnections = connections
      if (!parsedConnections && file) {
        parsedConnections = await parseCSV(file)
        setConnections(parsedConnections)
        // Auto-save connections if user is signed in
        if (isSignedIn && !usingSavedConnections) {
          await saveConnections(parsedConnections)
        }
      }

      // If we still don't have connections at this point, something went wrong
      if (!parsedConnections) {
        throw new Error("No connections available. Please upload a CSV or load saved connections.")
      }

      // Step 2: Call API to analyze resolution and get keywords
      const response = await fetch("/api/analyze-resolution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolution: resolution.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze goal")
      }

      const data = await response.json()
      setKeywords(data.keywords)
      // Track search event
      trackSearch(data.keywords?.length || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      // Don't clear connections on error, just keywords
      setKeywords(null)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (connection: MatchedConnection) => {
    setSelectedConnection(connection)
    setIsModalOpen(true)
    trackButtonClick("connect", "connection_card")
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConnection(null)
  }

  const handleReset = () => {
    setResolution("")
    setFile(null)
    setConnections(null)
    setKeywords(null)
    setError(null)
    trackButtonClick("start_over", "results_header")
  }

  const showResults = matchedConnections.length > 0
  const hasConnections = connections !== null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Auth Header */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex justify-end">
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                {user?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">{user?.fullName || user?.emailAddresses[0]?.emailAddress}</span>
              </div>
              <Link
                href="/profile"
                onClick={() => trackButtonClick("profile_link", "header")}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <SignOutButton>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className={`${showResults ? "max-w-7xl" : "max-w-4xl"} mx-auto`}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Link Back AI
              </h1>
            </div>
            <p className="text-slate-400 text-lg mt-4">
              Find the right people in your network to help you achieve your professional goals
            </p>
          </div>

          {/* Form Section - Always visible, but can be collapsed when results shown */}
          <div className={`mb-8 ${showResults ? "bg-slate-900/30 border border-slate-800 rounded-xl p-6" : ""}`}>
            {showResults && (
              <div className="mb-4 pb-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-slate-200 mb-1">Adjust Your Search</h2>
                <p className="text-sm text-slate-400">Modify your goal to find different connections</p>
              </div>
            )}

            {/* Goal Input */}
            <div className="mb-6">
              <label
                htmlFor="resolution"
                className="flex items-center gap-2 text-slate-300 mb-3 text-lg font-medium"
              >
                <Target className="w-5 h-5 text-purple-400" />
                Your Goal
              </label>
              <textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="e.g., I want to pivot into Product Management in Climate Tech"
                className="w-full min-h-[120px] px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
              />
            </div>

            {/* Saved Connections Option */}
            {isSignedIn && savedConnections && savedConnections.length > 0 && !usingSavedConnections && !file && (
              <div className="mb-6 p-4 bg-purple-950/20 border border-purple-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-slate-200 font-medium">Saved Connections Available</p>
                      <p className="text-xs text-slate-400">
                        {savedConnections.length} connections from your last upload
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLoadSavedConnections}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Load Saved</span>
                  </button>
                </div>
              </div>
            )}

            {/* Help Link - Only show when no data uploaded */}
            {!hasConnections && (
              <div className="mb-4">
                <Link
                  href="/how-to-download"
                  onClick={() => trackButtonClick("help_download_link", "main_page")}
                  className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 underline transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Need help downloading your LinkedIn connections?</span>
                </Link>
              </div>
            )}

            {/* File Upload Zone */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-slate-300 mb-3 text-lg font-medium">
                <Upload className="w-5 h-5 text-purple-400" />
                LinkedIn Connections
                {hasConnections && (
                  <span className="ml-2 text-xs text-green-400 font-normal">
                    (Loaded: {connections?.length} connections
                    {usingSavedConnections && " - from saved"}
                    {!usingSavedConnections && file && " - from new upload"}
                    )
                  </span>
                )}
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive
                  ? "border-purple-500 bg-purple-950/20"
                  : "border-slate-700 hover:border-slate-600 bg-slate-900/30"
                  }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-purple-400" />
                    <p className="text-slate-200 font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-slate-500" />
                    <div>
                      <p className="text-slate-300 font-medium mb-1">
                        {isDragActive
                          ? "Drop your CSV file here"
                          : "Drag & drop your Connections.csv file"}
                      </p>
                      <p className="text-sm text-slate-500">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 mt-4">
                      Expected format: First Name, Last Name, Company, Position, Connected On
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                trackButtonClick("find_connections", "main_action_button")
                handleFindConnections()
              }}
              disabled={!resolution.trim() || (!file && !connections) || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : showResults ? (
                "Search Again"
              ) : (
                "Find Connections"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-200">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {/* Results Section */}
          {showResults && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-400" />
                    Top Matches
                  </h2>
                  <p className="text-slate-400">
                    Found {matchedConnections.length} relevant connections out of {connections?.length || 0} total
                  </p>
                  {keywords && (
                    <p className="text-xs text-slate-500 mt-1">
                      Keywords: {keywords.join(", ")}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  Start Over
                </button>
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedConnections.map((connection, index) => (
                  <ConnectionCard
                    key={`${connection["First Name"]}-${connection["Last Name"]}-${index}`}
                    connection={connection}
                    onConnect={handleConnect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Matches Message */}
          {keywords && connections && !error && !showResults && (
            <div className="mb-6 p-4 bg-yellow-950/50 border border-yellow-800 rounded-xl text-yellow-200">
              <p className="font-medium mb-2">Analysis Complete</p>
              <p className="text-sm text-yellow-300">
                No matches found. Try adjusting your goal or check if your connections have relevant positions/companies.
              </p>
              <div className="mt-2 text-xs text-yellow-400">
                Keywords searched: {keywords.join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        connection={selectedConnection}
        resolution={resolution}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  )
}


