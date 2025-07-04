#!/usr/bin/env node

// Security Update Script
// Propagates security fixes to all advisor directories

const fs = require('fs');
const path = require('path');

const ASESORES = ['Alejandra', 'Aletzia', 'Erika', 'Maximiliano', 'Micaela', 'Rodrigo'];

console.log('🔒 Iniciando actualización de seguridad...\n');

function copyFileWithBackup(sourcePath, targetPath) {
    try {
        // Create backup if target exists
        if (fs.existsSync(targetPath)) {
            const backupPath = `${targetPath}.backup.${Date.now()}`;
            fs.copyFileSync(targetPath, backupPath);
            console.log(`📁 Backup creado: ${backupPath}`);
        }
        
        // Copy new file
        fs.copyFileSync(sourcePath, targetPath);
        return true;
    } catch (error) {
        console.error(`❌ Error copiando ${sourcePath} a ${targetPath}:`, error.message);
        return false;
    }
}

function updateIndexHtml(asesorPath) {
    const indexPath = path.join(asesorPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        console.log(`⚠️  ${indexPath} no encontrado, saltando...`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Check if auth.js is already included
        if (content.includes('auth.js')) {
            console.log(`✅ ${asesorPath}/index.html ya incluye auth.js`);
            return true;
        }
        
        // Add auth.js before app.js
        const scriptPattern = /(<script src="config\.js"><\/script>\s*)(<script src="app\.js">)/;
        if (scriptPattern.test(content)) {
            content = content.replace(scriptPattern, '$1<script src="auth.js"></script>\n$2');
            
            fs.writeFileSync(indexPath, content);
            console.log(`✅ ${asesorPath}/index.html actualizado con auth.js`);
            return true;
        } else {
            console.log(`⚠️  No se pudo encontrar el patrón de scripts en ${asesorPath}/index.html`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error actualizando ${indexPath}:`, error.message);
        return false;
    }
}

function updateAppJs(asesorPath) {
    const appJsPath = path.join(asesorPath, 'app.js');
    
    if (!fs.existsSync(appJsPath)) {
        console.log(`⚠️  ${appJsPath} no encontrado, saltando...`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(appJsPath, 'utf8');
        
        // Check if already updated
        if (content.includes('secureValidateSystemPassword')) {
            console.log(`✅ ${asesorPath}/app.js ya usa autenticación segura`);
            return true;
        }
        
        // Replace hardcoded password constant
        const passwordConstPattern = /const SISTEMA_PASSWORD = ["']comercial2020["'];?\s*/;
        if (passwordConstPattern.test(content)) {
            content = content.replace(passwordConstPattern, '');
            console.log(`🔒 Removida contraseña hardcodeada de ${asesorPath}/app.js`);
        }
        
        // Update verificarContrasena function
        const oldFunctionPattern = /function verificarContrasena\(\) \{[\s\S]*?\n\}/;
        const newFunction = `async function verificarContrasena() {
    const passwordInput = document.getElementById('password-input');
    const errorDiv = document.getElementById('login-error');
    const password = passwordInput.value.trim();
    
    if (!password) {
        mostrarError("❌ Por favor ingrese una contraseña");
        return;
    }
    
    // Mostrar indicador de carga
    mostrarError("🔄 Verificando contraseña...");
    passwordInput.disabled = true;
    
    try {
        // Usar el sistema de autenticación segura
        const result = await window.secureValidateSystemPassword(password);
        
        if (result.success) {
            // Contraseña correcta
            mostrarSistema();
        } else {
            // Contraseña incorrecta o error
            mostrarError(result.message || "❌ Contraseña incorrecta");
            passwordInput.value = '';
            passwordInput.focus();
            
            // Agregar animación de error
            passwordInput.style.borderColor = '#d32f2f';
            setTimeout(() => {
                passwordInput.style.borderColor = '#e0e0e0';
            }, 2000);
            
            // Si hay tiempo de bloqueo, mostrar información adicional
            if (result.lockoutTime) {
                setTimeout(() => {
                    mostrarError(\`🔒 Cuenta bloqueada por \${result.lockoutTime} minutos\`);
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Error en verificación de contraseña:', error);
        mostrarError("❌ Error de conexión. Intente nuevamente.");
        passwordInput.value = '';
        passwordInput.focus();
    } finally {
        passwordInput.disabled = false;
    }
}`;
        
        if (oldFunctionPattern.test(content)) {
            content = content.replace(oldFunctionPattern, newFunction);
            console.log(`🔒 Función verificarContrasena actualizada en ${asesorPath}/app.js`);
        }
        
        // Update admin password validation
        const adminPasswordPattern = /if \(password === ['"]gtadmin['"]\) \{[\s\S]*?\}/;
        const adminReplacement = `if (password !== null) {
        // Validar con sistema seguro
        validateAdminPasswordAndOpenPanel(password);
    }`;
        
        if (adminPasswordPattern.test(content)) {
            content = content.replace(adminPasswordPattern, adminReplacement);
            console.log(`🔒 Validación de admin actualizada en ${asesorPath}/app.js`);
        }
        
        // Add the admin validation function if not present
        if (!content.includes('validateAdminPasswordAndOpenPanel')) {
            const adminFunction = `
// Función para validar contraseña de administrador de forma segura
async function validateAdminPasswordAndOpenPanel(password) {
    try {
        const result = await window.secureValidateAdminPassword(password);
        
        if (result.success) {
            openAdminPanel();
        } else {
            alert(result.message || '❌ Contraseña de administrador incorrecta');
            
            // Si hay tiempo de bloqueo, mostrar información adicional
            if (result.lockoutTime) {
                alert(\`🔒 Acceso de administrador bloqueado por \${result.lockoutTime} minutos\`);
            }
        }
    } catch (error) {
        console.error('Error en validación de contraseña admin:', error);
        alert('❌ Error de conexión. Intente nuevamente.');
    }
}`;
            
            // Insert before the mostrarError function
            const insertPoint = content.indexOf('// Función para mostrar mensaje de error');
            if (insertPoint !== -1) {
                content = content.slice(0, insertPoint) + adminFunction + '\n\n' + content.slice(insertPoint);
                console.log(`🔒 Función admin validation añadida en ${asesorPath}/app.js`);
            }
        }
        
        fs.writeFileSync(appJsPath, content);
        console.log(`✅ ${asesorPath}/app.js actualizado completamente`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error actualizando ${appJsPath}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    let successCount = 0;
    let errorCount = 0;
    
    const basePath = path.resolve(__dirname, '../../');
    const baseAuthPath = path.join(basePath, 'Base/auth.js');
    
    // Check if Base/auth.js exists
    if (!fs.existsSync(baseAuthPath)) {
        console.error('❌ Base/auth.js no encontrado. Debe ejecutar este script desde el directorio raíz del proyecto.');
        process.exit(1);
    }
    
    console.log(`📋 Procesando ${ASESORES.length} asesores...\n`);
    
    for (const asesor of ASESORES) {
        console.log(`\n🔄 Procesando ${asesor}...`);
        
        const asesorPath = path.join(basePath, asesor);
        
        if (!fs.existsSync(asesorPath)) {
            console.log(`⚠️  Directorio ${asesor}/ no encontrado, saltando...`);
            errorCount++;
            continue;
        }
        
        let asesorSuccess = true;
        
        // Copy auth.js
        const targetAuthPath = path.join(asesorPath, 'auth.js');
        if (copyFileWithBackup(baseAuthPath, targetAuthPath)) {
            console.log(`✅ ${asesor}/auth.js actualizado`);
        } else {
            asesorSuccess = false;
        }
        
        // Update index.html
        if (!updateIndexHtml(asesorPath)) {
            asesorSuccess = false;
        }
        
        // Update app.js
        if (!updateAppJs(asesorPath)) {
            asesorSuccess = false;
        }
        
        if (asesorSuccess) {
            successCount++;
            console.log(`✅ ${asesor} actualizado completamente`);
        } else {
            errorCount++;
            console.log(`❌ ${asesor} tuvo errores en la actualización`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Resumen de actualización de seguridad:');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Con errores: ${errorCount}`);
    console.log(`📁 Total procesados: ${ASESORES.length}`);
    
    if (successCount > 0) {
        console.log('\n🎉 Actualización de seguridad completada!');
        console.log('🔒 Las contraseñas hardcodeadas han sido removidas');
        console.log('🔐 Sistema de autenticación segura implementado');
        console.log('⚡ Autenticación con rate limiting activada');
        console.log('\n💡 Recomendaciones:');
        console.log('  1. Reiniciar el servidor backend para aplicar cambios');
        console.log('  2. Verificar las nuevas credenciales en backend/config.env');
        console.log('  3. Probar el login en cada directorio de asesor');
    } else {
        console.log('\n⚠️  No se pudo actualizar ningún asesor completamente');
    }
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('\n❌ Error crítico:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('\n❌ Error no manejado:', error);
    process.exit(1);
});

// Run the script
main().catch(error => {
    console.error('\n❌ Error en main:', error);
    process.exit(1);
});