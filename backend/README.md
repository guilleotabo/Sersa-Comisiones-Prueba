# 🚀 Backend - Sistema de Comisiones Comerciales SERSA

Backend API para el Sistema de Comisiones Comerciales con PostgreSQL.

## 📋 Requisitos

- Node.js (versión 14 o superior)
- PostgreSQL (versión 12 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copiar `config.env` y configurar con tus credenciales de PostgreSQL
   ```bash
   # Editar config.env con tus datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sersa_comisiones
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   ```

3. **Crear base de datos PostgreSQL:**
   ```sql
   CREATE DATABASE sersa_comisiones;
   ```

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📊 Endpoints de la API

### Configuraciones
- `GET /api/config/:asesor` - Obtener configuración de un asesor
- `PUT /api/config/:asesor` - Actualizar configuración de un asesor
- `DELETE /api/config/:asesor` - Eliminar configuración de un asesor

### Asesores
- `GET /api/asesores` - Listar todos los asesores
- `GET /api/asesores/categorias` - Estadísticas por categoría
- `GET /api/asesores/health` - Estado del sistema

### Sistema
- `GET /` - Información de la API
- `GET /health` - Health check del servidor

## 🔄 Scripts de Migración

### Migración de datos existentes
```bash
# Migrar configuraciones desde archivos config.js
node scripts/migrate.js migrate

# Verificar configuraciones existentes
node scripts/migrate.js verify

# Limpiar todas las configuraciones (¡CUIDADO!)
node scripts/migrate.js clean
```

### Datos de prueba
```bash
# Insertar datos de prueba básicos
node scripts/seed.js seed

# Crear configuración personalizada para Erika
node scripts/seed.js erika
```

### Verificación de datos
```bash
# Verificar todas las configuraciones
node scripts/verify.js all

# Verificar configuración específica
node scripts/verify.js asesor Alejandra

# Comparar dos configuraciones
node scripts/verify.js compare Alejandra Erika
```

## 📝 Ejemplos de Uso

### Obtener configuración de un asesor
```bash
curl http://localhost:3000/api/config/Alejandra
```

### Actualizar configuración
```bash
curl -X PUT http://localhost:3000/api/config/Alejandra \
  -H "Content-Type: application/json" \
  -d '{
    "categoria": "Agil",
    "config_data": {
      "base": 3000000,
      "niveles": ["Capilla", "Junior", "Senior A", "Senior B", "Máster", "Genio"],
      ...
    }
  }'
```

### Listar todos los asesores
```bash
curl http://localhost:3000/api/asesores
```

## 🗄️ Estructura de la Base de Datos

### Tabla: configuraciones
```sql
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    nombre_asesor VARCHAR(100) UNIQUE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Categorías de Asesores
- **Agil**: Alejandra, Aletzia, Micaela
- **Empresarial**: Maximiliano, Rodrigo
- **Agil_Recupero**: Erika
- **Template**: Base

## 🔧 Configuración

### Variables de Entorno
- `DB_HOST`: Host de PostgreSQL (default: localhost)
- `DB_PORT`: Puerto de PostgreSQL (default: 5432)
- `DB_NAME`: Nombre de la base de datos (default: sersa_comisiones)
- `DB_USER`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno (development/production)
- `CORS_ORIGIN`: Origen permitido para CORS (default: http://localhost:5500)

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `config.env`
3. Verificar que la base de datos exista

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para dudas o problemas, contactar a: TI@sesa.com.py 