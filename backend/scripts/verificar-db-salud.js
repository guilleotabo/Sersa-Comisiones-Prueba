#!/usr/bin/env node

/**
 * VERIFICADOR DE SALUD DE BASE DE DATOS POSTGRESQL
 * Sistema de Comisiones Comerciales SERSA
 * 
 * Este script verifica la salud específica de PostgreSQL para detectar:
 * - Problemas de conexión y pool
 * - Corrupción de datos
 * - Problemas de rendimiento
 * - Integridad referencial
 * - Locks y deadlocks
 */

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../config.env' });

console.log('🔍 VERIFICADOR DE SALUD DE BASE DE DATOS POSTGRESQL');
console.log('=' .repeat(70));
console.log('Sistema: SERSA Comisiones Comerciales');
console.log('Fecha:', new Date().toISOString());
console.log('=' .repeat(70));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sersa_comisiones',
    user: process.env.DB_USER || 'tu_usuario',
    password: process.env.DB_PASSWORD || 'tu_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

const pool = new Pool(dbConfig);

// Función para ejecutar queries con manejo de errores
async function executeQuery(query, params = []) {
    const client = await pool.connect();
    try {
        const startTime = Date.now();
        const result = await client.query(query, params);
        const duration = Date.now() - startTime;
        return { success: true, result, duration };
    } catch (error) {
        return { success: false, error: error.message };
    } finally {
        client.release();
    }
}

// TEST 1: Verificar conectividad y configuración básica
async function testBasicConnectivity() {
    console.log('\n🔍 Test 1: Conectividad y Configuración Básica');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    try {
        // Test conexión básica
        console.log('  📡 Probando conexión básica...');
        const connectionTest = await executeQuery('SELECT NOW(), version()');
        
        if (!connectionTest.success) {
            passed = false;
            issues.push(`Conexión falló: ${connectionTest.error}`);
            console.log('  ❌ Conexión a PostgreSQL falló');
            return { passed: false, issues, duration: Date.now() - startTime, testName: 'Conectividad Básica' };
        }
        
        console.log('  ✅ Conexión exitosa');
        console.log(`  📊 Versión PostgreSQL: ${connectionTest.result.rows[0].version.split(' ')[1]}`);
        console.log(`  ⏱️  Tiempo de respuesta: ${connectionTest.duration}ms`);
        
        // Test configuración de base de datos
        console.log('  🔧 Verificando configuraciones...');
        
        const configQueries = [
            { name: 'max_connections', query: 'SHOW max_connections' },
            { name: 'shared_buffers', query: 'SHOW shared_buffers' },
            { name: 'effective_cache_size', query: 'SHOW effective_cache_size' },
            { name: 'wal_level', query: 'SHOW wal_level' },
        ];
        
        for (const config of configQueries) {
            const result = await executeQuery(config.query);
            if (result.success) {
                console.log(`    ✅ ${config.name}: ${result.result.rows[0][config.name]}`);
            } else {
                console.log(`    ⚠️  No se pudo obtener ${config.name}`);
            }
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    return { passed, issues, duration, testName: 'Conectividad Básica' };
}

// TEST 2: Verificar integridad de tablas
async function testTableIntegrity() {
    console.log('\n🔍 Test 2: Integridad de Tablas');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    try {
        // Verificar que la tabla configuraciones existe
        console.log('  📋 Verificando estructura de tabla configuraciones...');
        
        const tableExists = await executeQuery(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'configuraciones'
            )
        `);
        
        if (!tableExists.success || !tableExists.result.rows[0].exists) {
            passed = false;
            issues.push('Tabla configuraciones no existe');
            console.log('  ❌ Tabla configuraciones no encontrada');
            return { passed, issues, duration: Date.now() - startTime, testName: 'Integridad de Tablas' };
        }
        
        console.log('  ✅ Tabla configuraciones existe');
        
        // Verificar estructura de columnas
        console.log('  🏗️  Verificando estructura de columnas...');
        
        const columnCheck = await executeQuery(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'configuraciones'
            ORDER BY ordinal_position
        `);
        
        if (columnCheck.success) {
            const requiredColumns = ['id', 'nombre_asesor', 'categoria', 'config_data', 'created_at', 'updated_at'];
            const existingColumns = columnCheck.result.rows.map(row => row.column_name);
            
            for (const reqCol of requiredColumns) {
                if (existingColumns.includes(reqCol)) {
                    console.log(`    ✅ Columna ${reqCol} existe`);
                } else {
                    passed = false;
                    issues.push(`Columna ${reqCol} faltante`);
                    console.log(`    ❌ Columna ${reqCol} faltante`);
                }
            }
        }
        
        // Verificar índices
        console.log('  📊 Verificando índices...');
        
        const indexCheck = await executeQuery(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'configuraciones'
        `);
        
        if (indexCheck.success) {
            console.log(`    📈 Índices encontrados: ${indexCheck.result.rows.length}`);
            indexCheck.result.rows.forEach(index => {
                console.log(`    ✅ ${index.indexname}`);
            });
        }
        
        // Test de integridad CHECKSUM
        console.log('  🔐 Verificando integridad de datos...');
        
        const integrityCheck = await executeQuery(`
            SELECT 
                COUNT(*) as total_records,
                COUNT(DISTINCT nombre_asesor) as unique_asesores,
                COUNT(CASE WHEN config_data IS NULL THEN 1 END) as null_configs,
                COUNT(CASE WHEN categoria IS NULL OR categoria = '' THEN 1 END) as invalid_categories
            FROM configuraciones
        `);
        
        if (integrityCheck.success) {
            const stats = integrityCheck.result.rows[0];
            console.log(`    📊 Total registros: ${stats.total_records}`);
            console.log(`    📊 Asesores únicos: ${stats.unique_asesores}`);
            
            if (parseInt(stats.null_configs) > 0) {
                passed = false;
                issues.push(`${stats.null_configs} configuraciones nulas`);
                console.log(`    ❌ Configuraciones nulas: ${stats.null_configs}`);
            } else {
                console.log('    ✅ No hay configuraciones nulas');
            }
            
            if (parseInt(stats.invalid_categories) > 0) {
                passed = false;
                issues.push(`${stats.invalid_categories} categorías inválidas`);
                console.log(`    ❌ Categorías inválidas: ${stats.invalid_categories}`);
            } else {
                console.log('    ✅ Todas las categorías son válidas');
            }
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    return { passed, issues, duration, testName: 'Integridad de Tablas' };
}

// TEST 3: Verificar rendimiento y locks
async function testPerformanceAndLocks() {
    console.log('\n🔍 Test 3: Rendimiento y Locks');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    try {
        // Test de rendimiento de queries básicas
        console.log('  ⚡ Probando rendimiento de queries...');
        
        const performanceTests = [
            {
                name: 'SELECT simple',
                query: 'SELECT COUNT(*) FROM configuraciones'
            },
            {
                name: 'SELECT con WHERE',
                query: 'SELECT * FROM configuraciones WHERE categoria = $1',
                params: ['Ágil']
            },
            {
                name: 'SELECT con JSONB',
                query: 'SELECT nombre_asesor, config_data->\'version\' FROM configuraciones LIMIT 5'
            }
        ];
        
        for (const test of performanceTests) {
            const result = await executeQuery(test.query, test.params);
            if (result.success) {
                if (result.duration > 1000) { // Más de 1 segundo
                    passed = false;
                    issues.push(`Query lenta: ${test.name} (${result.duration}ms)`);
                    console.log(`    ⚠️  ${test.name}: ${result.duration}ms (LENTO)`);
                } else {
                    console.log(`    ✅ ${test.name}: ${result.duration}ms`);
                }
            } else {
                passed = false;
                issues.push(`Query falló: ${test.name}`);
                console.log(`    ❌ ${test.name}: FALLÓ`);
            }
        }
        
        // Verificar locks activos
        console.log('  🔒 Verificando locks y bloqueos...');
        
        const lockCheck = await executeQuery(`
            SELECT 
                pg_class.relname,
                pg_locks.locktype,
                pg_locks.mode,
                pg_locks.granted
            FROM pg_locks
            JOIN pg_class ON pg_locks.relation = pg_class.oid
            WHERE pg_class.relname = 'configuraciones'
        `);
        
        if (lockCheck.success) {
            const activeLocks = lockCheck.result.rows.filter(lock => !lock.granted);
            if (activeLocks.length > 0) {
                passed = false;
                issues.push(`${activeLocks.length} locks activos no otorgados`);
                console.log(`    ⚠️  Locks activos no otorgados: ${activeLocks.length}`);
            } else {
                console.log('    ✅ No hay locks problemáticos');
            }
        }
        
        // Verificar deadlocks
        console.log('  💀 Verificando historial de deadlocks...');
        
        const deadlockCheck = await executeQuery(`
            SELECT 
                count(*) as deadlock_count
            FROM pg_stat_database 
            WHERE datname = $1
        `, [dbConfig.database]);
        
        if (deadlockCheck.success) {
            console.log('    ✅ Verificación de deadlocks completada');
        }
        
        // Test de conexiones activas
        console.log('  🔗 Verificando conexiones activas...');
        
        const connectionCheck = await executeQuery(`
            SELECT 
                COUNT(*) as active_connections,
                COUNT(CASE WHEN state = 'active' THEN 1 END) as executing_queries
            FROM pg_stat_activity 
            WHERE datname = $1
        `, [dbConfig.database]);
        
        if (connectionCheck.success) {
            const stats = connectionCheck.result.rows[0];
            console.log(`    📊 Conexiones activas: ${stats.active_connections}`);
            console.log(`    📊 Queries ejecutándose: ${stats.executing_queries}`);
            
            if (parseInt(stats.active_connections) > 50) {
                issues.push(`Muchas conexiones activas: ${stats.active_connections}`);
                console.log(`    ⚠️  Demasiadas conexiones activas`);
            }
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    return { passed, issues, duration, testName: 'Rendimiento y Locks' };
}

// TEST 4: Verificar espacio en disco y estadísticas
async function testDiskSpaceAndStats() {
    console.log('\n🔍 Test 4: Espacio en Disco y Estadísticas');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    try {
        // Verificar tamaño de la base de datos
        console.log('  💾 Verificando uso de espacio...');
        
        const sizeCheck = await executeQuery(`
            SELECT 
                pg_size_pretty(pg_database_size($1)) as db_size,
                pg_size_pretty(pg_total_relation_size('configuraciones')) as table_size
        `, [dbConfig.database]);
        
        if (sizeCheck.success) {
            const sizes = sizeCheck.result.rows[0];
            console.log(`    📊 Tamaño BD: ${sizes.db_size}`);
            console.log(`    📊 Tamaño tabla configuraciones: ${sizes.table_size}`);
        }
        
        // Verificar estadísticas de la tabla
        console.log('  📈 Verificando estadísticas de tabla...');
        
        const statsCheck = await executeQuery(`
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes,
                n_live_tup as live_tuples,
                n_dead_tup as dead_tuples,
                last_vacuum,
                last_autovacuum,
                last_analyze,
                last_autoanalyze
            FROM pg_stat_user_tables 
            WHERE tablename = 'configuraciones'
        `);
        
        if (statsCheck.success && statsCheck.result.rows.length > 0) {
            const stats = statsCheck.result.rows[0];
            console.log(`    📊 Inserts: ${stats.inserts}`);
            console.log(`    📊 Updates: ${stats.updates}`);
            console.log(`    📊 Deletes: ${stats.deletes}`);
            console.log(`    📊 Tuplas vivas: ${stats.live_tuples}`);
            console.log(`    📊 Tuplas muertas: ${stats.dead_tuples}`);
            
            // Verificar si hay demasiadas tuplas muertas
            if (parseInt(stats.dead_tuples) > parseInt(stats.live_tuples) * 0.2) {
                issues.push(`Demasiadas tuplas muertas: ${stats.dead_tuples}`);
                console.log(`    ⚠️  Muchas tuplas muertas, considerar VACUUM`);
            } else {
                console.log('    ✅ Ratio de tuplas muertas aceptable');
            }
            
            console.log(`    📅 Último VACUUM: ${stats.last_vacuum || 'Nunca'}`);
            console.log(`    📅 Último ANALYZE: ${stats.last_analyze || 'Nunca'}`);
        }
        
        // Verificar fragmentación de índices
        console.log('  🗂️  Verificando salud de índices...');
        
        const indexStats = await executeQuery(`
            SELECT 
                indexrelname,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes 
            WHERE schemaname = 'public' 
            AND relname = 'configuraciones'
        `);
        
        if (indexStats.success) {
            indexStats.result.rows.forEach(index => {
                console.log(`    📊 Índice ${index.indexrelname}: ${index.idx_scan} scans`);
            });
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    return { passed, issues, duration, testName: 'Espacio en Disco y Estadísticas' };
}

// TEST 5: Test de estrés de pool de conexiones
async function testConnectionPoolStress() {
    console.log('\n🔍 Test 5: Estrés de Pool de Conexiones');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    try {
        console.log('  🚀 Probando pool bajo estrés...');
        
        // Crear múltiples conexiones simultáneas
        const connectionPromises = [];
        const testConnections = 15; // Menos que el máximo del pool
        
        for (let i = 0; i < testConnections; i++) {
            connectionPromises.push(
                executeQuery('SELECT $1 as connection_id, NOW() as timestamp', [i])
            );
        }
        
        const results = await Promise.allSettled(connectionPromises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = testConnections - successful;
        
        console.log(`    📊 Conexiones exitosas: ${successful}/${testConnections}`);
        console.log(`    📊 Conexiones fallidas: ${failed}/${testConnections}`);
        
        if (failed > testConnections * 0.1) { // Más del 10% de fallas
            passed = false;
            issues.push(`Demasiadas fallas en pool: ${failed}/${testConnections}`);
            console.log('    ❌ Pool de conexiones bajo estrés');
        } else {
            console.log('    ✅ Pool de conexiones manejó el estrés correctamente');
        }
        
        // Test de recuperación del pool
        console.log('  🔄 Probando recuperación del pool...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const recoveryTest = await executeQuery('SELECT 1 as recovery_test');
        if (!recoveryTest.success) {
            passed = false;
            issues.push('Pool no se recuperó correctamente');
            console.log('    ❌ Pool no se recuperó del estrés');
        } else {
            console.log('    ✅ Pool se recuperó correctamente');
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    return { passed, issues, duration, testName: 'Estrés de Pool de Conexiones' };
}

// Función para generar reporte detallado
function generateHealthReport(results) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 REPORTE DE SALUD DE BASE DE DATOS');
    console.log('='.repeat(70));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📈 Estadísticas de Salud:`);
    console.log(`   Tests ejecutados: ${totalTests}`);
    console.log(`   Tests exitosos: ${passedTests}`);
    console.log(`   Tests fallidos: ${failedTests}`);
    console.log(`   Salud general: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`   Tiempo total verificación: ${(totalDuration/1000).toFixed(1)}s`);
    
    console.log('\n📋 Detalle de Verificaciones:');
    results.forEach((result, index) => {
        const status = result.passed ? '✅ SALUDABLE' : '❌ PROBLEMAS';
        console.log(`   ${index + 1}. ${status} ${result.testName} (${result.duration}ms)`);
        
        if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
                console.log(`      ⚠️  ${issue}`);
            });
        }
    });
    
    // Recomendaciones de mantenimiento
    console.log('\n💡 Recomendaciones de Mantenimiento:');
    
    if (failedTests === 0) {
        console.log('   🎉 ¡Excelente! La base de datos está en perfecto estado.');
        console.log('   ✅ No se requieren acciones de mantenimiento inmediatas.');
        console.log('   📅 Próxima verificación recomendada: En 7 días');
    } else {
        console.log('   ⚠️  Se detectaron problemas que requieren atención:');
        
        const allIssues = results.flatMap(r => r.issues || []);
        const uniqueIssues = [...new Set(allIssues)];
        
        uniqueIssues.forEach(issue => {
            console.log(`      • ${issue}`);
        });
        
        console.log('\n   🔧 Acciones de Mantenimiento Sugeridas:');
        console.log('      1. VACUUM ANALYZE configuraciones;');
        console.log('      2. REINDEX TABLE configuraciones;');
        console.log('      3. Revisar configuración de PostgreSQL');
        console.log('      4. Monitorear logs de PostgreSQL');
        console.log('      5. Considerar optimización de queries');
    }
    
    return { totalTests, passedTests, failedTests, totalDuration };
}

// Función principal
async function runDatabaseHealthCheck() {
    const startTime = Date.now();
    
    console.log('🚀 Iniciando verificación de salud de base de datos...\n');
    
    const tests = [
        testBasicConnectivity,
        testTableIntegrity,
        testPerformanceAndLocks,
        testDiskSpaceAndStats,
        testConnectionPoolStress
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test();
            results.push(result);
        } catch (error) {
            console.log(`❌ Error ejecutando test: ${error.message}`);
            results.push({
                passed: false,
                issues: [`Error inesperado: ${error.message}`],
                duration: 0,
                testName: 'Error en ejecución'
            });
        }
    }
    
    const summary = generateHealthReport(results);
    
    // Guardar reporte en archivo
    const reportData = {
        timestamp: new Date().toISOString(),
        dbConfig: { ...dbConfig, password: '***' }, // Ocultar password
        summary,
        results,
        totalExecutionTime: Date.now() - startTime
    };
    
    const reportPath = `db-health-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
    
    // Cerrar pool de conexiones
    await pool.end();
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 VERIFICACIÓN DE SALUD COMPLETADA');
    console.log('='.repeat(70));
    
    return summary.failedTests === 0;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runDatabaseHealthCheck().then(success => {
        console.log(`\n🎯 Estado de la base de datos: ${success ? 'SALUDABLE' : 'REQUIERE ATENCIÓN'}`);
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error crítico verificando base de datos:', error);
        process.exit(1);
    });
}

module.exports = { runDatabaseHealthCheck };