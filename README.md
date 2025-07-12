# 🧮 Sistema de Comisiones SERSA v2.1

Sistema de cálculo de comisiones para asesores comerciales, completamente renovado con base de datos Supabase, multiplicadores configurables y arquitectura simplificada.

## 🚀 Características Principales

- ✅ **Sistema Unificado**: Una sola aplicación para todos los asesores
- ✅ **Base de Datos Online**: Integración completa con Supabase (PostgreSQL)
- ✅ **Panel de Administración**: Gestión completa de asesores y configuraciones
- ✅ **Calculadora Avanzada**: Cálculo automático de bonos con multiplicadores
- ✅ **Multiplicadores Configurables**: Sistema flexible para personalizar multiplicadores
- ✅ **Nombres Personalizables**: Cambiar nombres de bonos desde el admin
- ✅ **Reportes en PDF**: Generación automática de reportes
- ✅ **Responsive**: Diseño adaptable a móviles y escritorio
- ✅ **Backup Automático**: Sincronización en tiempo real con la nube

## 📁 Estructura del Proyecto (Arquitectura Unificada)

```
Sersa-Comisiones-Prueba/
├── 🏠 index.html                    # Página principal (Login + Calculadora)
├── 🔧 admin.html                    # Panel de administración completo
├── ⚙️ app.js                        # Lógica principal del sistema
├── 🛠️ admin.js                      # Lógica del panel de administración
├── 🎨 styles.css                    # Estilos principales
├── 💎 bonos.css                     # Estilos específicos de bonos
├── 📚 README.md                     # Documentación completa
├── 🏗️ ARQUITECTURA.md               # Documentación técnica detallada
└── 📊 estructura-multiplicadores.md # Especificación de multiplicadores configurables
```

## 🎯 Funcionalidades Principales

### **Sistema Unificado**
- Login único con selector de asesor
- Calculadora integrada en la página principal
- Configuraciones personalizadas por asesor
- Historial de cálculos automático

### **Calculadora de Comisiones Avanzada**
- Cálculo automático de bonos por nivel
- **Multiplicadores configurables dinámicos**:
  - 🎯 **Tasa de Conversión**: Porcentaje de conversión de leads
  - 💬 **Nivel de Empatía**: Satisfacción del cliente
  - 📋 **Cumplimiento de Proceso**: Adherencia a procesos
  - 💰 **Índice de Mora**: Control de mora en cartera
- Barras de progreso visuales
- Sugerencias de optimización automáticas
- Generación de reportes PDF

### **Panel de Administración Completo**
- **Gestión de Asesores**: Agregar, editar, eliminar asesores
- **Configuración del Sistema**: Cambiar todos los parámetros
- **Personalización de Bonos**: Cambiar nombres y valores de bonos
- **📊 Multiplicadores Configurables**: 
  - Editor visual de rangos y multiplicadores
  - Configuración de nombres, iconos y descripciones
  - Plantillas predefinidas (Ventas, Servicios Financieros)
  - Previsualización en tiempo real
- **Reportes y Estadísticas**: Ver historial completo
- **Respaldo de Datos**: Exportar/importar configuraciones

### **Nuevas Características v2.1**
- ✨ **Multiplicadores Totalmente Configurables**: Sistema flexible para personalizar todos los multiplicadores
- ✨ **Editor Visual de Rangos**: Interfaz intuitiva para configurar rangos de multiplicadores
- ✨ **Plantillas de Multiplicadores**: Configuraciones predefinidas para diferentes tipos de negocio
- ✨ **Validación Automática**: Prevención de solapamientos y errores en configuración
- ✨ **Previsualización en Tiempo Real**: Ver impacto de cambios antes de aplicar

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
- `valor` (JSONB) - Valor de la configuración (incluye multiplicadores)
- `descripcion` (TEXT) - Descripción de la configuración
- `updated_at` (TIMESTAMP) - Última actualización

#### `historial_calculos`
- `id` (UUID) - Identificador único
- `asesor` (TEXT) - Nombre del asesor
- `fecha` (TIMESTAMP) - Fecha del cálculo
- `datos_calculo` (JSONB) - Datos completos del cálculo
- `resultado` (JSONB) - Resultado del cálculo

## 📊 Sistema de Multiplicadores Configurables

### **Estructura Flexible**
```javascript
multiplicadores: {
    conversion: {
        nombre: "Tasa de Conversión",
        icono: "🎯",
        unidad: "%",
        descripcion: "Porcentaje de conversión de leads",
        rangos: [
            {min: 15, mult: 1.1, text: "15%+", color: "green"},
            {min: 11, mult: 1.0, text: "11-14%", color: "blue"},
            // ... más rangos configurables
        ]
    }
    // ... otros multiplicadores
}
```

### **Beneficios del Sistema**
1. **Flexibilidad Total**: Cada multiplicador es completamente personalizable
2. **Facilidad de Uso**: Interfaz visual e intuitiva
3. **Escalabilidad**: Agregar nuevos tipos de multiplicadores fácilmente
4. **Transparencia**: Los asesores ven exactamente cómo se calculan sus bonos
5. **Optimización**: Ajustar multiplicadores según performance real

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

// Obtener configuración del sistema (incluye multiplicadores)
const config = await obtenerConfiguracion('multiplicadores');

// Actualizar configuración de multiplicadores
await actualizarConfiguracion('multiplicadores', nuevosMultiplicadores);

// Guardar cálculo en historial
await guardarCalculoEnHistorial('Alejandra', datosCalculo);

// Agregar nuevo asesor
await agregarAsesor('Nuevo', 'password', 'email@ejemplo.com');

// Eliminar asesor
await eliminarAsesor('Nombre');
```

## 🔄 Changelog

### **v2.1.0** (Actual - Enero 2025)
- ✅ **Sistema de Multiplicadores Configurables**: Editor visual completo
- ✅ **Plantillas de Multiplicadores**: Configuraciones predefinidas
- ✅ **Validación Avanzada**: Prevención de errores en configuración
- ✅ **Previsualización en Tiempo Real**: Ver cambios antes de aplicar
- ✅ **Interfaz Mejorada**: Mejor experiencia de usuario en el admin
- ✅ **Documentación Unificada**: Toda la información en un solo lugar

### **v2.0.0** (Enero 2025)
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
- **[estructura-multiplicadores.md](./estructura-multiplicadores.md)**: Especificación completa del sistema de multiplicadores

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

4. **Problemas con Multiplicadores**
   - Verificar que no haya solapamientos en rangos
   - Comprobar que los multiplicadores sean números válidos
   - Revisar la previsualización antes de guardar

### **Logs y Depuración:**
- Abrir herramientas de desarrollador (F12)
- Revisar consola para errores
- Verificar tab "Network" para errores de API

## 📝 Licencia

Este proyecto es de uso interno para SERSA.

---

**Desarrollado con ❤️ para el equipo de SERSA**  
**Sistema de Comisiones v2.1 - Enero 2025** 