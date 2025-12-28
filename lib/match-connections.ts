import type { LinkedInConnection } from "./csv-parser"

export interface MatchedConnection extends LinkedInConnection {
  score: number
  matchReason: string
}

/**
 * Filters and ranks connections based on keywords
 * @param connections - Array of LinkedIn connections
 * @param keywords - Array of keywords to match against
 * @returns Top 12 matched connections sorted by score
 */
export function matchConnections(
  connections: LinkedInConnection[],
  keywords: string[]
): MatchedConnection[] {
  const matched: MatchedConnection[] = []

  // Normalize keywords to lowercase for case-insensitive matching
  const normalizedKeywords = keywords.map((k) => k.toLowerCase().trim())

  for (const connection of connections) {
    let score = 0
    const matchReasons: string[] = []

    const position = (connection.Position || "").toLowerCase()
    const company = (connection.Company || "").toLowerCase()

    // Check for matches in Position (High Score = 10 points)
    for (const keyword of normalizedKeywords) {
      if (position.includes(keyword)) {
        score += 10
        matchReasons.push(`Position: ${keyword}`)
      }
    }

    // Check for matches in Company (Medium Score = 5 points)
    for (const keyword of normalizedKeywords) {
      if (company.includes(keyword)) {
        score += 5
        matchReasons.push(`Company: ${keyword}`)
      }
    }

    // Only include connections with at least one match
    if (score > 0) {
      matched.push({
        ...connection,
        score,
        matchReason: matchReasons.join(", "),
      })
    }
  }

  // Sort by score (highest first), then by name
  matched.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    const nameA = `${a["First Name"]} ${a["Last Name"]}`.toLowerCase()
    const nameB = `${b["First Name"]} ${b["Last Name"]}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })

  // Return top 12 matches
  return matched.slice(0, 12)
}

