const fs = require('fs');
const path = require('path');

// Configuración de testing
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_ASESORES = ['Base', 'Alejandra', 'Aletzia', 'Erika', 'Maximiliano', 'Micaela', 'Rodrigo'];

console.log('🧪 INICIANDO TESTING DE INTEGRACIÓN COMPLETA');
console.log('=' .repeat(60));
console.log('');

// Función para hacer requests HTTP
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test 1: Verificar que el servidor esté funcionando
async function testServerConnection() {
    console.log('🔍 Test 1: Verificando conexión al servidor...');
    
    const result = await makeRequest(`${API_BASE_URL}/health`);
    
    if (result.success) {
        console.log('✅ Servidor respondiendo correctamente');
        return true;
    } else {
        console.log('❌ Error conectando al servidor:', result.error || result.status);
        console.log('💡 Asegúrate de que el backend esté ejecutándose en puerto 3000');
        return false;
    }
}

// Test 2: Verificar que las configuraciones existan
async function testConfigurations() {
    console.log('\n🔍 Test 2: Verificando configuraciones en base de datos...');
    
    let allExist = true;
    let existingCount = 0;
    
    for (const asesor of TEST_ASESORES) {
        const result = await makeRequest(`${API_BASE_URL}/config/${asesor}`);
        
        if (result.success && result.data.success) {
            console.log(`✅ ${asesor}: Configuración encontrada`);
            existingCount++;
        } else {
            console.log(`❌ ${asesor}: Configuración no encontrada`);
            allExist = false;
        }
    }
    
    console.log(`\n📊 Resumen: ${existingCount}/${TEST_ASESORES.length} configuraciones encontradas`);
    
    if (!allExist) {
        console.log('💡 Ejecuta: node backend/scripts/migrate.js para migrar las configuraciones');
    }
    
    return allExist;
}

// Test 3: Verificar estructura de archivos
function testFileStructure() {
    console.log('\n🔍 Test 3: Verificando estructura de archivos...');
    
    const requiredFiles = [
        'index.html',
        'Base/app.js',
        'Base/config.js',
        'backend/server.js',
        'backend/database.js'
    ];
    
    let allExist = true;
    
    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}: Encontrado`);
        } else {
            console.log(`❌ ${file}: No encontrado`);
            allExist = false;
        }
    }
    
    // Verificar carpetas de asesores
    for (const asesor of TEST_ASESORES) {
        if (asesor === 'Base') continue; // Ya verificado arriba
        
        const asesorDir = `${asesor}/`;
        if (fs.existsSync(asesorDir)) {
            console.log(`✅ ${asesorDir}: Carpeta encontrada`);
            
            // Verificar archivos principales del asesor
            const asesorFiles = ['app.js', 'config.js', 'index.html'];
            for (const file of asesorFiles) {
                const filePath = `${asesorDir}${file}`;
                if (fs.existsSync(filePath)) {
                    console.log(`  ✅ ${filePath}: Encontrado`);
                } else {
                    console.log(`  ❌ ${filePath}: No encontrado`);
                    allExist = false;
                }
            }
        } else {
            console.log(`❌ ${asesorDir}: Carpeta no encontrada`);
            allExist = false;
        }
    }
    
    return allExist;
}

// Test 4: Verificar integración frontend-backend
async function testFrontendBackendIntegration() {
    console.log('\n🔍 Test 4: Verificando integración frontend-backend...');
    
    // Verificar que el index.html tenga el modal de login
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    const requiredElements = [
        'loginModal',
        'seleccionarAsesor',
        'API_BASE_URL',
        'getConfig()'
    ];
    
    let allFound = true;
    
    for (const element of requiredElements) {
        if (indexContent.includes(element)) {
            console.log(`✅ ${element}: Encontrado en index.html`);
        } else {
            console.log(`❌ ${element}: No encontrado en index.html`);
            allFound = false;
        }
    }
    
    // Verificar que app.js tenga las funciones de API
    const appContent = fs.readFileSync('Base/app.js', 'utf8');
    
    const requiredFunctions = [
        'saveConfigToAPI',
        'getConfig()',
        'API_BASE_URL'
    ];
    
    for (const func of requiredFunctions) {
        if (appContent.includes(func)) {
            console.log(`✅ ${func}: Encontrado en app.js`);
        } else {
            console.log(`❌ ${func}: No encontrado en app.js`);
            allFound = false;
        }
    }
    
    return allFound;
}

// Test 5: Verificar scripts de utilidad
function testUtilityScripts() {
    console.log('\n🔍 Test 5: Verificando scripts de utilidad...');
    
    const scripts = [
        'backend/scripts/migrate.js',
        'backend/scripts/seed.js',
        'backend/scripts/verify.js',
        'backend/scripts/copy-app.js',
        'backend/scripts/copy-app.ps1'
    ];
    
    let allExist = true;
    
    for (const script of scripts) {
        if (fs.existsSync(script)) {
            console.log(`✅ ${script}: Encontrado`);
        } else {
            console.log(`❌ ${script}: No encontrado`);
            allExist = false;
        }
    }
    
    return allExist;
}

// Test 6: Verificar package.json y dependencias
function testDependencies() {
    console.log('\n🔍 Test 6: Verificando dependencias...');
    
    const packagePath = 'backend/package.json';
    
    if (!fs.existsSync(packagePath)) {
        console.log('❌ backend/package.json: No encontrado');
        return false;
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const requiredDeps = ['express', 'pg', 'cors'];
        let allExist = true;
        
        for (const dep of requiredDeps) {
            if (packageJson.dependencies && packageJson.dependencies[dep]) {
                console.log(`✅ ${dep}: Versión ${packageJson.dependencies[dep]}`);
            } else {
                console.log(`❌ ${dep}: No encontrado en dependencias`);
                allExist = false;
            }
        }
        
        return allExist;
    } catch (error) {
        console.log('❌ Error parseando package.json:', error.message);
        return false;
    }
}

// Función principal de testing
async function runAllTests() {
    console.log('🚀 Ejecutando suite completa de tests...\n');
    
    const tests = [
        { name: 'Conexión al servidor', fn: testServerConnection },
        { name: 'Configuraciones en BD', fn: testConfigurations },
        { name: 'Estructura de archivos', fn: testFileStructure },
        { name: 'Integración frontend-backend', fn: testFrontendBackendIntegration },
        { name: 'Scripts de utilidad', fn: testUtilityScripts },
        { name: 'Dependencias', fn: testDependencies }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, passed: result });
        } catch (error) {
            console.log(`❌ Error en test "${test.name}":`, error.message);
            results.push({ name: test.name, passed: false });
        }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL DE TESTS');
    console.log('='.repeat(60));
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅ PASÓ' : '❌ FALLÓ';
        console.log(`${status} ${result.name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 RESULTADO: ${passedTests}/${totalTests} tests pasaron`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ¡TODOS LOS TESTS PASARON! El sistema está listo para producción.');
    } else {
        console.log('⚠️  Algunos tests fallaron. Revisa los errores arriba.');
        console.log('\n💡 Comandos útiles para resolver problemas:');
        console.log('  1. node backend/scripts/migrate.js  - Migrar configuraciones');
        console.log('  2. node backend/scripts/seed.js     - Insertar datos de prueba');
        console.log('  3. npm install                      - Instalar dependencias');
        console.log('  4. npm start                        - Iniciar servidor');
    }
    
    return passedTests === totalTests;
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Error ejecutando tests:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests }; 