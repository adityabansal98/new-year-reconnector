import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from("user_connections")
      .select("connections, updated_at")
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No data found - user hasn't saved connections yet
        return NextResponse.json({ connections: null })
      }
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to load connections" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      connections: data.connections,
      updatedAt: data.updated_at 
    })
  } catch (error) {
    console.error("Error loading connections:", error)
    return NextResponse.json(
      { error: "Failed to load connections" },
      { status: 500 }
    )
  }
}

