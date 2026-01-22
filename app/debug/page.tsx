"use client"

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isConfigured = !!(
    typeof window !== "undefined" &&
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== "https://your-project.supabase.co"
  )
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#2C293F]">🔍 Debug Supabase Connection</h1>
      
      <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">Estado de Supabase:</span>
            {isConfigured ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Configurado
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                ❌ NO configurado
              </span>
            )}
          </div>
          
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <p>
              <strong>Supabase URL:</strong>{" "}
              {supabaseUrl ? (
                <span className="text-green-600">✅ Configurada</span>
              ) : (
                <span className="text-red-600">❌ NO configurada</span>
              )}
            </p>
            {supabaseUrl && (
              <p className="text-xs text-gray-500 pl-4">
                URL: {supabaseUrl.substring(0, 50)}...
              </p>
            )}
            
            <p>
              <strong>Supabase Anon Key:</strong>{" "}
              {supabaseKey ? (
                <span className="text-green-600">✅ Configurada</span>
              ) : (
                <span className="text-red-600">❌ NO configurada</span>
              )}
            </p>
            {supabaseKey && (
              <p className="text-xs text-gray-500 pl-4">
                Key: {supabaseKey.substring(0, 20)}...{supabaseKey.substring(supabaseKey.length - 10)}
              </p>
            )}
          </div>
        </div>
        
        {!isConfigured && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-bold text-yellow-800 mb-2">⚠️ Supabase NO está configurado</p>
            <p className="text-sm text-yellow-700 mb-3">
              Crea un archivo <code className="bg-yellow-100 px-1 rounded">.env.local</code> en la raíz del proyecto con:
            </p>
            <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui`}
            </pre>
            <p className="text-sm text-yellow-700 mt-3">
              <strong>Dónde encontrar tu ANON KEY:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1 mt-2">
              <li>Ve a Supabase Dashboard → Tu Proyecto</li>
              <li>Settings → API</li>
              <li>Copia la clave "anon" o "public" (NO la service_role)</li>
            </ol>
            <p className="text-sm text-yellow-700 mt-3">
              <strong>Importante:</strong> Después de crear/modificar <code className="bg-yellow-100 px-1 rounded">.env.local</code>, 
              debes reiniciar el servidor de desarrollo.
            </p>
          </div>
        )}
        
        {isConfigured && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-bold text-green-800 mb-2">✅ Supabase está configurado correctamente</p>
            <p className="text-sm text-green-700">
              Si sigues teniendo problemas, verifica:
            </p>
            <ul className="list-disc list-inside text-sm text-green-700 space-y-1 mt-2">
              <li>Que las tablas existan en Supabase (customers, staff, appointments)</li>
              <li>Que las políticas RLS permitan acceso</li>
              <li>Revisa la consola del navegador para más detalles</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-2">💡 Información adicional</h2>
        <p className="text-sm text-blue-800">
          El sistema requiere Supabase para cargar y guardar datos.
        </p>
        <p className="text-xs text-blue-600 mt-3">
          Revisa la consola del navegador (F12) para ver logs detallados de la conexión.
        </p>
      </div>
    </div>
  )
}