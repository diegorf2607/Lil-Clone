import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin not configured")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

export async function GET() {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, role, locationId, locations, phone, isActive } = body || {}

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    })

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message || "Error creating user" }, { status: 500 })
    }

    const { error: profileError } = await admin
      .from("user_profiles")
      .update({
        name,
        role,
        location_id: locationId || null,
        locations: locations || null,
        phone: phone || null,
        is_active: isActive !== undefined ? isActive : true,
      })
      .eq("id", created.user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ userId: created.user.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, updates } = body || {}

    if (!id || !updates) {
      return NextResponse.json({ error: "Missing user id or updates" }, { status: 400 })
    }

    const admin = getAdminClient()

    if (updates.email || updates.password) {
      const authUpdates: { email?: string; password?: string } = {}
      if (updates.email) authUpdates.email = updates.email
      if (updates.password) authUpdates.password = updates.password

      const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdates)
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 })
      }
    }

    const profileUpdates = {
      name: updates.name,
      role: updates.role,
      location_id: updates.locationId ?? null,
      locations: updates.locations ?? null,
      phone: updates.phone ?? null,
      is_active: updates.isActive ?? true,
    }

    const { error: profileError } = await admin
      .from("user_profiles")
      .update(profileUpdates)
      .eq("id", id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const admin = getAdminClient()
    const { error: deleteError } = await admin.auth.admin.deleteUser(id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    await admin.from("user_profiles").delete().eq("id", id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}
