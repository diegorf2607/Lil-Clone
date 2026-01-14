# Ejecutar SQL en Supabase - Método Manual (Recomendado)

Como la ejecución automática puede tener limitaciones, aquí está el método más confiable:

## Pasos para ejecutar el SQL en Supabase

### 1. Obtener tu Service Role Key

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Busca **"service_role"** key (⚠️ **NO** uses la anon key)
4. Copia esta key (empieza con `eyJ...`)

### 2. Opción A: Usar SQL Editor (Más Fácil) ⭐

1. Ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Abre el archivo `supabase/schema.sql` de tu proyecto
4. **Copia TODO el contenido** del archivo
5. **Pega** en el SQL Editor de Supabase
6. Haz clic en **"Run"** o presiona `Ctrl+Enter`
7. Espera a que termine (puede tardar unos segundos)

### 3. Opción B: Usar el Script Node.js

Si prefieres automatizarlo:

1. Crea/edita `.env.local` en la raíz del proyecto:
```env
SUPABASE_URL=https://fcnmsoklpralaqxndyij.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

2. Ejecuta:
```bash
node scripts/setup-supabase.js
```

### 4. Verificar que las tablas se crearon

1. Ve a **Table Editor** en Supabase
2. Deberías ver estas 8 tablas:
   - ✅ `customers`
   - ✅ `staff`
   - ✅ `appointments`
   - ✅ `business_info`
   - ✅ `services`
   - ✅ `locations`
   - ✅ `app_users`
   - ✅ `reservations`

### 5. Si hay errores

- **"relation already exists"** → La tabla ya existe, está bien
- **"extension already exists"** → La extensión ya existe, está bien
- **Errores de permisos** → Verifica que estés usando la service_role key

## Nota Importante

El método más confiable es usar el **SQL Editor** directamente en Supabase (Opción A). Es más rápido y no requiere configuración adicional.
