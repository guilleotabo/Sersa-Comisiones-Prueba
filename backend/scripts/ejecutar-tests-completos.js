#!/usr/bin/env node

/**
 * SUITE COMPLETA DE TESTING FUNCIONAL
 * Sistema de Comisiones Comerciales SERSA
 * 
 * Este script ejecuta todos los tests disponibles para detectar:
 * - Errores de lectura/escritura y caída de datos
 * - Problemas de salud de la base de datos
 * - Integridad del sistema completo
 * - Problemas de rendimiento
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 SUITE COMPLETA DE TESTING FUNCIONAL - SERSA COMISIONES');
console.log('=' .repeat(80));
console.log('Objetivo: Análisis completo de integridad y salud del sistema');
console.log('Incluye: Tests funcionales, DB health check, integración');
console.log('Fecha:', new Date().toISOString());
console.log('=' .repeat(80));

// Verificar que el servidor esté funcionando antes de empezar
async function checkServerRunning() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (response.ok) {
            console.log('✅ Servidor backend detectado y funcionando');
            return true;
        }
    } catch (error) {
        console.log('❌ Servidor backend no está funcionando');
        console.log('💡 Inicia el servidor con: npm start en la carpeta backend/');
        return false;
    }
    return false;
}

// Función para ejecutar un script Node.js y capturar su resultado
function executeScript(scriptPath) {
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        const process = spawn('node', [scriptPath], { stdio: 'pipe' });
        
        let output = '';
        let errorOutput = '';
        
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        process.on('close', (code) => {
            resolve({
                success: code === 0,
                output,
                errorOutput,
                exitCode: code
            });
        });
    });
}

// Función principal que ejecuta todos los tests
async function runCompleteTestSuite() {
    const suiteStartTime = Date.now();
    console.log('🚀 Iniciando suite completa de tests...\n');
    
    // Verificar que el servidor esté funcionando
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
        console.log('\n❌ No se puede continuar sin el servidor backend funcionando');
        console.log('🔧 Pasos para solucionarlo:');
        console.log('   1. cd backend');
        console.log('   2. npm install (si no se ha hecho)');
        console.log('   3. npm start');
        console.log('   4. Volver a ejecutar este test');
        return false;
    }
    
    const testResults = [];
    
    // Test 1: Tests básicos de integración
    console.log('\n📋 EJECUTANDO: Tests de Integración Básica');
    console.log('-'.repeat(50));
    
    const integrationTestPath = path.join(__dirname, 'test-integration.js');
    if (fs.existsSync(integrationTestPath)) {
        const integrationResult = await executeScript(integrationTestPath);
        console.log(integrationResult.output);
        
        testResults.push({
            testName: 'Tests de Integración Básica',
            success: integrationResult.success,
            output: integrationResult.output,
            duration: 'Ver output',
            category: 'integration'
        });
        
        if (integrationResult.success) {
            console.log('✅ Tests de integración básica: EXITOSOS');
        } else {
            console.log('❌ Tests de integración básica: FALLARON');
        }
    } else {
        console.log('⚠️  Archivo test-integration.js no encontrado, saltando...');
    }
    
    // Test 2: Tests funcionales avanzados de datos
    console.log('\n🔍 EJECUTANDO: Tests Funcionales de Datos (Lectura/Escritura)');
    console.log('-'.repeat(50));
    
    const functionalTestPath = path.join(__dirname, 'test-funcional-datos.js');
    if (fs.existsSync(functionalTestPath)) {
        const functionalResult = await executeScript(functionalTestPath);
        console.log(functionalResult.output);
        
        testResults.push({
            testName: 'Tests Funcionales de Datos',
            success: functionalResult.success,
            output: functionalResult.output,
            duration: 'Ver output',
            category: 'functional'
        });
        
        if (functionalResult.success) {
            console.log('✅ Tests funcionales de datos: EXITOSOS');
        } else {
            console.log('❌ Tests funcionales de datos: FALLARON');
        }
    } else {
        console.log('⚠️  Archivo test-funcional-datos.js no encontrado');
    }
    
    // Test 3: Verificación de salud de base de datos
    console.log('\n🔍 EJECUTANDO: Verificación de Salud de Base de Datos');
    console.log('-'.repeat(50));
    
    const dbHealthTestPath = path.join(__dirname, 'verificar-db-salud.js');
    if (fs.existsSync(dbHealthTestPath)) {
        const dbHealthResult = await executeScript(dbHealthTestPath);
        console.log(dbHealthResult.output);
        
        testResults.push({
            testName: 'Verificación de Salud de BD',
            success: dbHealthResult.success,
            output: dbHealthResult.output,
            duration: 'Ver output',
            category: 'database'
        });
        
        if (dbHealthResult.success) {
            console.log('✅ Verificación de salud de BD: EXITOSA');
        } else {
            console.log('❌ Verificación de salud de BD: PROBLEMAS DETECTADOS');
        }
    } else {
        console.log('⚠️  Archivo verificar-db-salud.js no encontrado');
    }
    
    // Generar reporte consolidado
    const totalExecutionTime = Date.now() - suiteStartTime;
    const report = generateConsolidatedReport(testResults, totalExecutionTime);
    
    // Guardar reporte completo
    const reportPath = `reporte-completo-${Date.now()}.json`;
    const detailedReport = {
        timestamp: new Date().toISOString(),
        system: 'SERSA Comisiones Comerciales',
        testSuite: 'Complete Functional Testing',
        summary: report,
        testResults,
        totalExecutionTime,
        recommendations: generateRecommendations(testResults)
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    
    return report.allTestsPassed;
}

// Función para generar reporte consolidado
function generateConsolidatedReport(testResults, totalExecutionTime) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE CONSOLIDADO - SUITE COMPLETA DE TESTING');
    console.log('='.repeat(80));
    
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`🎯 RESUMEN EJECUTIVO:`);
    console.log(`   📈 Total de suites ejecutadas: ${totalTests}`);
    console.log(`   ✅ Suites exitosas: ${passedTests}`);
    console.log(`   ❌ Suites con problemas: ${failedTests}`);
    console.log(`   📊 Tasa de éxito general: ${totalTests > 0 ? ((passedTests/totalTests)*100).toFixed(1) : 0}%`);
    console.log(`   ⏱️  Tiempo total de ejecución: ${(totalExecutionTime/1000).toFixed(1)}s`);
    
    console.log('\n📋 DETALLE POR CATEGORÍA:');
    
    const categories = {
        integration: 'Tests de Integración',
        functional: 'Tests Funcionales de Datos',
        database: 'Verificación de Salud de BD'
    };
    
    Object.keys(categories).forEach(category => {
        const categoryTests = testResults.filter(t => t.category === category);
        if (categoryTests.length > 0) {
            const categoryPassed = categoryTests.filter(t => t.success).length;
            const status = categoryPassed === categoryTests.length ? '✅ EXITOSO' : '❌ PROBLEMAS';
            console.log(`   ${status} ${categories[category]}: ${categoryPassed}/${categoryTests.length}`);
        }
    });
    
    console.log('\n🔍 ANÁLISIS DE PROBLEMAS DETECTADOS:');
    
    const failedTestDetails = testResults.filter(r => !r.success);
    if (failedTestDetails.length === 0) {
        console.log('   🎉 ¡EXCELENTE! No se detectaron problemas en el sistema.');
        console.log('   ✅ Todos los tests de lectura/escritura y salud de datos pasaron.');
        console.log('   🔒 El sistema es seguro para producción.');
    } else {
        console.log('   ⚠️  Se detectaron los siguientes problemas:');
        failedTestDetails.forEach((test, index) => {
            console.log(`   ${index + 1}. ${test.testName}: FALLÓ`);
        });
    }
    
    const allTestsPassed = failedTests === 0;
    
    return {
        totalTests,
        passedTests,
        failedTests,
        allTestsPassed,
        successRate: totalTests > 0 ? ((passedTests/totalTests)*100).toFixed(1) : 0,
        totalExecutionTime
    };
}

// Función para generar recomendaciones
function generateRecommendations(testResults) {
    console.log('\n💡 RECOMENDACIONES Y ACCIONES:');
    
    const failedTests = testResults.filter(r => !r.success);
    
    if (failedTests.length === 0) {
        console.log('   ✅ Sistema funcionando óptimamente');
        console.log('   📅 Próxima verificación recomendada: En 7 días');
        console.log('   🔄 Ejecutar estos tests antes de cualquier despliegue');
        
        return {
            status: 'optimal',
            actions: [
                'Sistema funcionando correctamente',
                'Continuar con monitoreo regular',
                'Ejecutar tests antes de despliegues'
            ]
        };
    } else {
        const recommendations = [];
        
        console.log('   🚨 ACCIÓN INMEDIATA REQUERIDA:');
        
        // Recomendaciones específicas por tipo de falla
        failedTests.forEach(test => {
            switch (test.category) {
                case 'integration':
                    console.log('   🔧 Tests de integración fallaron:');
                    console.log('      1. Verificar que el servidor esté funcionando');
                    console.log('      2. Ejecutar: node backend/scripts/migrate.js');
                    console.log('      3. Verificar configuraciones en config.env');
                    recommendations.push('Reparar integración básica del sistema');
                    break;
                    
                case 'functional':
                    console.log('   💾 Tests funcionales de datos fallaron:');
                    console.log('      1. Verificar integridad de la base de datos');
                    console.log('      2. Revisar logs de PostgreSQL');
                    console.log('      3. Ejecutar VACUUM y ANALYZE en la BD');
                    console.log('      4. Verificar pool de conexiones');
                    recommendations.push('Reparar problemas de lectura/escritura de datos');
                    break;
                    
                case 'database':
                    console.log('   🗄️  Verificación de salud de BD falló:');
                    console.log('      1. Revisar configuración de PostgreSQL');
                    console.log('      2. Verificar espacio en disco');
                    console.log('      3. Optimizar índices y tablas');
                    console.log('      4. Monitorear rendimiento de queries');
                    recommendations.push('Optimizar y reparar base de datos');
                    break;
            }
        });
        
        console.log('\n   📋 CHECKLIST DE VERIFICACIÓN:');
        console.log('      □ Servidor backend funcionando (npm start)');
        console.log('      □ PostgreSQL funcionando y accesible');
        console.log('      □ Configuraciones en config.env correctas');
        console.log('      □ Base de datos migrada (node scripts/migrate.js)');
        console.log('      □ Pool de conexiones configurado apropiadamente');
        console.log('      □ Espacio en disco suficiente');
        
        console.log('\n   🔄 DESPUÉS DE REALIZAR CORRECCIONES:');
        console.log('      1. Re-ejecutar este script completo');
        console.log('      2. Verificar que todos los tests pasen');
        console.log('      3. Documentar las correcciones realizadas');
        
        return {
            status: 'requires_attention',
            actions: recommendations,
            failedCategories: failedTests.map(t => t.category)
        };
    }
}

// Función para mostrar ayuda
function showHelp() {
    console.log('\n📖 AYUDA - SUITE DE TESTING FUNCIONAL SERSA');
    console.log('='.repeat(50));
    console.log('Este script ejecuta una suite completa de tests para detectar:');
    console.log('  • Errores de lectura/escritura de datos');
    console.log('  • Caída o corrupción de datos');
    console.log('  • Problemas de salud de la base de datos');
    console.log('  • Integridad del sistema completo');
    console.log('');
    console.log('📋 REQUISITOS PREVIOS:');
    console.log('  1. PostgreSQL funcionando');
    console.log('  2. Base de datos "sersa_comisiones" creada');
    console.log('  3. Servidor backend ejecutándose (npm start)');
    console.log('  4. Configuración en backend/config.env correcta');
    console.log('');
    console.log('🚀 USO:');
    console.log('  node backend/scripts/ejecutar-tests-completos.js');
    console.log('');
    console.log('📄 REPORTES GENERADOS:');
    console.log('  • reporte-completo-[timestamp].json');
    console.log('  • test-funcional-report-[timestamp].json');
    console.log('  • db-health-report-[timestamp].json');
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runCompleteTestSuite().then(success => {
        const resultMessage = success ? 
            '🎉 TODOS LOS TESTS EXITOSOS - SISTEMA SALUDABLE' : 
            '⚠️  PROBLEMAS DETECTADOS - REQUIERE ATENCIÓN';
            
        console.log('\n' + '='.repeat(80));
        console.log('🏁 SUITE DE TESTING COMPLETADA');
        console.log('='.repeat(80));
        console.log(`🎯 RESULTADO FINAL: ${resultMessage}`);
        
        if (!success) {
            console.log('\n🚨 IMPORTANTE: Corrige los problemas antes de usar en producción');
        }
        
        console.log('\n💡 Para más información, ejecuta: node ejecutar-tests-completos.js --help');
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error crítico ejecutando suite de tests:', error);
        process.exit(1);
    });
}

module.exports = { runCompleteTestSuite };