"use client"

import { useState, useMemo } from "react"
import { Upload, Target, Sparkles, Loader2, Users } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { parseCSV, type LinkedInConnection } from "@/lib/csv-parser"
import { matchConnections, type MatchedConnection } from "@/lib/match-connections"
import { ConnectionCard } from "@/components/connection-card"
import { MessageModal } from "@/components/message-modal"

export default function Home() {
  const [resolution, setResolution] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connections, setConnections] = useState<LinkedInConnection[] | null>(null)
  const [keywords, setKeywords] = useState<string[] | null>(null)
  const [selectedConnection, setSelectedConnection] = useState<MatchedConnection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Compute matched connections when we have both connections and keywords
  const matchedConnections = useMemo(() => {
    if (!connections || !keywords || keywords.length === 0) {
      return []
    }
    return matchConnections(connections, keywords)
  }, [connections, keywords])

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0]
      // If a different file is uploaded, clear existing connections to force re-parsing
      if (file && (file.name !== newFile.name || file.size !== newFile.size || file.lastModified !== newFile.lastModified)) {
        setConnections(null)
        setKeywords(null)
      }
      setFile(newFile)
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
    if (!resolution.trim() || !file) return

    setLoading(true)
    setError(null)

    try {
      // Step 1: Parse CSV (only if we don't have connections yet or file changed)
      let parsedConnections = connections
      if (!parsedConnections) {
        parsedConnections = await parseCSV(file)
        setConnections(parsedConnections)
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
        throw new Error(errorData.error || "Failed to analyze resolution")
      }

      const data = await response.json()
      setKeywords(data.keywords)
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
  }

  const showResults = matchedConnections.length > 0
  const hasConnections = connections !== null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className={`${showResults ? "max-w-7xl" : "max-w-4xl"} mx-auto`}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Resolution Connector
              </h1>
            </div>
            <p className="text-slate-400 text-lg mt-4">
              Achieve your professional New Year's Resolutions by reconnecting with your network
            </p>
          </div>

          {/* Form Section - Always visible, but can be collapsed when results shown */}
          <div className={`mb-8 ${showResults ? "bg-slate-900/30 border border-slate-800 rounded-xl p-6" : ""}`}>
            {showResults && (
              <div className="mb-4 pb-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-slate-200 mb-1">Adjust Your Search</h2>
                <p className="text-sm text-slate-400">Modify your resolution to find different connections</p>
              </div>
            )}

            {/* Resolution Input */}
            <div className="mb-6">
              <label
                htmlFor="resolution"
                className="flex items-center gap-2 text-slate-300 mb-3 text-lg font-medium"
              >
                <Target className="w-5 h-5 text-purple-400" />
                Your Resolution
              </label>
              <textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="e.g., I want to pivot into Product Management in Climate Tech"
                className="w-full min-h-[120px] px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
              />
            </div>

            {/* File Upload Zone */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-slate-300 mb-3 text-lg font-medium">
                <Upload className="w-5 h-5 text-purple-400" />
                LinkedIn Connections
                {hasConnections && (
                  <span className="ml-2 text-xs text-green-400 font-normal">(Loaded: {connections?.length} connections)</span>
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
              onClick={handleFindConnections}
              disabled={!resolution.trim() || !file || loading}
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
                No matches found. Try adjusting your resolution or check if your connections have relevant positions/companies.
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


