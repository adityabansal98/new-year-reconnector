import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { connections } = await request.json()

    if (!connections || !Array.isArray(connections)) {
      return NextResponse.json(
        { error: "Connections data is required" },
        { status: 400 }
      )
    }

    // Use service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Upsert (insert or update) user connections
    const { error } = await supabase
      .from("user_connections")
      .upsert({
        user_id: userId,
        connections: connections,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save connections" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving connections:", error)
    return NextResponse.json(
      { error: "Failed to save connections" },
      { status: 500 }
    )
  }
}

