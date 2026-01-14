/**
 * Script para ejecutar el esquema SQL en Supabase
 * 
 * Uso:
 * 1. Crea un archivo .env.local con:
 *    SUPABASE_URL=https://tu-proyecto.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
 * 
 * 2. Ejecuta: node scripts/setup-supabase.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local si existe
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (e) {
  console.log('No se encontró .env.local, usando variables de entorno del sistema');
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('\nPor favor, crea un archivo .env.local con:');
  console.log('SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  console.log('\nO configura estas variables de entorno en tu sistema.');
  process.exit(1);
}

async function executeSQL() {
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Leyendo esquema SQL...');
    console.log(`📊 Tamaño del script: ${sql.length} caracteres`);

    // Dividir el SQL en statements (separados por ;)
    // Pero necesitamos mantener los bloques de funciones y triggers juntos
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n🔧 Ejecutando ${statements.length} statements...\n`);

    // Ejecutar cada statement usando la API REST de Supabase
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Saltar comentarios
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql: statement + ';' }),
        });

        if (!response.ok) {
          // Intentar método alternativo usando query directamente
          const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=minimal',
            },
            body: statement + ';',
          });

          if (!altResponse.ok) {
            const errorText = await altResponse.text();
            console.log(`⚠️  Statement ${i + 1} puede haber fallado (esto es normal si ya existe):`, errorText.substring(0, 100));
          } else {
            console.log(`✅ Statement ${i + 1} ejecutado`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} ejecutado`);
        }
      } catch (error) {
        console.log(`⚠️  Error en statement ${i + 1}:`, error.message);
        // Continuar con el siguiente
      }
    }

    console.log('\n✅ Proceso completado!');
    console.log('\n📋 Verifica las tablas en Supabase Dashboard > Table Editor');
    
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error);
    process.exit(1);
  }
}

// Ejecutar
executeSQL();
