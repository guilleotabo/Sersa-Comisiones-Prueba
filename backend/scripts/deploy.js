const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 INICIANDO PROCESO DE DESPLIEGUE');
console.log('=' .repeat(50));
console.log('');

// Configuración de despliegue
const DEPLOY_CONFIG = {
    production: {
        port: 3000,
        nodeEnv: 'production',
        corsOrigin: '*',
        logLevel: 'warn'
    },
    staging: {
        port: 3001,
        nodeEnv: 'staging',
        corsOrigin: 'http://localhost:5500',
        logLevel: 'info'
    },
    development: {
        port: 3000,
        nodeEnv: 'development',
        corsOrigin: 'http://localhost:5500',
        logLevel: 'debug'
    }
};

// Función para verificar que Node.js esté instalado
function checkNodeVersion() {
    try {
        const version = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Node.js versión: ${version}`);
        return true;
    } catch (error) {
        console.log('❌ Node.js no está instalado o no está en el PATH');
        return false;
    }
}

// Función para verificar que npm esté instalado
function checkNpmVersion() {
    try {
        const version = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(`✅ npm versión: ${version}`);
        return true;
    } catch (error) {
        console.log('❌ npm no está instalado o no está en el PATH');
        return false;
    }
}

// Función para verificar que PostgreSQL esté disponible
async function checkPostgreSQL() {
    try {
        // Intentar conectar a PostgreSQL usando psql
        execSync('psql --version', { encoding: 'utf8' });
        console.log('✅ PostgreSQL está disponible');
        return true;
    } catch (error) {
        console.log('⚠️  PostgreSQL no está disponible o no está en el PATH');
        console.log('💡 Asegúrate de que PostgreSQL esté instalado y configurado');
        return false;
    }
}

// Función para instalar dependencias
function installDependencies() {
    console.log('\n📦 Instalando dependencias...');
    
    try {
        execSync('npm install', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        console.log('✅ Dependencias instaladas correctamente');
        return true;
    } catch (error) {
        console.log('❌ Error instalando dependencias:', error.message);
        return false;
    }
}

// Función para crear archivo de configuración
function createConfigFile(environment) {
    console.log(`\n⚙️  Creando archivo de configuración para ${environment}...`);
    
    const configPath = path.join(__dirname, '..', 'config.env');
    const examplePath = path.join(__dirname, '..', 'config.env.example');
    
    if (!fs.existsSync(examplePath)) {
        console.log('❌ Archivo config.env.example no encontrado');
        return false;
    }
    
    if (fs.existsSync(configPath)) {
        console.log('⚠️  Archivo config.env ya existe, creando backup...');
        const backupPath = `${configPath}.backup.${Date.now()}`;
        fs.copyFileSync(configPath, backupPath);
        console.log(`📁 Backup creado: ${backupPath}`);
    }
    
    try {
        // Leer el archivo de ejemplo
        let configContent = fs.readFileSync(examplePath, 'utf8');
        
        // Aplicar configuración específica del entorno
        const envConfig = DEPLOY_CONFIG[environment];
        if (envConfig) {
            configContent = configContent
                .replace(/PORT=\d+/, `PORT=${envConfig.port}`)
                .replace(/NODE_ENV=\w+/, `NODE_ENV=${envConfig.nodeEnv}`)
                .replace(/CORS_ORIGIN=.*/, `CORS_ORIGIN=${envConfig.corsOrigin}`)
                .replace(/LOG_LEVEL=\w+/, `LOG_LEVEL=${envConfig.logLevel}`);
        }
        
        // Escribir el archivo de configuración
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Archivo config.env creado correctamente');
        return true;
    } catch (error) {
        console.log('❌ Error creando archivo de configuración:', error.message);
        return false;
    }
}

// Función para ejecutar migraciones
function runMigrations() {
    console.log('\n🔄 Ejecutando migraciones...');
    
    try {
        execSync('node scripts/migrate.js', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        console.log('✅ Migraciones ejecutadas correctamente');
        return true;
    } catch (error) {
        console.log('❌ Error ejecutando migraciones:', error.message);
        return false;
    }
}

// Función para ejecutar tests
function runTests() {
    console.log('\n🧪 Ejecutando tests...');
    
    try {
        execSync('node scripts/test-integration.js', { 
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
        console.log('✅ Tests pasaron correctamente');
        return true;
    } catch (error) {
        console.log('❌ Error ejecutando tests:', error.message);
        return false;
    }
}

// Función para crear script de inicio
function createStartScript(environment) {
    console.log('\n📝 Creando script de inicio...');
    
    const scriptContent = `#!/bin/bash
# Script de inicio para SERSA Comisiones API (${environment})

echo "🚀 Iniciando SERSA Comisiones API en modo ${environment}..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que el archivo de configuración exista
if [ ! -f "config.env" ]; then
    echo "❌ Archivo config.env no encontrado"
    exit 1
fi

# Iniciar el servidor
echo "✅ Iniciando servidor en puerto ${DEPLOY_CONFIG[environment]?.port || 3000}..."
node server.js

echo "🛑 Servidor detenido"
`;

    const scriptPath = path.join(__dirname, '..', 'start.sh');
    
    try {
        fs.writeFileSync(scriptPath, scriptContent);
        // Hacer el script ejecutable (en sistemas Unix)
        try {
            execSync(`chmod +x ${scriptPath}`);
        } catch (e) {
            // En Windows, ignorar el error de chmod
        }
        console.log('✅ Script de inicio creado: start.sh');
        return true;
    } catch (error) {
        console.log('❌ Error creando script de inicio:', error.message);
        return false;
    }
}

// Función para crear documentación de despliegue
function createDeploymentDocs(environment) {
    console.log('\n📚 Creando documentación de despliegue...');
    
    const docsContent = `# Documentación de Despliegue - SERSA Comisiones API

## Entorno: ${environment}

### Requisitos Previos
- Node.js 16+ instalado
- PostgreSQL 12+ instalado y configurado
- Base de datos 'sersa_comisiones' creada

### Configuración
1. Copiar \`config.env.example\` a \`config.env\`
2. Configurar las variables de entorno en \`config.env\`
3. Asegurarse de que las credenciales de PostgreSQL sean correctas

### Instalación
\`\`\`bash
npm install
\`\`\`

### Migración de Datos
\`\`\`bash
node scripts/migrate.js
\`\`\`

### Testing
\`\`\`bash
node scripts/test-integration.js
\`\`\`

### Inicio del Servidor
\`\`\`bash
# Opción 1: Usando npm
npm start

# Opción 2: Usando el script de inicio
./start.sh

# Opción 3: Directamente
node server.js
\`\`\`

### Verificación
- Health check: http://localhost:${DEPLOY_CONFIG[environment]?.port || 3000}/api/health
- API docs: http://localhost:${DEPLOY_CONFIG[environment]?.port || 3000}/

### Logs
Los logs se muestran en la consola. Para producción, considera usar PM2 o similar.

### Monitoreo
- Endpoint de health: /api/health
- Métricas básicas incluidas en el health check

### Backup
El sistema incluye scripts para backup automático de configuraciones.
Configurar en config.env:
- BACKUP_ENABLED=true
- BACKUP_INTERVAL_HOURS=24
- BACKUP_RETENTION_DAYS=7

### Troubleshooting
1. Verificar conexión a PostgreSQL
2. Revisar logs del servidor
3. Ejecutar tests de integración
4. Verificar archivo config.env

---
Generado automáticamente el ${new Date().toISOString()}
`;

    const docsPath = path.join(__dirname, '..', 'DEPLOYMENT.md');
    
    try {
        fs.writeFileSync(docsPath, docsContent);
        console.log('✅ Documentación creada: DEPLOYMENT.md');
        return true;
    } catch (error) {
        console.log('❌ Error creando documentación:', error.message);
        return false;
    }
}

// Función principal de despliegue
async function deploy(environment = 'development') {
    console.log(`🎯 Iniciando despliegue en modo: ${environment.toUpperCase()}`);
    console.log('');
    
    const steps = [
        { name: 'Verificar Node.js', fn: checkNodeVersion },
        { name: 'Verificar npm', fn: checkNpmVersion },
        { name: 'Verificar PostgreSQL', fn: checkPostgreSQL },
        { name: 'Instalar dependencias', fn: installDependencies },
        { name: 'Crear configuración', fn: () => createConfigFile(environment) },
        { name: 'Ejecutar migraciones', fn: runMigrations },
        { name: 'Ejecutar tests', fn: runTests },
        { name: 'Crear script de inicio', fn: () => createStartScript(environment) },
        { name: 'Crear documentación', fn: () => createDeploymentDocs(environment) }
    ];
    
    let successCount = 0;
    
    for (const step of steps) {
        console.log(`\n🔍 ${step.name}...`);
        try {
            const result = await step.fn();
            if (result) {
                successCount++;
            }
        } catch (error) {
            console.log(`❌ Error en ${step.name}:`, error.message);
        }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DEL DESPLIEGUE');
    console.log('='.repeat(50));
    console.log(`✅ Pasos completados: ${successCount}/${steps.length}`);
    console.log(`🎯 Entorno: ${environment.toUpperCase()}`);
    
    if (successCount === steps.length) {
        console.log('\n🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!');
        console.log('\n🚀 Para iniciar el servidor:');
        console.log(`   npm start`);
        console.log(`   o ./start.sh`);
        console.log(`\n🌐 Servidor disponible en: http://localhost:${DEPLOY_CONFIG[environment]?.port || 3000}`);
        console.log(`🏥 Health check: http://localhost:${DEPLOY_CONFIG[environment]?.port || 3000}/api/health`);
    } else {
        console.log('\n⚠️  Algunos pasos fallaron. Revisa los errores arriba.');
        console.log('💡 Ejecuta los pasos fallidos manualmente.');
    }
    
    return successCount === steps.length;
}

// Manejo de argumentos de línea de comandos
const environment = process.argv[2] || 'development';
const validEnvironments = ['development', 'staging', 'production'];

if (!validEnvironments.includes(environment)) {
    console.log('❌ Entorno inválido. Usa: development, staging, o production');
    console.log('💡 Ejemplo: node deploy.js production');
    process.exit(1);
}

// Ejecutar despliegue
deploy(environment).then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Error en el despliegue:', error);
    process.exit(1);
}); 