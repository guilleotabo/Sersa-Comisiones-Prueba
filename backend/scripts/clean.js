const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Configuración de la base de datos
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sersa_comisiones',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

console.log('🧹 INICIANDO LIMPIEZA DE CONFIGURACIONES');
console.log('=' .repeat(50));
console.log('');

// Función para limpiar configuraciones de prueba
async function cleanTestConfigurations() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Verificando configuraciones existentes...');
        
        // Obtener todas las configuraciones
        const result = await client.query('SELECT nombre_asesor, categoria FROM configuraciones ORDER BY nombre_asesor');
        
        if (result.rows.length === 0) {
            console.log('✅ No hay configuraciones para limpiar');
            return;
        }
        
        console.log(`📊 Configuraciones encontradas: ${result.rows.length}`);
        result.rows.forEach(row => {
            console.log(`  - ${row.nombre_asesor} (${row.categoria})`);
        });
        
        // Confirmar limpieza
        console.log('\n⚠️  ¿Estás seguro de que quieres eliminar TODAS las configuraciones?');
        console.log('💡 Esto eliminará permanentemente todos los datos de la tabla configuraciones.');
        console.log('💡 Para cancelar, presiona Ctrl+C ahora.');
        
        // Esperar 5 segundos para confirmación
        console.log('\n⏳ Esperando 5 segundos para confirmación...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Eliminar todas las configuraciones
        console.log('\n🗑️  Eliminando configuraciones...');
        const deleteResult = await client.query('DELETE FROM configuraciones');
        
        console.log(`✅ ${deleteResult.rowCount} configuraciones eliminadas`);
        
        // Verificar que la tabla esté vacía
        const verifyResult = await client.query('SELECT COUNT(*) FROM configuraciones');
        const remainingCount = parseInt(verifyResult.rows[0].count);
        
        if (remainingCount === 0) {
            console.log('✅ Limpieza completada exitosamente');
        } else {
            console.log(`⚠️  Aún quedan ${remainingCount} configuraciones`);
        }
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Función para limpiar configuraciones específicas
async function cleanSpecificConfigurations(asesores) {
    const client = await pool.connect();
    
    try {
        console.log(`🔍 Limpiando configuraciones específicas: ${asesores.join(', ')}`);
        
        for (const asesor of asesores) {
            const result = await client.query(
                'DELETE FROM configuraciones WHERE nombre_asesor = $1',
                [asesor]
            );
            
            if (result.rowCount > 0) {
                console.log(`✅ ${asesor}: Configuración eliminada`);
            } else {
                console.log(`⚠️  ${asesor}: No se encontró configuración`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error durante la limpieza específica:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

// Función para mostrar estadísticas
async function showStatistics() {
    const client = await pool.connect();
    
    try {
        console.log('📊 ESTADÍSTICAS DE LA BASE DE DATOS');
        console.log('=' .repeat(40));
        
        // Total de configuraciones
        const totalResult = await client.query('SELECT COUNT(*) FROM configuraciones');
        console.log(`📈 Total de configuraciones: ${totalResult.rows[0].count}`);
        
        // Configuraciones por categoría
        const categoryResult = await client.query(`
            SELECT categoria, COUNT(*) as cantidad 
            FROM configuraciones 
            GROUP BY categoria 
            ORDER BY categoria
        `);
        
        if (categoryResult.rows.length > 0) {
            console.log('\n📋 Configuraciones por categoría:');
            categoryResult.rows.forEach(row => {
                console.log(`  - ${row.categoria}: ${row.cantidad}`);
            });
        }
        
        // Últimas configuraciones modificadas
        const recentResult = await client.query(`
            SELECT nombre_asesor, categoria, updated_at 
            FROM configuraciones 
            ORDER BY updated_at DESC 
            LIMIT 5
        `);
        
        if (recentResult.rows.length > 0) {
            console.log('\n🕒 Últimas configuraciones modificadas:');
            recentResult.rows.forEach(row => {
                const date = new Date(row.updated_at).toLocaleString();
                console.log(`  - ${row.nombre_asesor} (${row.categoria}): ${date}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error.message);
    } finally {
        client.release();
    }
}

// Función principal
async function main() {
    try {
        // Verificar conexión
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Conexión a PostgreSQL establecida');
        
        // Obtener argumentos de línea de comandos
        const args = process.argv.slice(2);
        const command = args[0];
        
        switch (command) {
            case 'all':
                await cleanTestConfigurations();
                break;
                
            case 'specific':
                const asesores = args.slice(1);
                if (asesores.length === 0) {
                    console.log('❌ Debes especificar al menos un asesor');
                    console.log('💡 Ejemplo: node clean.js specific Alejandra Rodrigo');
                    process.exit(1);
                }
                await cleanSpecificConfigurations(asesores);
                break;
                
            case 'stats':
                await showStatistics();
                break;
                
            default:
                console.log('🔧 USO DEL SCRIPT DE LIMPIEZA');
                console.log('=' .repeat(40));
                console.log('');
                console.log('Comandos disponibles:');
                console.log('  node clean.js all                    - Eliminar TODAS las configuraciones');
                console.log('  node clean.js specific asesor1 asesor2 - Eliminar configuraciones específicas');
                console.log('  node clean.js stats                  - Mostrar estadísticas');
                console.log('');
                console.log('Ejemplos:');
                console.log('  node clean.js all');
                console.log('  node clean.js specific Alejandra Rodrigo');
                console.log('  node clean.js stats');
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Manejo de señales para cerrar correctamente
process.on('SIGINT', async () => {
    console.log('\n🛑 Operación cancelada por el usuario');
    await pool.end();
    process.exit(0);
});

// Ejecutar función principal
main(); 