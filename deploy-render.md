# 🚀 GUÍA DE DESPLIEGUE EN RENDER

## PASO 1: Preparar tu Código
1. Sube todo el contenido de la carpeta `sersa-bonos/` a tu repositorio GitHub

## PASO 2: Crear Servicio en Render
1. Ve a [render.com](https://render.com)
2. Click en **"New +"** → **"Static Site"**
3. Conecta tu GitHub
4. Selecciona tu repositorio

## PASO 3: Configuración
- **Name**: `sersa-bonos`
- **Branch**: `main` (o la que uses)
- **Root Directory**: `sersa-bonos` (si subiste toda la carpeta)
- **Build Command**: (dejar vacío)
- **Publish Directory**: `.` (punto)

## PASO 4: Deploy
1. Click en **"Create Static Site"**
2. Espera que se despliegue (2-3 minutos)
3. Tu app estará en: `https://sersa-bonos.onrender.com`

## 📋 IMPORTANTE:
- **Supabase ya está configurado** en el código
- **No necesitas variables de entorno** en Render
- **Todo es estático** (HTML, CSS, JS)

## 🔐 ACCESOS:
- **Admin**: `/admin.html` → Contraseña: `gtadmin`
- **Asesores**: `/index.html` → Usar su contraseña personal

## ✅ LISTO PARA USAR:
1. El admin puede agregar asesores desde el panel
2. El admin puede cambiar TODAS las configuraciones
3. Los asesores entran con su contraseña
4. Todo se guarda en Supabase automáticamente

¡Eso es todo! 🎉 