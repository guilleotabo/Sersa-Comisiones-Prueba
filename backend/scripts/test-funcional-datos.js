#!/usr/bin/env node

/**
 * TEST FUNCIONAL AVANZADO - DETECCIÓN DE ERRORES DE LECTURA/ESCRITURA Y CAÍDA DE DATOS
 * Sistema de Comisiones Comerciales SERSA
 * 
 * Este script realiza tests exhaustivos para detectar:
 * - Errores de lectura/escritura en PostgreSQL
 * - Caída de datos durante operaciones CRUD
 * - Integridad de datos y consistencia
 * - Manejo de errores y recuperación
 * - Tests de stress y concurrencia
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración de testing
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_ASESORES = ['Base', 'Alejandra', 'Aletzia', 'Erika', 'Maximiliano', 'Micaela', 'Rodrigo'];
const STRESS_TEST_ITERATIONS = 50;
const CONCURRENT_REQUESTS = 10;

console.log('🧪 TESTING FUNCIONAL AVANZADO - DETECCIÓN DE ERRORES DE DATOS');
console.log('=' .repeat(80));
console.log('Objetivo: Detectar errores de lectura/escritura y caída de datos');
console.log('Sistema: SERSA Comisiones Comerciales');
console.log('Fecha:', new Date().toISOString());
console.log('=' .repeat(80));

// Función para hacer requests HTTP con retry y timeout
async function makeRequest(url, options = {}, retries = 3) {
    const requestStartTime = Date.now();
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();
            
            return { 
                success: response.ok, 
                status: response.status, 
                data,
                attempt,
                responseTime: Date.now() - requestStartTime
            };
        } catch (error) {
            console.log(`  ⚠️  Intento ${attempt}/${retries} falló: ${error.message}`);
            if (attempt === retries) {
                return { success: false, error: error.message, attempts: retries };
            }
            await sleep(1000 * attempt); // Backoff exponencial
        }
    }
}

// Función para generar datos de prueba únicos
function generateTestData() {
    const timestamp = Date.now();
    return {
        testId: crypto.randomUUID(),
        timestamp,
        config: {
            version: `test-${timestamp}`,
            configuraciones: {
                comisionBase: Math.random() * 100,
                multiplicadores: {
                    test: Math.random() * 10
                }
            },
            lastModified: new Date().toISOString()
        }
    };
}

// Función sleep para delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TEST 1: Verificar Integridad de Conexión a Base de Datos
async function testDatabaseConnectionIntegrity() {
    console.log('\n🔍 Test 1: Integridad de Conexión a Base de Datos');
    console.log('Objetivo: Detectar problemas de conexión, timeouts, y pool exhaustion');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    // Test múltiples conexiones simultáneas
    console.log('  📊 Probando conexiones concurrentes...');
    const connectionTests = [];
    
    for (let i = 0; i < 20; i++) {
        connectionTests.push(makeRequest(`${API_BASE_URL}/health`));
    }
    
    const results = await Promise.allSettled(connectionTests);
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success);
    
    if (failed.length > 0) {
        passed = false;
        issues.push(`${failed.length}/20 conexiones fallaron`);
        console.log(`  ❌ ${failed.length}/20 conexiones concurrentes fallaron`);
    } else {
        console.log('  ✅ Todas las conexiones concurrentes exitosas');
    }
    
    // Test de timeout y recuperación
    console.log('  📊 Probando recuperación después de timeout...');
    await sleep(2000); // Dar tiempo al servidor
    
    const recoveryTest = await makeRequest(`${API_BASE_URL}/health`);
    if (!recoveryTest.success) {
        passed = false;
        issues.push('Falla en recuperación post-stress');
        console.log('  ❌ Servidor no se recuperó correctamente');
    } else {
        console.log('  ✅ Servidor se recuperó correctamente');
    }
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️  Duración: ${duration}ms`);
    
    return { passed, issues, duration, testName: 'Integridad de Conexión DB' };
}

// TEST 2: Verificar Integridad de Operaciones CRUD
async function testCRUDDataIntegrity() {
    console.log('\n🔍 Test 2: Integridad de Operaciones CRUD');
    console.log('Objetivo: Detectar pérdida de datos durante operaciones CREATE, READ, UPDATE, DELETE');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    const testAsesor = 'TEST_FUNCTIONAL_' + Date.now();
    
    try {
        // CREATE: Crear nueva configuración
        console.log('  📝 Probando CREATE...');
        const testData = generateTestData();
        
        const createResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`, {
            method: 'PUT',
            body: JSON.stringify({
                categoria: 'TEST',
                config: testData.config
            })
        });
        
        if (!createResult.success) {
            passed = false;
            issues.push('CREATE falló');
            console.log('  ❌ CREATE falló:', createResult.error);
        } else {
            console.log('  ✅ CREATE exitoso');
            
            // READ: Verificar que los datos se guardaron correctamente
            console.log('  📖 Probando READ...');
            await sleep(100); // Pequeño delay para asegurar consistencia
            
            const readResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`);
            
            if (!readResult.success || !readResult.data.success) {
                passed = false;
                issues.push('READ falló después de CREATE');
                console.log('  ❌ READ falló después de CREATE');
            } else {
                const retrievedData = readResult.data.data.config_data;
                
                // Verificar integridad de datos específicos
                if (retrievedData.version !== testData.config.version) {
                    passed = false;
                    issues.push('Datos corrompidos en READ');
                    console.log('  ❌ Datos corrompidos: version no coincide');
                } else {
                    console.log('  ✅ READ exitoso y datos íntegros');
                }
                
                // UPDATE: Modificar configuración
                console.log('  🔄 Probando UPDATE...');
                const updatedData = { ...testData.config, version: `updated-${Date.now()}` };
                
                const updateResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        categoria: 'TEST_UPDATED',
                        config: updatedData
                    })
                });
                
                if (!updateResult.success) {
                    passed = false;
                    issues.push('UPDATE falló');
                    console.log('  ❌ UPDATE falló:', updateResult.error);
                } else {
                    console.log('  ✅ UPDATE exitoso');
                    
                    // Verificar que UPDATE realmente cambió los datos
                    const verifyUpdateResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`);
                    
                    if (verifyUpdateResult.success && 
                        verifyUpdateResult.data.data.config_data.version === updatedData.version &&
                        verifyUpdateResult.data.data.categoria === 'TEST_UPDATED') {
                        console.log('  ✅ UPDATE verificado - datos actualizados correctamente');
                    } else {
                        passed = false;
                        issues.push('UPDATE no persistió cambios');
                        console.log('  ❌ UPDATE no persistió cambios correctamente');
                    }
                }
            }
        }
        
        // DELETE: Limpiar datos de prueba
        console.log('  🗑️  Probando DELETE...');
        const deleteResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`, {
            method: 'DELETE'
        });
        
        if (!deleteResult.success) {
            console.log('  ⚠️  DELETE falló (no crítico para test):', deleteResult.error);
        } else {
            console.log('  ✅ DELETE exitoso');
            
            // Verificar que DELETE realmente eliminó los datos
            const verifyDeleteResult = await makeRequest(`${API_BASE_URL}/config/${testAsesor}`);
            
            if (verifyDeleteResult.success && verifyDeleteResult.data.success) {
                passed = false;
                issues.push('DELETE no eliminó datos');
                console.log('  ❌ DELETE no eliminó datos correctamente');
            } else {
                console.log('  ✅ DELETE verificado - datos eliminados correctamente');
            }
        }
        
    } catch (error) {
        passed = false;
        issues.push(`Error inesperado: ${error.message}`);
        console.log('  ❌ Error inesperado:', error.message);
    }
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️  Duración: ${duration}ms`);
    
    return { passed, issues, duration, testName: 'Integridad CRUD' };
}

// TEST 3: Test de Estrés y Detección de Pérdida de Datos
async function testStressAndDataLoss() {
    console.log('\n🔍 Test 3: Test de Estrés y Detección de Pérdida de Datos');
    console.log(`Objetivo: Detectar pérdida de datos bajo carga (${STRESS_TEST_ITERATIONS} operaciones)`);
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    let successfulOps = 0;
    let failedOps = 0;
    const createdAsesores = [];
    
    console.log(`  🚀 Ejecutando ${STRESS_TEST_ITERATIONS} operaciones concurrentes...`);
    
    // Crear múltiples configuraciones simultáneamente
    const stressTests = [];
    for (let i = 0; i < STRESS_TEST_ITERATIONS; i++) {
        const testAsesor = `STRESS_TEST_${i}_${Date.now()}`;
        createdAsesores.push(testAsesor);
        
        const testData = generateTestData();
        stressTests.push(
            makeRequest(`${API_BASE_URL}/config/${testAsesor}`, {
                method: 'PUT',
                body: JSON.stringify({
                    categoria: 'STRESS_TEST',
                    config: { ...testData.config, testIndex: i }
                })
            }).then(result => ({ testAsesor, result, testIndex: i }))
        );
    }
    
    const results = await Promise.allSettled(stressTests);
    
    // Analizar resultados
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.result.success) {
            successfulOps++;
        } else {
            failedOps++;
            console.log(`  ⚠️  Operación falló: ${result.reason || result.value?.result?.error}`);
        }
    }
    
    console.log(`  📊 Resultados: ${successfulOps} exitosas, ${failedOps} fallidas`);
    
    if (failedOps > STRESS_TEST_ITERATIONS * 0.1) { // Más del 10% de fallas
        passed = false;
        issues.push(`Demasiadas fallas: ${failedOps}/${STRESS_TEST_ITERATIONS}`);
        console.log(`  ❌ Tasa de fallas muy alta: ${((failedOps/STRESS_TEST_ITERATIONS)*100).toFixed(1)}%`);
    } else {
        console.log(`  ✅ Tasa de fallas aceptable: ${((failedOps/STRESS_TEST_ITERATIONS)*100).toFixed(1)}%`);
    }
    
    // Verificar integridad de datos creados
    console.log('  🔍 Verificando integridad de datos creados...');
    let verificationErrors = 0;
    
    const verificationTests = createdAsesores.slice(0, Math.min(10, createdAsesores.length)).map(async (asesor, index) => {
        const verifyResult = await makeRequest(`${API_BASE_URL}/config/${asesor}`);
        
        if (!verifyResult.success || !verifyResult.data.success) {
            verificationErrors++;
            return false;
        }
        
        const data = verifyResult.data.data.config_data;
        if (data.testIndex !== index) {
            verificationErrors++;
            return false;
        }
        
        return true;
    });
    
    await Promise.all(verificationTests);
    
    if (verificationErrors > 0) {
        passed = false;
        issues.push(`${verificationErrors} errores de verificación de datos`);
        console.log(`  ❌ ${verificationErrors} datos corruptos o perdidos detectados`);
    } else {
        console.log('  ✅ Todos los datos verificados son íntegros');
    }
    
    // Limpiar datos de prueba
    console.log('  🧹 Limpiando datos de prueba...');
    const cleanupPromises = createdAsesores.map(asesor => 
        makeRequest(`${API_BASE_URL}/config/${asesor}`, { method: 'DELETE' })
    );
    
    await Promise.allSettled(cleanupPromises);
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️  Duración: ${duration}ms`);
    
    return { passed, issues, duration, testName: 'Test de Estrés y Pérdida de Datos', successfulOps, failedOps };
}

// TEST 4: Verificar Consistencia de Datos Existentes
async function testExistingDataConsistency() {
    console.log('\n🔍 Test 4: Consistencia de Datos Existentes');
    console.log('Objetivo: Verificar que los datos existentes están íntegros y consistentes');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    let checkedAsesores = 0;
    let corruptedData = 0;
    
    for (const asesor of TEST_ASESORES) {
        console.log(`  🔍 Verificando datos de ${asesor}...`);
        
        const result = await makeRequest(`${API_BASE_URL}/config/${asesor}`);
        
        if (result.success && result.data.success) {
            checkedAsesores++;
            const data = result.data.data;
            
            // Verificaciones de integridad
            const checks = [
                { 
                    name: 'config_data existe', 
                    test: () => data.config_data !== null && data.config_data !== undefined 
                },
                { 
                    name: 'nombre_asesor coincide', 
                    test: () => data.nombre_asesor === asesor 
                },
                { 
                    name: 'categoria válida', 
                    test: () => data.categoria && typeof data.categoria === 'string' && data.categoria.trim() !== '' 
                },
                { 
                    name: 'timestamps válidos', 
                    test: () => data.created_at && data.updated_at && new Date(data.created_at).getTime() > 0 
                },
                { 
                    name: 'config_data es JSON válido', 
                    test: () => {
                        try {
                            return typeof data.config_data === 'object' && data.config_data !== null;
                        } catch {
                            return false;
                        }
                    }
                }
            ];
            
            for (const check of checks) {
                try {
                    if (!check.test()) {
                        passed = false;
                        corruptedData++;
                        issues.push(`${asesor}: ${check.name} falló`);
                        console.log(`    ❌ ${check.name} falló`);
                    } else {
                        console.log(`    ✅ ${check.name} OK`);
                    }
                } catch (error) {
                    passed = false;
                    corruptedData++;
                    issues.push(`${asesor}: Error en ${check.name}: ${error.message}`);
                    console.log(`    ❌ Error en ${check.name}: ${error.message}`);
                }
            }
            
        } else {
            console.log(`  ⚠️  ${asesor}: No se pudo obtener configuración`);
        }
    }
    
    console.log(`  📊 Verificados: ${checkedAsesores}/${TEST_ASESORES.length} asesores`);
    console.log(`  📊 Datos corruptos detectados: ${corruptedData}`);
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️  Duración: ${duration}ms`);
    
    return { passed, issues, duration, testName: 'Consistencia de Datos', checkedAsesores, corruptedData };
}

// TEST 5: Test de Recuperación ante Errores
async function testErrorRecovery() {
    console.log('\n🔍 Test 5: Recuperación ante Errores');
    console.log('Objetivo: Verificar que el sistema se recupera correctamente de errores');
    
    const startTime = Date.now();
    let passed = true;
    let issues = [];
    
    // Test requests malformados
    console.log('  📝 Probando manejo de requests malformados...');
    
    const malformedTests = [
        {
            name: 'JSON inválido',
            request: () => makeRequest(`${API_BASE_URL}/config/TEST_ERROR`, {
                method: 'PUT',
                body: 'invalid json{'
            })
        },
        {
            name: 'Datos faltantes',
            request: () => makeRequest(`${API_BASE_URL}/config/TEST_ERROR`, {
                method: 'PUT',
                body: JSON.stringify({})
            })
        },
        {
            name: 'Asesor con caracteres especiales',
            request: () => makeRequest(`${API_BASE_URL}/config/TEST_ERROR@#$%`, {
                method: 'GET'
            })
        }
    ];
    
    for (const test of malformedTests) {
        const result = await test.request();
        
        if (result.success) {
            passed = false;
            issues.push(`${test.name}: Debería haber fallado pero no lo hizo`);
            console.log(`  ❌ ${test.name}: Sistema aceptó request inválido`);
        } else {
            console.log(`  ✅ ${test.name}: Error manejado correctamente`);
        }
    }
    
    // Test recuperación después de errores
    console.log('  🔄 Probando recuperación después de errores...');
    await sleep(1000);
    
    const recoveryTest = await makeRequest(`${API_BASE_URL}/health`);
    if (!recoveryTest.success) {
        passed = false;
        issues.push('Sistema no se recuperó después de errores');
        console.log('  ❌ Sistema no se recuperó correctamente');
    } else {
        console.log('  ✅ Sistema se recuperó correctamente');
    }
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️  Duración: ${duration}ms`);
    
    return { passed, issues, duration, testName: 'Recuperación ante Errores' };
}

// Función para generar reporte detallado
function generateDetailedReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE DETALLADO DE TESTING FUNCIONAL');
    console.log('='.repeat(80));
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`📈 Estadísticas Generales:`);
    console.log(`   Total de tests: ${totalTests}`);
    console.log(`   Tests exitosos: ${passedTests}`);
    console.log(`   Tests fallidos: ${failedTests}`);
    console.log(`   Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`   Tiempo total: ${totalDuration}ms (${(totalDuration/1000).toFixed(1)}s)`);
    
    console.log('\n📋 Detalle por Test:');
    results.forEach((result, index) => {
        const status = result.passed ? '✅ PASÓ' : '❌ FALLÓ';
        console.log(`   ${index + 1}. ${status} ${result.testName} (${result.duration}ms)`);
        
        if (result.issues && result.issues.length > 0) {
            result.issues.forEach(issue => {
                console.log(`      ⚠️  ${issue}`);
            });
        }
        
        // Estadísticas adicionales
        if (result.successfulOps !== undefined) {
            console.log(`      📊 Operaciones exitosas: ${result.successfulOps}`);
        }
        if (result.failedOps !== undefined) {
            console.log(`      📊 Operaciones fallidas: ${result.failedOps}`);
        }
        if (result.checkedAsesores !== undefined) {
            console.log(`      📊 Asesores verificados: ${result.checkedAsesores}`);
        }
        if (result.corruptedData !== undefined) {
            console.log(`      📊 Datos corruptos: ${result.corruptedData}`);
        }
    });
    
    // Recomendaciones
    console.log('\n💡 Recomendaciones:');
    
    if (failedTests === 0) {
        console.log('   🎉 ¡Excelente! No se detectaron errores de lectura/escritura o caída de datos.');
        console.log('   ✅ El sistema está funcionando correctamente y es seguro para producción.');
    } else {
        console.log('   ⚠️  Se detectaron problemas que requieren atención:');
        
        const allIssues = results.flatMap(r => r.issues || []);
        const uniqueIssues = [...new Set(allIssues)];
        
        uniqueIssues.forEach(issue => {
            console.log(`      • ${issue}`);
        });
        
        console.log('\n   🔧 Acciones sugeridas:');
        console.log('      1. Revisar logs del servidor PostgreSQL');
        console.log('      2. Verificar configuración de pool de conexiones');
        console.log('      3. Ejecutar: node backend/scripts/verify.js');
        console.log('      4. Reiniciar servidor si es necesario');
        console.log('      5. Re-ejecutar este test después de correcciones');
    }
    
    return { totalTests, passedTests, failedTests, totalDuration };
}

// Función principal
async function runFunctionalTests() {
    const startTime = Date.now();
    
    console.log('🚀 Iniciando batería de tests funcionales...\n');
    
    const tests = [
        testDatabaseConnectionIntegrity,
        testCRUDDataIntegrity,
        testStressAndDataLoss,
        testExistingDataConsistency,
        testErrorRecovery
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
    
    const summary = generateDetailedReport(results);
    
    // Guardar reporte en archivo
    const reportData = {
        timestamp: new Date().toISOString(),
        summary,
        results,
        totalExecutionTime: Date.now() - startTime
    };
    
    const reportPath = `test-funcional-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 TESTING FUNCIONAL COMPLETADO');
    console.log('='.repeat(80));
    
    return summary.failedTests === 0;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runFunctionalTests().then(success => {
        console.log(`\n🎯 Resultado final: ${success ? 'TODOS LOS TESTS PASARON' : 'ALGUNOS TESTS FALLARON'}`);
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error crítico ejecutando tests:', error);
        process.exit(1);
    });
}

module.exports = { runFunctionalTests };