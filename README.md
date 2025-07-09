# 🧮 Sistema de Comisiones SERSA

Sistema de cálculo de comisiones para asesores comerciales, integrado con base de datos Supabase.

## 🚀 Características

- ✅ **Calculadora de Comisiones**: Interfaz moderna para calcular bonos y comisiones
- ✅ **Multi-Asesor**: Soporte para múltiples asesores con configuraciones individuales
- ✅ **Base de Datos**: Integración completa con Supabase (PostgreSQL)
- ✅ **Panel de Administración**: Gestión de asesores, contraseñas y configuraciones
- ✅ **Reportes**: Generación de reportes en PDF
- ✅ **Responsive**: Diseño adaptable a móviles y escritorio

## 📁 Estructura del Proyecto

```
Sersa-Comisiones-Prueba/
├── 📱 app/                          # Aplicación principal
│   ├── calculadora.html             # Calculadora de comisiones
│   ├── calculadora.js               # Lógica de cálculos
│   ├── supabase-config.js          # Configuración de Supabase
│   ├── configuracion-base.js        # Configuración base del sistema
│   ├── reportes.js                  # Generación de reportes
│   ├── asesores.html               # Selector de asesores
│   ├── estilos-principales.css      # Estilos principales
│   └── estilos-bonos.css           # Estilos específicos de bonos
├── 🛠️ administracion/               # Panel de administración
│   ├── login.html                   # Login de administrador
│   ├── dashboard.html               # Dashboard principal
│   └── index.html                   # Redirección automática
├── 📋 index.html                    # Página principal
├── 📦 Comisiones-Sersa/            # Respaldo del sistema original
└── 📄 README.md                     # Este archivo
```

## 🔧 Instalación y Uso

### 1. **Clonar el Repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd Sersa-Comisiones-Prueba
```

### 2. **Configurar Servidor Local**
```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx serve .

# Opción 3: PHP
php -S localhost:8000
```

### 3. **Acceder a la Aplicación**
- **Página Principal**: `http://localhost:8000`
- **Calculadora**: `http://localhost:8000/app/calculadora.html`
- **Administración**: `http://localhost:8000/administracion/`

## 🗄️ Base de Datos (Supabase)

### Tablas Principales:

#### `asesores`
- `id` (UUID) - Identificador único
- `nombre` (TEXT) - Nombre del asesor
- `email` (TEXT) - Email del asesor
- `activo` (BOOLEAN) - Estado activo/inactivo
- `created_at` (TIMESTAMP) - Fecha de creación

#### `contraseñas`
- `id` (UUID) - Identificador único
- `asesor` (TEXT) - Nombre del asesor
- `password` (TEXT) - Contraseña del asesor
- `updated_at` (TIMESTAMP) - Última actualización

#### `configuraciones`
- `id` (UUID) - Identificador único
- `asesor` (TEXT) - Nombre del asesor
- `configuracion` (JSONB) - Configuración completa del asesor
- `updated_at` (TIMESTAMP) - Última actualización

## 👥 Asesores Configurados

| Asesor | Contraseña | Estado |
|--------|-----------|---------|
| Base | `20` | ✅ Activo |
| Alejandra | `comercial2020` | ✅ Activo |
| Aletzia | `comercial2020` | ✅ Activo |
| Alvaro | `comercial2020` | ✅ Activo |
| Erika | `comercial2020` | ✅ Activo |
| Juan | `comercial2020` | ✅ Activo |
| Maximiliano | `comercial2027` | ✅ Activo |
| Micaela | `comercial2026` | ✅ Activo |
| Rodrigo | `comercial2028` | ✅ Activo |

## 🔐 Acceso de Administrador

- **Usuario**: Administrador
- **Contraseña**: `gtadmin`
- **URL**: `/administracion/`

## 🎯 Funcionalidades Principales

### **Calculadora de Comisiones**
- Cálculo automático de bonos por nivel
- Multiplicadores dinámicos (conversión, empatía, proceso, mora)
- Visualización en tiempo real
- Generación de reportes PDF

### **Panel de Administración**
- Gestión de asesores
- Configuración de parámetros
- Cambio de contraseñas
- Estadísticas y reportes

### **Integración con Supabase**
- Carga automática de configuraciones
- Sincronización en tiempo real
- Backup automático de datos
- Gestión centralizada

## 🚀 Despliegue

### **Opciones de Despliegue:**

1. **GitHub Pages**
   - Subir código a GitHub
   - Activar GitHub Pages
   - Configurar dominio personalizado

2. **Netlify**
   - Conectar repositorio de GitHub
   - Despliegue automático
   - HTTPS gratuito

3. **Vercel**
   - Importar proyecto desde GitHub
   - Despliegue instantáneo
   - Dominio personalizado

## 📊 API de Supabase

### **Funciones Disponibles:**

```javascript
// Obtener contraseña de asesor
const password = await obtenerPasswordAsesor('Base');

// Obtener configuración de asesor
const config = await obtenerConfigAsesor('Alejandra');

// Actualizar contraseña
await actualizarPasswordAsesor('Juan', 'nueva_contraseña');

// Agregar nuevo asesor
await agregarNuevoAsesor('Nuevo', 'email@ejemplo.com', 'password', config);

// Eliminar asesor
await eliminarAsesor('Nombre');
```

## 🔄 Changelog

### **v2.0.0** (Actual)
- ✅ Integración completa con Supabase
- ✅ Eliminación de archivos locales obsoletos
- ✅ Optimización de rendimiento
- ✅ Estructura simplificada

### **v1.0.0**
- ✅ Sistema base con archivos locales
- ✅ Calculadora de comisiones
- ✅ Panel de administración básico

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema propio con Supabase
- **Reportes**: jsPDF
- **Estilos**: CSS Grid, Flexbox
- **Iconos**: Unicode Emoji

## 📞 Soporte

Para soporte técnico o consultas:
- Revisar la documentación en este README
- Verificar logs en la consola del navegador
- Comprobar conexión a Supabase

## 📝 Licencia

Este proyecto es de uso interno para SERSA.

---

**Desarrollado con ❤️ para el equipo de SERSA** 