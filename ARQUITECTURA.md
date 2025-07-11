# 📊 ARQUITECTURA DEL SISTEMA

## 🏗️ ESTRUCTURA SÚPER SIMPLE

| Archivo | Qué hace | Por qué es importante |
|---------|----------|----------------------|
| **index.html** | Login + Calculadora de bonos | Donde entran los asesores |
| **admin.html** | Panel de administración | Donde el admin gestiona todo |
| **app.js** | Toda la lógica de cálculos | El cerebro del sistema |
| **admin.js** | Funciones del admin | Gestión de asesores y config |
| **styles.css** | Todos los estilos | Diseño hermoso que ya tenías |
| **README.md** | Documentación | Para entender el sistema |

## 🔧 CÓMO FUNCIONA

```
ASESOR                    ADMIN
  ↓                         ↓
index.html              admin.html
  ↓                         ↓
Selecciona nombre       Gestiona asesores
  ↓                         ↓
Pone contraseña        Cambia configuraciones
  ↓                         ↓
Calcula bonos          Modifica nombres bonos
  ↓                         ↓
  └────── SUPABASE ────────┘
         (Todo online)
```

## 💾 DATOS EN SUPABASE

| Tabla | Qué guarda |
|-------|------------|
| **asesores** | Lista de asesores (nombre, email, activo) |
| **usuarios** | Contraseñas de cada asesor |
| **configuracion_sistema** | Todas las metas, bonos, nombres |
| **historial_calculos** | Cada cálculo que hace un asesor |

## ✅ VENTAJAS DE ESTA ARQUITECTURA

1. **SIMPLE**: Solo 5 archivos principales
2. **TODO EN UNO**: No más 9 carpetas separadas
3. **ONLINE**: Todo en Supabase (backup automático)
4. **FLEXIBLE**: Admin cambia TODO sin programar
5. **ESCALABLE**: Agregar asesores = 1 click

## 🚀 PARA DEPLOY

- **Render**: Sitio estático (gratis)
- **Supabase**: Ya configurado (gratis hasta 500MB)
- **Sin servidor**: Todo funciona en el navegador

## 🔐 SEGURIDAD

- Contraseñas en Supabase (no en el código)
- Admin separado con su propia contraseña
- Cada asesor solo ve sus datos

¡Así de simple! No necesitas saber más. 🎉 