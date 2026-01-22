# Configuración de Supabase Auth para Lilá

## 📋 Pasos para implementar autenticación completa

### 1. Ejecutar el Schema de Auth

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Ejecuta el contenido de `supabase/auth-schema.sql`

Este script creará:
- Tabla `user_profiles` que extiende `auth.users`
- Triggers para crear perfiles automáticamente al registrarse
- Políticas de Row Level Security (RLS)

### 2. Configurar Email Templates (Opcional pero recomendado)

En Supabase Dashboard:
1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates de:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### 3. Configurar Redirect URLs

En Supabase Dashboard:
1. Ve a **Authentication** → **URL Configuration**
2. Agrega a **Redirect URLs**:
   - `http://localhost:3000/reset-password`
   - `https://tu-dominio.com/reset-password`

### 4. Migrar Usuarios Demo

#### Opción A: Usando Service Role Key (Recomendado)

1. Obtén tu **Service Role Key**:
   - Supabase Dashboard → Settings → API
   - Copia la clave **service_role** (⚠️ NUNCA la expongas en el frontend)

2. Agrega a `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

3. Ejecuta el script de migración:
   ```bash
   node scripts/migrate-demo-users.js
   ```

#### Opción B: Crear usuarios manualmente

1. Ve a **Authentication** → **Users** en Supabase Dashboard
2. Crea cada usuario manualmente:
   - **dueno@lila.com** - Rol: dueno
   - **admin@lila.com** - Rol: administrador
   - **recepcion@lila.com** - Rol: recepcionista
   - **staff@lila.com** - Rol: staff

3. Después de crear cada usuario, actualiza su perfil en la tabla `user_profiles`:
   ```sql
   UPDATE user_profiles 
   SET name = 'María González', role = 'dueno'
   WHERE email = 'dueno@lila.com';
   ```

### 5. Verificar Configuración

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Intenta iniciar sesión con:
   - Email: `dueno@lila.com`
   - Contraseña: `demo123`

3. Verifica en la consola del navegador que no haya errores

## 🔐 Funcionalidades Implementadas

### ✅ Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Logout
- Sesiones persistentes con tokens
- Middleware para proteger rutas

### ✅ Recuperación de Contraseña
- Solicitar reset de contraseña (`/forgot-password`)
- Reset de contraseña con token (`/reset-password`)
- Email de recuperación automático

### ✅ Seguridad
- Hash de contraseñas (manejado por Supabase)
- Tokens de sesión seguros
- Row Level Security (RLS) en perfiles
- Protección de rutas con middleware

## 📝 Notas Importantes

1. **Service Role Key**: Solo úsala en scripts del servidor, NUNCA en el frontend
2. **Email Confirmation**: Los usuarios demo se crean con email confirmado automáticamente
3. **RLS Policies**: Las políticas permiten que los usuarios vean sus propios perfiles y los autenticados vean otros perfiles (para búsquedas de staff, etc.)
4. **Migración**: El sistema ahora usa Supabase Auth en lugar de localStorage

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` tenga `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Error: "User already exists"
- El script de migración maneja esto automáticamente
- Si persiste, elimina el usuario en Supabase Dashboard y vuelve a ejecutar

### Error: "Invalid login credentials"
- Verifica que el usuario exista en Supabase Auth
- Verifica que el perfil esté creado en `user_profiles`

### El email de recuperación no llega
- Verifica la configuración de email en Supabase
- Revisa la carpeta de spam
- En desarrollo, los emails pueden ir a la consola de Supabase

## 🔄 Migración desde localStorage

El sistema ahora usa Supabase Auth. Los usuarios antiguos en localStorage ya no funcionarán. Debes:

1. Ejecutar el script de migración para crear los usuarios en Supabase
2. Los usuarios deberán usar sus credenciales en Supabase Auth
3. Los datos de clientes, citas, etc. siguen funcionando igual (ya estaban en Supabase)
