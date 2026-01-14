/**
 * Script para probar la inserción de un cliente en Supabase
 */

const fs = require('fs');
const path = require('path');

// Cargar .env.local
let envVars = {};
try {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        envVars[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
} catch (e) {
  console.log('⚠️  No se encontró .env.local');
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

async function testInsert() {
  try {
    console.log('🧪 Probando inserción de cliente en Supabase...\n');

    // Don't pass id - let Supabase generate UUID automatically
    const testCustomer = {
      full_name: 'Cliente de Prueba',
      phone: `+123456789${Date.now()}`,
      email: 'test@example.com',
      birthdate: '1990-01-01',
    };

    console.log('📝 Datos del cliente de prueba:');
    console.log(JSON.stringify(testCustomer, null, 2));
    console.log('\n');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(testCustomer),
    });

    const responseText = await response.text();
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📄 Response: ${responseText}\n`);

    if (!response.ok) {
      console.error('❌ Error al insertar cliente');
      console.error('Detalles:', responseText);
      
      if (response.status === 401 || response.status === 403) {
        console.error('\n💡 Posible problema: Políticas RLS (Row Level Security)');
        console.error('   Verifica en Supabase Dashboard → Authentication → Policies');
        console.error('   Asegúrate de que la política permita INSERT para usuarios anónimos');
      }
      
      process.exit(1);
    }

    const data = JSON.parse(responseText);
    console.log('✅ Cliente insertado exitosamente!');
    console.log('📋 Datos insertados:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n✅ La conexión con Supabase funciona correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testInsert();
