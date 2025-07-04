const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const { testConnection, createTable } = require('./database');
const configRoutes = require('./routes/config');
const asesoresRoutes = require('./routes/asesores');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api/config', configRoutes);
app.use('/api/asesores', asesoresRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API del Sistema de Comisiones Comerciales SERSA',
        version: '1.0.0',
        endpoints: {
            configuraciones: '/api/config/:asesor',
            asesores: '/api/asesores',
            auth: '/api/auth',
            health: '/api/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Health check específico para la API
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        service: 'SERSA Comisiones API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'PostgreSQL',
        endpoints: {
            config: '/api/config/:asesor',
            asesores: '/api/asesores',
            auth: '/api/auth',
            health: '/api/health'
        }
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`
    });
});

// Función para inicializar el servidor
async function initializeServer() {
    try {
        // Probar conexión a la base de datos
        console.log('🔌 Probando conexión a PostgreSQL...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos. Verifica las credenciales.');
            process.exit(1);
        }
        
        // Crear tabla si no existe
        console.log('📋 Verificando estructura de la base de datos...');
        await createTable();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('✅ Servidor iniciado correctamente');
            console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
            console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
            console.log(`🏥 Health check en: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
        
    } catch (error) {
        console.error('❌ Error inicializando el servidor:', error);
        process.exit(1);
    }
}

// Manejo de señales para cerrar el servidor correctamente
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Cerrando servidor...');
    process.exit(0);
});

// Inicializar servidor
initializeServer(); 