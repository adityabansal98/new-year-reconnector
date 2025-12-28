import { Linkedin, Mail } from "lucide-react"
import type { MatchedConnection } from "@/lib/match-connections"

interface ConnectionCardProps {
  connection: MatchedConnection
  onConnect: (connection: MatchedConnection) => void
}

export function ConnectionCard({ connection, onConnect }: ConnectionCardProps) {
  const fullName = `${connection["First Name"]} ${connection["Last Name"]}`
  const position = connection.Position || "No position listed"
  const company = connection.Company || "No company listed"

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">{fullName}</h3>
          <p className="text-sm text-purple-400 font-medium mb-1">{position}</p>
          <p className="text-sm text-slate-400">{company}</p>
        </div>
        {connection.URL && (
          <a
            href={connection.URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-purple-400 transition-colors"
            aria-label="View LinkedIn profile"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          Score: <span className="text-purple-400 font-medium">{connection.score}</span>
        </div>
        <button
          onClick={() => onConnect(connection)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
        >
          Connect
        </button>
      </div>
    </div>
  )
}

