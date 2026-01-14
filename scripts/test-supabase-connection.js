/**
 * Script para verificar la conexión con Supabase
 * Ejecuta: node scripts/test-supabase-connection.js
 */

const fs = require('fs');
const path = require('path');

// Cargar .env.local si existe
let envVars = {};
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        envVars[key.trim()] = values.join('=').trim();
      }
    }
  });
} catch (e) {
  console.log('⚠️  No se encontró .env.local');
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración de Supabase...\n');

if (!SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado');
  console.log('\n📝 Crea un archivo .env.local con:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurado');
  console.log('\n📝 Agrega a .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key');
  process.exit(1);
}

console.log('✅ Variables de entorno encontradas:');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

// Verificar que las tablas existan
async function testConnection() {
  try {
    console.log('🔌 Probando conexión con Supabase...\n');

    // Probar conexión básica
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Conexión exitosa con Supabase\n');

    // Verificar que las tablas existan
    const tables = [
      'customers',
      'staff',
      'appointments',
      'business_info',
      'services',
      'locations',
      'app_users',
      'reservations'
    ];

    console.log('📋 Verificando tablas...\n');

    for (const table of tables) {
      try {
        const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
        });

        if (tableResponse.ok) {
          console.log(`   ✅ ${table} - OK`);
        } else if (tableResponse.status === 404) {
          console.log(`   ❌ ${table} - No encontrada`);
        } else {
          console.log(`   ⚠️  ${table} - Error ${tableResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ ${table} - Error: ${error.message}`);
      }
    }

    console.log('\n✅ Verificación completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Reinicia tu servidor de desarrollo (pnpm dev)');
    console.log('   2. La aplicación usará Supabase automáticamente');
    console.log('   3. Los datos se guardarán en la base de datos\n');

  } catch (error) {
    console.error('❌ Error conectando con Supabase:', error.message);
    console.log('\n💡 Verifica:');
    console.log('   - Que las credenciales en .env.local sean correctas');
    console.log('   - Que el proyecto de Supabase esté activo');
    console.log('   - Que las tablas se hayan creado correctamente\n');
    process.exit(1);
  }
}

testConnection();
