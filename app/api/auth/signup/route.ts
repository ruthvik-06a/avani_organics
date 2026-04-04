import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection("users")

    const existingUser = await users.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await users.insertOne({
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      password: hashedPassword,
      createdAt: new Date(),
    })

    await createSession({
      userId: result.insertedId.toString(),
      name,
      email: email.toLowerCase(),
    })

    return NextResponse.json(
      { message: "Account created successfully", user: { name, email } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
