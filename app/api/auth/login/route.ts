import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection("users")

    const user = await users.findOne({ email: String(email).toLowerCase().trim() })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This account does not have a password set." },
        { status: 400 }
      )
    }

    const passwordMatch = await bcrypt.compare(String(password), user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    await createSession({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    })

    return NextResponse.json(
      {
        message: "Logged in successfully",
        user: {
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)

    const message =
      error instanceof Error ? error.message : "Unknown login error"

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
