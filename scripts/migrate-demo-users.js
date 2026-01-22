/**
 * Script para migrar usuarios demo a Supabase Auth
 * 
 * Ejecutar con: node scripts/migrate-demo-users.js
 * 
 * Requiere variables de entorno:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (para crear usuarios directamente)
 */

const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Faltan variables de entorno\n")
  console.log("Añade en .env.local:")
  console.log("  NEXT_PUBLIC_SUPABASE_URL=tu-url")
  console.log("  SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key\n")
  console.log("Service Role Key: Supabase Dashboard → tu proyecto → Settings → API → service_role")
  process.exit(1)
}

// Usar service role key para poder crear usuarios directamente
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const demoUsers = [
  {
    email: "dueno@lila.com",
    password: "demo123",
    name: "María González",
    role: "dueno",
    locations: [], // Se puede actualizar después
  },
  {
    email: "admin@lila.com",
    password: "demo123",
    name: "Carlos Ramírez",
    role: "administrador",
    locationId: null, // Se puede actualizar después
  },
  {
    email: "recepcion@lila.com",
    password: "demo123",
    name: "Ana Martínez",
    role: "recepcionista",
    locationId: null,
  },
  {
    email: "staff@lila.com",
    password: "demo123",
    name: "Luis Torres",
    role: "staff",
    locationId: null,
  },
]

async function migrateUsers() {
  console.log("🚀 Iniciando migración de usuarios demo...\n")

  for (const userData of demoUsers) {
    try {
      console.log(`📝 Creando usuario: ${userData.email}...`)

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          name: userData.name,
          role: userData.role,
        },
      })

      if (authError) {
        // Si el usuario ya existe, intentar actualizar
        if (authError.message.includes("already registered")) {
          console.log(`  ⚠️  Usuario ${userData.email} ya existe, actualizando perfil...`)
          
          // Buscar usuario existente
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users.find(u => u.email === userData.email)
          
          if (existingUser) {
            // Actualizar perfil
            const { error: profileError } = await supabase
              .from("user_profiles")
              .upsert({
                id: existingUser.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                location_id: userData.locationId || null,
                locations: userData.locations || [],
                is_active: true,
              }, {
                onConflict: "id",
              })

            if (profileError) {
              console.error(`  ❌ Error actualizando perfil: ${profileError.message}`)
            } else {
              console.log(`  ✅ Perfil actualizado para ${userData.email}`)
            }
          }
          continue
        }
        
        console.error(`  ❌ Error creando usuario: ${authError.message}`)
        continue
      }

      if (!authData.user) {
        console.error(`  ❌ No se pudo crear el usuario ${userData.email}`)
        continue
      }

      // Crear/actualizar perfil en user_profiles
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          location_id: userData.locationId || null,
          locations: userData.locations || [],
          is_active: true,
        }, {
          onConflict: "id",
        })

      if (profileError) {
        console.error(`  ❌ Error creando perfil: ${profileError.message}`)
      } else {
        console.log(`  ✅ Usuario ${userData.email} creado exitosamente`)
        console.log(`     - ID: ${authData.user.id}`)
        console.log(`     - Rol: ${userData.role}`)
      }
    } catch (error) {
      console.error(`  ❌ Error inesperado: ${error.message}`)
    }
  }

  console.log("\n✨ Migración completada!")
  console.log("\n📋 Usuarios creados:")
  demoUsers.forEach(user => {
    console.log(`   - ${user.email} (${user.role}) - Contraseña: ${user.password}`)
  })
}

// Ejecutar migración
migrateUsers().catch(console.error)
