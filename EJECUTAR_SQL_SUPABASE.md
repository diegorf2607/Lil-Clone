# 🚀 Cómo Ejecutar el SQL en Supabase

## ⚡ Método Rápido (Recomendado)

### Paso 1: Abre Supabase Dashboard
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto

### Paso 2: Abre SQL Editor
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en el botón **"New query"** (o el ícono **"+"**)

### Paso 3: Copia el SQL
1. Abre el archivo `supabase/schema.sql` en tu proyecto
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)

### Paso 4: Pega y Ejecuta
1. **Pega** el SQL en el editor de Supabase (Ctrl+V)
2. Haz clic en el botón **"Run"** (o presiona `Ctrl+Enter`)
3. Espera unos segundos mientras se ejecuta

### Paso 5: Verifica
1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver 8 tablas nuevas:
   - ✅ `customers`
   - ✅ `staff`
   - ✅ `appointments`
   - ✅ `business_info`
   - ✅ `services`
   - ✅ `locations`
   - ✅ `app_users`
   - ✅ `reservations`

## 📝 Notas Importantes

- ⚠️ Si ves warnings como "relation already exists", es normal (las tablas ya existían)
- ✅ El script usa `CREATE TABLE IF NOT EXISTS` para evitar errores
- 🔒 Las políticas de seguridad (RLS) se habilitan automáticamente
- 📊 Los índices se crean para mejorar el rendimiento

## 🐛 Si hay errores

### Error: "permission denied"
- Verifica que estés usando la cuenta correcta del proyecto
- Asegúrate de tener permisos de administrador

### Error: "relation already exists"
- Esto es normal si las tablas ya existen
- Puedes ignorarlo o eliminar las tablas primero si quieres empezar de cero

### Error: "extension uuid-ossp already exists"
- La extensión ya está instalada, es normal
- Puedes ignorar este mensaje

## ✅ Después de ejecutar

Una vez que las tablas estén creadas:
1. Verifica que tu `.env.local` tenga las credenciales correctas
2. Reinicia tu servidor de desarrollo (`pnpm dev`)
3. Los datos se guardarán automáticamente en Supabase

## 🔄 Migración de datos existentes

Si tienes datos en localStorage que quieres migrar:
1. Los datos se migrarán automáticamente cuando uses la aplicación
2. El sistema detecta si Supabase está configurado y usa la base de datos
3. Si Supabase no está configurado, seguirá usando localStorage
