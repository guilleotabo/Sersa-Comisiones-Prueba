const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sersa_comisiones',
    user: process.env.DB_USER || 'tu_usuario',
    password: process.env.DB_PASSWORD || 'tu_password',
    max: 20, // máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva
    connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Función para probar la conexión
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    }
}

// Función para crear la tabla si no existe
async function createTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS configuraciones (
            id SERIAL PRIMARY KEY,
            nombre_asesor VARCHAR(100) UNIQUE NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            config_data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Índices para optimizar consultas
        CREATE INDEX IF NOT EXISTS idx_configuraciones_nombre ON configuraciones(nombre_asesor);
        CREATE INDEX IF NOT EXISTS idx_configuraciones_categoria ON configuraciones(categoria);
        CREATE INDEX IF NOT EXISTS idx_configuraciones_config_data ON configuraciones USING GIN(config_data);
    `;

    try {
        await pool.query(createTableQuery);
        console.log('✅ Tabla configuraciones creada/verificada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error creando tabla:', error.message);
        return false;
    }
}

// Función para obtener configuración de un asesor
async function getConfiguracion(nombreAsesor) {
    try {
        const query = 'SELECT * FROM configuraciones WHERE nombre_asesor = $1';
        const result = await pool.query(query, [nombreAsesor]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error obteniendo configuración:', error.message);
        throw error;
    }
}

// Función para actualizar configuración de un asesor
async function updateConfiguracion(nombreAsesor, categoria, configData) {
    try {
        const query = `
            INSERT INTO configuraciones (nombre_asesor, categoria, config_data, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (nombre_asesor) 
            DO UPDATE SET 
                categoria = EXCLUDED.categoria,
                config_data = EXCLUDED.config_data,
                updated_at = NOW()
            RETURNING *
        `;
        const result = await pool.query(query, [nombreAsesor, categoria, configData]);
        return result.rows[0];
    } catch (error) {
        console.error('Error actualizando configuración:', error.message);
        throw error;
    }
}

// Función para listar todos los asesores
async function getAllAsesores() {
    try {
        const query = 'SELECT nombre_asesor, categoria, created_at, updated_at FROM configuraciones ORDER BY nombre_asesor';
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error obteniendo asesores:', error.message);
        throw error;
    }
}

// Función para eliminar configuración de un asesor
async function deleteConfiguracion(nombreAsesor) {
    try {
        const query = 'DELETE FROM configuraciones WHERE nombre_asesor = $1 RETURNING *';
        const result = await pool.query(query, [nombreAsesor]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error eliminando configuración:', error.message);
        throw error;
    }
}

module.exports = {
    pool,
    testConnection,
    createTable,
    getConfiguracion,
    updateConfiguracion,
    getAllAsesores,
    deleteConfiguracion
}; 