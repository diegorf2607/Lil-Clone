# Configuración de Supabase para Lilá

## Pasos para conectar Supabase

### 1. Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fcnmsoklpralaqxndyij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 2. Ejecutar el esquema SQL

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a "SQL Editor"
3. Copia y pega el contenido de `supabase/schema.sql`
4. Ejecuta el script para crear todas las tablas

### 3. Verificar las tablas creadas

Las siguientes tablas deberían crearse:
- `customers` - Clientes
- `staff` - Personal/Manicuristas
- `appointments` - Citas con imágenes de inspiración
- `business_info` - Información del negocio
- `services` - Servicios
- `locations` - Ubicaciones
- `app_users` - Usuarios del sistema
- `reservations` - Reservas

### 4. Migración de datos

Los datos se migrarán automáticamente cuando se use la aplicación. El sistema:
- Intentará cargar datos de Supabase primero
- Si no hay datos, usará los datos de ejemplo
- Guardará automáticamente en Supabase cuando se creen nuevos registros

### 5. Verificar conexión

Una vez configurado, la aplicación debería:
- Conectarse a Supabase automáticamente
- Guardar todos los datos en la base de datos
- Sincronizar datos entre sesiones

## Notas importantes

- Las imágenes de inspiración se guardan como JSONB en la tabla `appointments`
- Los datos se sincronizan en tiempo real
- Se mantiene compatibilidad con localStorage durante la migración
