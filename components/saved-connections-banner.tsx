"use client"

import { Database } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/date-utils"
import { trackButtonClick } from "@/lib/analytics"

interface SavedConnectionsBannerProps {
    connectionsCount: number
    updatedAt: string | null
}

/**
 * Banner component displaying information about saved connections
 */
export function SavedConnectionsBanner({
    connectionsCount,
    updatedAt,
}: SavedConnectionsBannerProps) {
    return (
        <div className="mb-6 p-4 bg-purple-950/20 border border-purple-800/50 rounded-xl">
            <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-slate-200 font-medium mb-1">
                        Using {connectionsCount} saved connections
                    </p>
                    {updatedAt && (
                        <p className="text-xs text-slate-400 mb-2">
                            Last updated: {formatDate(updatedAt)}
                        </p>
                    )}
                    <p className="text-sm text-slate-300">
                        Want to update?{" "}
                        <Link
                            href="/profile"
                            onClick={() => trackButtonClick("update_connections_link", "main_page")}
                            className="text-purple-400 hover:text-purple-300 underline font-medium"
                        >
                            Go to Profile →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

