const fs = require('fs');
const path = require('path');
const { updateConfiguracion, testConnection } = require('../database');

// Mapeo de categorías por asesor
const CATEGORIAS_ASESORES = {
    'Alejandra': 'Agil',
    'Aletzia': 'Agil',
    'Erika': 'Agil_Recupero',
    'Maximiliano': 'Empresarial',
    'Micaela': 'Agil',
    'Rodrigo': 'Empresarial',
    'Base': 'Template'
};

// Función para leer y parsear un archivo config.js
function leerConfigJS(rutaArchivo) {
    try {
        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        
        // Extraer el objeto CONFIG del archivo
        const match = contenido.match(/const CONFIG = ({[\s\S]*?});/);
        if (!match) {
            throw new Error('No se pudo encontrar el objeto CONFIG en el archivo');
        }
        
        // Evaluar el objeto CONFIG (cuidado con la seguridad en producción)
        const configString = match[1];
        const config = eval(`(${configString})`);
        
        return config;
    } catch (error) {
        console.error(`❌ Error leyendo ${rutaArchivo}:`, error.message);
        return null;
    }
}

// Función para migrar un asesor específico
async function migrarAsesor(nombreAsesor, rutaConfig) {
    try {
        console.log(`📁 Procesando ${nombreAsesor}...`);
        
        // Leer configuración del archivo
        const configData = leerConfigJS(rutaConfig);
        if (!configData) {
            console.log(`⚠️  Saltando ${nombreAsesor} - Error al leer config.js`);
            return false;
        }
        
        // Obtener categoría
        const categoria = CATEGORIAS_ASESORES[nombreAsesor] || 'Sin_Categoria';
        
        // Insertar en base de datos
        const resultado = await updateConfiguracion(nombreAsesor, categoria, configData);
        
        console.log(`✅ ${nombreAsesor} migrado exitosamente (${categoria})`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error migrando ${nombreAsesor}:`, error.message);
        return false;
    }
}

// Función principal de migración
async function migrarTodosLosAsesores() {
    try {
        console.log('🚀 Iniciando migración de configuraciones...');
        console.log('='.repeat(50));
        
        // Verificar conexión a la base de datos
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            return;
        }
        
        // Obtener directorio raíz del proyecto (subir dos niveles desde backend/scripts)
        const proyectoRoot = path.resolve(__dirname, '../../');
        
        // Lista de asesores a migrar
        const asesores = Object.keys(CATEGORIAS_ASESORES);
        
        let exitosos = 0;
        let fallidos = 0;
        
        // Migrar cada asesor
        for (const asesor of asesores) {
            const rutaConfig = path.join(proyectoRoot, asesor, 'config.js');
            
            // Verificar si existe el archivo
            if (!fs.existsSync(rutaConfig)) {
                console.log(`⚠️  Saltando ${asesor} - No se encontró config.js`);
                fallidos++;
                continue;
            }
            
            const resultado = await migrarAsesor(asesor, rutaConfig);
            if (resultado) {
                exitosos++;
            } else {
                fallidos++;
            }
        }
        
        console.log('='.repeat(50));
        console.log('📊 Resumen de migración:');
        console.log(`✅ Exitosos: ${exitosos}`);
        console.log(`❌ Fallidos: ${fallidos}`);
        console.log(`📁 Total procesados: ${asesores.length}`);
        
        if (exitosos > 0) {
            console.log('🎉 Migración completada exitosamente');
        } else {
            console.log('⚠️  No se pudo migrar ningún asesor');
        }
        
    } catch (error) {
        console.error('❌ Error en la migración:', error.message);
    }
}

// Función para verificar configuraciones existentes
async function verificarConfiguraciones() {
    try {
        console.log('🔍 Verificando configuraciones existentes...');
        
        const { getAllAsesores } = require('../database');
        const asesores = await getAllAsesores();
        
        console.log(`📊 Configuraciones encontradas en la base de datos: ${asesores.length}`);
        
        asesores.forEach(asesor => {
            console.log(`  - ${asesor.nombre_asesor} (${asesor.categoria}) - Actualizado: ${asesor.updated_at}`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando configuraciones:', error.message);
    }
}

// Función para limpiar configuraciones (cuidado!)
async function limpiarConfiguraciones() {
    try {
        console.log('🗑️  Limpiando todas las configuraciones...');
        
        const { pool } = require('../database');
        await pool.query('DELETE FROM configuraciones');
        
        console.log('✅ Configuraciones eliminadas');
        
    } catch (error) {
        console.error('❌ Error limpiando configuraciones:', error.message);
    }
}

// Manejo de argumentos de línea de comandos
const comando = process.argv[2];

switch (comando) {
    case 'migrate':
        migrarTodosLosAsesores();
        break;
    case 'verify':
        verificarConfiguraciones();
        break;
    case 'clean':
        limpiarConfiguraciones();
        break;
    default:
        console.log('📋 Script de migración de configuraciones');
        console.log('');
        console.log('Uso:');
        console.log('  node migrate.js migrate  - Migrar todas las configuraciones');
        console.log('  node migrate.js verify   - Verificar configuraciones existentes');
        console.log('  node migrate.js clean    - Limpiar todas las configuraciones (¡CUIDADO!)');
        console.log('');
        console.log('Ejemplo:');
        console.log('  node migrate.js migrate');
} 