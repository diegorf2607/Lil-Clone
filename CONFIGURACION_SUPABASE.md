# Configuración de Supabase y usuarios demo

## Modo demo (sin configurar Supabase)

Si **no** configuras variables de entorno, la app usa **usuarios mock**:

| Rol        | Email              | Contraseña |
|-----------|--------------------|------------|
| Dueño     | dueno@lila.com     | demo123    |
| Admin     | admin@lila.com     | demo123    |
| Recepción | recepcion@lila.com | demo123    |
| Staff     | staff@lila.com     | demo123    |

Puedes entrar con cualquiera de estos sin tocar Supabase.  
*Recuperar contraseña y registro requieren Supabase.*

---

## Activar Supabase (auth real, CRM, recuperación de contraseña)

### 1. Variables de entorno

Copia `env.example` a `.env.local` y rellena:

```bash
cp env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui   # obligatorio para migrar usuarios demo
```

**Dónde obtener las claves:**

1. [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto  
2. **Settings** → **API**  
3. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`  
4. **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
5. **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (solo para el script de migración)

### 2. SQL en Supabase

En el proyecto → **SQL Editor**:

1. Ejecuta todo el contenido de `supabase/schema.sql` (tablas CRM, `locations`, etc.).
2. Después, ejecuta todo el contenido de `supabase/auth-schema.sql` (tabla `user_profiles` y triggers).

### 3. Crear usuarios demo en Auth

Añade en `.env.local` la **Service Role Key** (Supabase → Settings → API → `service_role`). Luego:

```bash
pnpm run migrate:users
```

El script crea dueno@lila.com, admin@lila.com, recepcion@lila.com, staff@lila.com con contraseña `demo123` en Supabase Auth. Sin la Service Role Key no se pueden crear usuarios.

### 4. Redirect URL para recuperar contraseña

En Supabase → **Authentication** → **URL Configuration** → **Redirect URLs**, añade:

- `http://localhost:3000/reset-password`
- `https://tu-dominio.com/reset-password` (si tienes deploy)

### 5. Probar

Reinicia el servidor (`pnpm dev`) e inicia sesión con `dueno@lila.com` / `demo123`.

---

## Deploy (Vercel, etc.)

Añade en tu plataforma las mismas variables que en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Si no las configuras en el deploy, la app usará el **modo demo** (usuarios mock) y los usuarios demo seguirán funcionando.
