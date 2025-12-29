"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  User,
  Database,
  Loader2,
  ArrowLeft,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText
} from "lucide-react"
import Link from "next/link"
import { parseCSV, type LinkedInConnection } from "@/lib/csv-parser"
import { trackPageView, trackButtonClick } from "@/lib/analytics"
import { ConnectionsUpload } from "@/components/connections-upload"
import { formatDate } from "@/lib/date-utils"

export default function ProfilePage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [connections, setConnections] = useState<LinkedInConnection[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  // Track page view
  useEffect(() => {
    trackPageView("/profile")
  }, [])

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, router])

  // Load saved connections
  useEffect(() => {
    if (isSignedIn) {
      loadConnections()
    }
  }, [isSignedIn])

  const loadConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/load-connections")
      if (!response.ok) {
        throw new Error("Failed to load connections")
      }
      const data = await response.json()
      if (data.connections) {
        setConnections(data.connections)
        setUpdatedAt(data.updatedAt || null)
      } else {
        setConnections(null)
        setUpdatedAt(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections")
    } finally {
      setLoading(false)
    }
  }

  const saveConnections = async (connectionsToSave: LinkedInConnection[]) => {
    const response = await fetch("/api/save-connections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ connections: connectionsToSave }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to save connections")
    }
  }

  const handleFileChange = async (file: File) => {
    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Parse CSV
      const parsedConnections = await parseCSV(file)

      // Save to Supabase
      await saveConnections(parsedConnections)

      // Update local state
      setConnections(parsedConnections)
      setUpdatedAt(new Date().toISOString())
      setSuccess(`Successfully updated ${parsedConnections.length} connections!`)
      trackButtonClick("update_connections", "profile_page")

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload connections")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteConnections = async () => {
    if (!confirm("Are you sure you want to delete all saved connections? This cannot be undone.")) {
      return
    }

    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      // Save empty array to clear connections
      await saveConnections([])

      setConnections(null)
      setUpdatedAt(null)
      setSuccess("All connections have been deleted.")
      trackButtonClick("delete_connections", "profile_page")

      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete connections")
    } finally {
      setDeleting(false)
    }
  }


  if (!isSignedIn) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            onClick={() => trackButtonClick("back_to_home", "profile_page")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-slate-100">Profile</h1>
            </div>
            <p className="text-slate-400">
              Manage your saved LinkedIn connections
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              {user?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "User"}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-100 mb-1">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Connections Stats Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-slate-100">Saved Connections</h2>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-purple-400 mb-1">
                      {connections.length}
                    </p>
                    <p className="text-sm text-slate-400">Total connections</p>
                  </div>
                  {updatedAt && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Last Updated</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {formatDate(updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleDeleteConnections}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-950/50 hover:bg-red-950/70 text-red-400 border border-red-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All Connections</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 mb-2">No connections saved yet</p>
                <p className="text-sm text-slate-500">
                  Upload a CSV file below to get started
                </p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-slate-100">Update Connections</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Upload a new CSV file to replace your saved connections. This will completely replace your existing data.
            </p>

            <ConnectionsUpload
              file={null}
              onFileChange={handleFileChange}
              uploading={uploading}
              showFilePreview={false}
              show={true}
            />

            <div className="mt-4">
              <Link
                href="/how-to-download"
                onClick={() => trackButtonClick("help_download_link", "profile_page")}
                className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 underline transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Need help downloading your LinkedIn connections?</span>
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-950/50 border border-green-800 rounded-xl text-green-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">Error: {error}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

