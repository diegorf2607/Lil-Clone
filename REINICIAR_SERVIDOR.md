# 🔄 Cómo Reiniciar el Servidor de Desarrollo

## Método 1: Si el servidor está corriendo

1. **Ve a la terminal donde está corriendo el servidor**
2. **Presiona `Ctrl + C`** para detenerlo
3. **Ejecuta de nuevo:**
   ```bash
   pnpm dev
   ```

## Método 2: Si no sabes dónde está corriendo

### En Windows (PowerShell):
```powershell
# Detener todos los procesos de Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar el servidor
pnpm dev
```

### O simplemente:
1. Cierra todas las ventanas de terminal
2. Abre una nueva terminal
3. Navega a la carpeta del proyecto:
   ```bash
   cd C:\Users\Usuario\Downloads\Lil--main
   ```
4. Ejecuta:
   ```bash
   pnpm dev
   ```

## Método 3: Desde Cursor/VS Code

1. Abre la terminal integrada (`` Ctrl + ` `` o Terminal → New Terminal)
2. Si hay un servidor corriendo, haz clic en el ícono de "trash" o presiona `Ctrl + C`
3. Ejecuta:
   ```bash
   pnpm dev
   ```

## ✅ Verificar que está funcionando

Después de reiniciar, deberías ver algo como:
```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
- Ready in X seconds
```

## 🎯 Después de reiniciar

Una vez que el servidor esté corriendo:
1. Abre tu navegador en `http://localhost:3000`
2. La aplicación ahora usará Supabase automáticamente
3. Los datos se guardarán en la base de datos

## 💡 Tip

Si quieres ver los logs de Supabase en la consola del navegador:
1. Abre las DevTools (F12)
2. Ve a la pestaña "Console"
3. Deberías ver mensajes de conexión con Supabase (si hay errores, aparecerán aquí)
