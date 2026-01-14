# Migración a Supabase - Estado Actual

## ✅ Completado

1. **Configuración de Supabase:**
   - ✅ Creado `lib/supabase/client.ts` para cliente
   - ✅ Creado `lib/supabase/server.ts` para servidor
   - ✅ Creado esquema SQL completo en `supabase/schema.sql`

2. **Hooks y Utilidades:**
   - ✅ `useCRMStore` - Hook híbrido (Supabase + localStorage fallback) para CRM data
   - ✅ `useServices` - Hook para servicios
   - ✅ `useBusinessInfo` - Hook para información del negocio
   - ✅ Utilidades en `lib/supabase/services.ts`
   - ✅ Utilidades en `lib/supabase/business.ts`
   - ✅ Utilidades en `lib/supabase/locations.ts`

3. **Migración de Componentes:**
   - ✅ `app/dashboard/page.tsx` - Actualizado para usar hooks de Supabase
   - ✅ `app/dashboard/customers/page.tsx` - Actualizado para usar `useCRMStore`
   - ✅ `app/book/[slug]/page.tsx` - Actualizado para usar `useCRMStore`
   - ✅ `app/demo/page.tsx` - Actualizado para guardar en Supabase

## 🔄 En Progreso

4. **Migración de datos restantes:**
   - ⏳ Locations (app/dashboard/dueno/locations/page.tsx)
   - ⏳ Users (app/dashboard/dueno/users/page.tsx)
   - ⏳ Reservations (necesita migración completa)

## 📋 Próximos Pasos

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fcnmsoklpralaqxndyij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
```

### 2. Ejecutar el Esquema SQL

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a "SQL Editor"
3. Copia y pega el contenido de `supabase/schema.sql`
4. Ejecuta el script

### 3. Verificar Tablas Creadas

Las siguientes tablas deberían existir:
- ✅ `customers`
- ✅ `staff`
- ✅ `appointments`
- ✅ `business_info`
- ✅ `services`
- ✅ `locations`
- ✅ `app_users`
- ✅ `reservations`

### 4. Funcionalidad Híbrida

El sistema funciona de manera híbrida:
- **Si Supabase está configurado:** Usa Supabase como fuente principal
- **Si Supabase NO está configurado:** Usa localStorage como fallback
- **Siempre guarda en ambos:** Para mantener compatibilidad durante la migración

## 🔍 Archivos que Aún Usan localStorage Directamente

Estos archivos necesitan actualización:
- `app/dashboard/dueno/locations/page.tsx` - Usa localStorage directamente
- `app/dashboard/dueno/users/page.tsx` - Usa localStorage directamente
- `app/book/[slug]/page.tsx` - Carga servicios desde localStorage (necesita usar hook)
- `app/dashboard/page.tsx` - Algunas funciones aún usan localStorage directamente

## 📝 Notas Importantes

- Las imágenes de inspiración se guardan como JSONB en Supabase
- El sistema detecta automáticamente si Supabase está configurado
- Se mantiene compatibilidad con localStorage durante la transición
- Todos los datos se sincronizan automáticamente cuando Supabase está disponible
