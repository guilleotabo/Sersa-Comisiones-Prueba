# 🧮 Sistema de Comisiones SERSA v2.0

Sistema de cálculo de comisiones para asesores comerciales, completamente renovado con base de datos Supabase y arquitectura simplificada.

## 🚀 Características Principales

- ✅ **Sistema Unificado**: Una sola aplicación para todos los asesores
- ✅ **Base de Datos Online**: Integración completa con Supabase (PostgreSQL)
- ✅ **Panel de Administración**: Gestión completa de asesores y configuraciones
- ✅ **Calculadora Avanzada**: Cálculo automático de bonos con multiplicadores
- ✅ **Nombres Personalizables**: Cambiar nombres de bonos desde el admin
- ✅ **Reportes en PDF**: Generación automática de reportes
- ✅ **Responsive**: Diseño adaptable a móviles y escritorio
- ✅ **Backup Automático**: Sincronización en tiempo real con la nube

## 📁 Estructura del Proyecto (Nueva Arquitectura)

```
Sersa-Comisiones-Prueba/
├── 🏠 index.html                    # Página principal (Login + Calculadora)
├── 🔧 admin.html                    # Panel de administración completo
├── ⚙️ app.js                        # Lógica principal del sistema
├── 🛠️ admin.js                      # Lógica del panel de administración
├── 🎨 styles.css                    # Estilos principales
├── 💎 bonos.css                     # Estilos específicos de bonos
├── 📚 README.md                     # Este archivo
├── 🏗️ ARQUITECTURA.md               # Documentación técnica detallada
├── 🚀 deploy-render.md              # Guía de despliegue en Render
└── 📂 backup-raiz-original/         # Archivos originales (respaldo)
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
- **Panel de Administración**: `http://localhost:8000/admin.html`

## 🗄️ Base de Datos (Supabase)

### Tablas Principales:

#### `asesores`
- `id` (UUID) - Identificador único
- `nombre` (TEXT) - Nombre del asesor
- `email` (TEXT) - Email del asesor
- `activo` (BOOLEAN) - Estado activo/inactivo
- `created_at` (TIMESTAMP) - Fecha de creación

#### `usuarios`
- `id` (UUID) - Identificador único
- `nombre` (TEXT) - Nombre del asesor
- `password` (TEXT) - Contraseña del asesor
- `activo` (BOOLEAN) - Estado activo/inactivo
- `created_at` (TIMESTAMP) - Fecha de creación

#### `configuracion_sistema`
- `id` (UUID) - Identificador único
- `clave` (TEXT) - Nombre de la configuración
- `valor` (JSONB) - Valor de la configuración
- `descripcion` (TEXT) - Descripción de la configuración
- `updated_at` (TIMESTAMP) - Última actualización

#### `historial_calculos`
- `id` (UUID) - Identificador único
- `asesor` (TEXT) - Nombre del asesor
- `fecha` (TIMESTAMP) - Fecha del cálculo
- `datos_calculo` (JSONB) - Datos completos del cálculo
- `resultado` (JSONB) - Resultado del cálculo

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
- **URL**: `/admin.html`

## 🎯 Funcionalidades Principales

### **Sistema Unificado**
- Login único con selector de asesor
- Calculadora integrada en la página principal
- Configuraciones personalizadas por asesor
- Historial de cálculos automático

### **Calculadora de Comisiones**
- Cálculo automático de bonos por nivel
- Multiplicadores dinámicos (conversión, empatía, proceso, mora)
- Barras de progreso visuales
- Sugerencias de optimización automáticas
- Generación de reportes PDF

### **Panel de Administración Completo**
- **Gestión de Asesores**: Agregar, editar, eliminar asesores
- **Configuración del Sistema**: Cambiar todos los parámetros
- **Personalización de Bonos**: Cambiar nombres y valores de bonos
- **Reportes y Estadísticas**: Ver historial completo
- **Respaldo de Datos**: Exportar/importar configuraciones

### **Nuevas Características v2.0**
- ✨ **Nombres Personalizables**: Cambiar nombres de bonos desde el admin
- ✨ **Gestión Simplificada**: Un solo lugar para todo
- ✨ **Backup Automático**: Sincronización constante con Supabase
- ✨ **Interfaz Mejorada**: Diseño más limpio y funcional

## 🚀 Despliegue

### **Render (Recomendado)**
1. Crear cuenta en Render
2. Conectar repositorio de GitHub
3. Configurar como "Static Site"
4. Configurar variables de entorno de Supabase
5. Desplegar automáticamente

### **Otras Opciones:**

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
// Obtener todos los asesores
const asesores = await obtenerAsesores();

// Validar login de asesor
const esValido = await validarAsesor('Base', '20');

// Obtener configuración del sistema
const config = await obtenerConfiguracion('salario_base');

// Actualizar configuración
await actualizarConfiguracion('salario_base', nuevoValor);

// Guardar cálculo en historial
await guardarCalculoEnHistorial('Alejandra', datosCalculo);

// Agregar nuevo asesor
await agregarAsesor('Nuevo', 'password', 'email@ejemplo.com');

// Eliminar asesor
await eliminarAsesor('Nombre');
```

## 🔄 Changelog

### **v2.0.0** (Actual - Enero 2025)
- ✅ **Arquitectura Simplificada**: Sistema unificado en la raíz
- ✅ **Integración Completa Supabase**: Base de datos online
- ✅ **Panel Admin Renovado**: Gestión completa desde una interfaz
- ✅ **Nombres Personalizables**: Cambiar nombres de bonos
- ✅ **Eliminación de Duplicados**: Un solo sistema para todos
- ✅ **Optimización de Rendimiento**: Carga más rápida
- ✅ **Documentación Completa**: Guías de uso y despliegue

### **v1.0.0**
- ✅ Sistema base con archivos locales
- ✅ Calculadora de comisiones
- ✅ Panel de administración básico
- ✅ Carpetas separadas por asesor

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema propio con Supabase
- **Reportes**: jsPDF
- **Estilos**: CSS Grid, Flexbox, Variables CSS
- **Iconos**: Unicode Emoji
- **Arquitectura**: SPA (Single Page Application)

## 📚 Documentación Adicional

- **[ARQUITECTURA.md](./ARQUITECTURA.md)**: Documentación técnica detallada
- **[deploy-render.md](./deploy-render.md)**: Guía paso a paso para desplegar en Render

## 🔧 Configuración de Supabase

### Variables de Entorno Requeridas:
```javascript
const SUPABASE_URL = 'tu_url_de_supabase'
const SUPABASE_KEY = 'tu_clave_publica_de_supabase'
```

### Configuración en `app.js`:
```javascript
// Configurar en líneas 4-5
const supabaseUrl = 'TU_URL_AQUÍ';
const supabaseKey = 'TU_CLAVE_AQUÍ';
```

## 📞 Soporte y Troubleshooting

### **Problemas Comunes:**

1. **Error de Conexión a Supabase**
   - Verificar URL y clave en `app.js`
   - Comprobar políticas RLS en Supabase
   - Revisar consola del navegador

2. **Asesor No Encontrado**
   - Verificar que el asesor esté en la tabla `usuarios`
   - Comprobar que `activo = true`
   - Revisar contraseña correcta

3. **Cálculos Incorrectos**
   - Verificar configuración en tabla `configuracion_sistema`
   - Comprobar multiplicadores en el admin
   - Revisar valores base actualizados

### **Logs y Depuración:**
- Abrir herramientas de desarrollador (F12)
- Revisar consola para errores
- Verificar tab "Network" para errores de API

## 📝 Licencia

Este proyecto es de uso interno para SERSA.

---

**Desarrollado con ❤️ para el equipo de SERSA**  
**Sistema de Comisiones v2.0 - Enero 2025** 