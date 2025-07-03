# 💰 Sistema de Comisiones Comerciales SERSA

Sistema completo de cálculo de comisiones comerciales con backend Node.js + PostgreSQL y frontend moderno.

## 🚀 Características

- **Backend robusto** con Node.js + Express + PostgreSQL
- **Frontend moderno** con diseño responsive y UX optimizada
- **Sistema de login** con selección de asesores
- **Configuraciones personalizadas** por asesor
- **Persistencia de datos** en base de datos PostgreSQL
- **Sistema de fallback** para funcionamiento offline
- **Testing automatizado** completo
- **Scripts de despliegue** automatizados

## 📋 Requisitos Previos

- **Node.js** 16+ instalado
- **PostgreSQL** 12+ instalado y configurado
- **Base de datos** 'sersa_comisiones' creada

## 🛠️ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Sersa-Comisiones-Prueba
```

### 2. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
createdb sersa_comisiones
```

### 3. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp backend/config.env.example backend/config.env

# Editar configuración
# Asegúrate de configurar las credenciales de PostgreSQL
```

### 4. Instalar dependencias
```bash
cd backend
npm install
```

### 5. Migrar datos
```bash
node scripts/migrate.js
```

### 6. Ejecutar tests
```bash
node scripts/test-integration.js
```

### 7. Iniciar servidor
```bash
npm start
```

## 🎯 Uso del Sistema

### Acceso al Sistema
1. Abrir `index.html` en el navegador
2. Seleccionar el asesor correspondiente
3. Ingresar contraseña (cualquier contraseña por ahora)
4. El sistema verificará la configuración en la base de datos

### Funcionalidades Principales
- **Cálculo de comisiones** automático
- **Configuraciones personalizadas** por asesor
- **Sistema de multiplicadores** dinámico
- **Reportes y exportación** a PDF
- **Panel de administración** para configuraciones

## 🏗️ Arquitectura del Sistema

### Backend (Node.js + Express)
```
backend/
├── server.js              # Servidor principal
├── database.js            # Conexión a PostgreSQL
├── routes/
│   ├── config.js          # Rutas de configuraciones
│   └── asesores.js        # Rutas de asesores
├── scripts/
│   ├── migrate.js         # Migración de datos
│   ├── seed.js            # Datos de prueba
│   ├── verify.js          # Verificación de datos
│   ├── test-integration.js # Tests de integración
│   └── deploy.js          # Script de despliegue
└── config.env             # Variables de entorno
```

### Frontend (HTML + CSS + JavaScript)
```
├── index.html             # Página principal con login
├── Base/                  # Sistema base (template)
├── Alejandra/             # Configuración específica
├── Aletzia/               # Configuración específica
├── Erika/                 # Configuración específica
├── Maximiliano/           # Configuración específica
├── Micaela/               # Configuración específica
└── Rodrigo/               # Configuración específica
```

## 📊 Base de Datos

### Tabla: configuraciones
```sql
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    nombre_asesor VARCHAR(100) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categorías de Asesores
- **Ágil**: Alejandra, Aletzia, Micaela
- **Empresarial**: Maximiliano, Rodrigo
- **Ágil/Recupero**: Erika
- **Template**: Base

## 🔧 Scripts Disponibles

### Migración y Datos
```bash
# Migrar configuraciones desde archivos config.js
node backend/scripts/migrate.js

# Insertar datos de prueba
node backend/scripts/seed.js

# Verificar integridad de datos
node backend/scripts/verify.js

# Limpiar configuraciones
node backend/scripts/clean.js
```

### Testing y Despliegue
```bash
# Ejecutar tests completos
node backend/scripts/test-integration.js

# Desplegar en desarrollo
node backend/scripts/deploy.js development

# Desplegar en producción
node backend/scripts/deploy.js production
```

### Utilidades
```bash
# Copiar app.js a todas las carpetas (PowerShell)
powershell -ExecutionPolicy Bypass -File backend/scripts/copy-app.ps1

# Copiar app.js a todas las carpetas (Node.js)
node backend/scripts/copy-app.js
```

## 🌐 API Endpoints

### Configuraciones
- `GET /api/config/:asesor` - Obtener configuración
- `PUT /api/config/:asesor` - Actualizar configuración
- `DELETE /api/config/:asesor` - Eliminar configuración

### Asesores
- `GET /api/asesores` - Listar todos los asesores
- `GET /api/asesores/:categoria` - Listar por categoría

### Health Check
- `GET /api/health` - Estado del servidor
- `GET /health` - Health check básico

## 🔒 Seguridad

### Variables de Entorno Requeridas
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sersa_comisiones
DB_USER=postgres
DB_PASSWORD=tu_password

# Servidor
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500

# Seguridad
JWT_SECRET=tu_jwt_secret
SESSION_SECRET=tu_session_secret
```

## 🧪 Testing

### Tests Automatizados
El sistema incluye una suite completa de tests que verifica:

1. **Conexión al servidor**
2. **Configuraciones en base de datos**
3. **Estructura de archivos**
4. **Integración frontend-backend**
5. **Scripts de utilidad**
6. **Dependencias**

### Ejecutar Tests
```bash
node backend/scripts/test-integration.js
```

## 🚀 Despliegue

### Despliegue Automatizado
```bash
# Desarrollo
node backend/scripts/deploy.js development

# Staging
node backend/scripts/deploy.js staging

# Producción
node backend/scripts/deploy.js production
```

### Despliegue Manual
1. Configurar variables de entorno
2. Instalar dependencias: `npm install`
3. Ejecutar migraciones: `node scripts/migrate.js`
4. Ejecutar tests: `node scripts/test-integration.js`
5. Iniciar servidor: `npm start`

## 📈 Monitoreo

### Health Check
- **Endpoint**: `/api/health`
- **Información**: Estado del servidor, uptime, versiones
- **Uso**: Monitoreo de disponibilidad

### Logs
- Los logs se muestran en la consola
- Para producción, usar PM2 o similar
- Configurar rotación de logs

## 🔄 Backup y Recuperación

### Backup Automático
El sistema incluye funcionalidades de backup configuradas en `config.env`:

```env
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=7
```

### Backup Manual
```bash
# Exportar configuraciones
node backend/scripts/export-configs.js

# Restaurar configuraciones
node backend/scripts/restore-configs.js
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a PostgreSQL**
   - Verificar credenciales en `config.env`
   - Asegurar que PostgreSQL esté ejecutándose
   - Verificar que la base de datos exista

2. **Error de CORS**
   - Verificar `CORS_ORIGIN` en `config.env`
   - Asegurar que el frontend esté en el origen correcto

3. **Configuraciones no encontradas**
   - Ejecutar: `node backend/scripts/migrate.js`
   - Verificar que los archivos `config.js` existan

4. **Tests fallando**
   - Verificar que el servidor esté ejecutándose
   - Ejecutar migraciones antes de tests
   - Revisar logs del servidor

### Comandos de Diagnóstico
```bash
# Verificar estado del servidor
curl http://localhost:3000/api/health

# Verificar configuraciones
node backend/scripts/verify.js

# Verificar estructura de archivos
node backend/scripts/test-integration.js
```

## 📞 Soporte

### Contacto
- **Email**: TI@sesa.com.py
- **Documentación**: Ver `DEPLOYMENT.md` para detalles técnicos

### Recursos Adicionales
- `DEPLOYMENT.md` - Documentación de despliegue
- `backend/README.md` - Documentación del backend
- `ASESORES_INFO.md` - Información de asesores

## 📄 Licencia

Este proyecto es propiedad de SERSA SAECA.

---

**Desarrollado con ❤️ para SERSA SAECA**

*Última actualización: 2024-07-03*