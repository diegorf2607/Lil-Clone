/**
 * Script alternativo que ejecuta SQL directamente usando psql o la API REST
 * 
 * Este script intenta ejecutar el SQL completo de una vez usando la API REST de Supabase
 */

const fs = require('fs');
const path = require('path');

// Cargar .env.local
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (e) {
  console.log('No se encontró .env.local');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('\nCrea .env.local con:');
  console.log('SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

async function executeSQL() {
  try {
    const sqlPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando esquema SQL completo...\n');

    // Usar la API REST de Supabase para ejecutar SQL
    // Nota: Supabase no tiene un endpoint directo para ejecutar SQL arbitrario
    // Necesitamos usar el método de PostgREST o ejecutar manualmente
    
    console.log('⚠️  Supabase no permite ejecutar SQL arbitrario vía API REST por seguridad.');
    console.log('\n📋 Por favor, ejecuta el SQL manualmente:');
    console.log('\n1. Ve a: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('//')[1].split('.')[0]);
    console.log('2. Ve a "SQL Editor"');
    console.log('3. Copia el contenido de: supabase/schema.sql');
    console.log('4. Pégalo y ejecuta (Ctrl+Enter)\n');
    
    console.log('📄 Contenido del SQL (primeras 500 caracteres):');
    console.log(sql.substring(0, 500) + '...\n');
    
    console.log('✅ Alternativamente, puedes usar el SQL Editor directamente en Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

executeSQL();
