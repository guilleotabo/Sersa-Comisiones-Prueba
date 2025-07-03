const fs = require('fs');
const path = require('path');

// Lista de carpetas de asesores
const asesores = ['Alejandra', 'Aletzia', 'Erika', 'Maximiliano', 'Micaela', 'Rodrigo'];

// Ruta del archivo app.js modificado (Base)
const sourceFile = path.join(__dirname, '../../Base/app.js');

// Verificar que el archivo fuente existe
if (!fs.existsSync(sourceFile)) {
    console.error('❌ Error: No se encontró el archivo Base/app.js');
    process.exit(1);
}

console.log('🚀 Iniciando copia de app.js a todas las carpetas de asesores...\n');

let successCount = 0;
let errorCount = 0;

asesores.forEach(asesor => {
    const targetFile = path.join(__dirname, `../../${asesor}/app.js`);
    const targetDir = path.dirname(targetFile);
    
    try {
        // Verificar que la carpeta del asesor existe
        if (!fs.existsSync(targetDir)) {
            console.log(`⚠️  Carpeta ${asesor}/ no encontrada, saltando...`);
            return;
        }
        
        // Crear backup del archivo original si existe
        if (fs.existsSync(targetFile)) {
            const backupFile = `${targetFile}.backup.${Date.now()}`;
            fs.copyFileSync(targetFile, backupFile);
            console.log(`📁 Backup creado: ${asesor}/app.js.backup.${Date.now()}`);
        }
        
        // Copiar el archivo
        fs.copyFileSync(sourceFile, targetFile);
        console.log(`✅ ${asesor}/app.js actualizado correctamente`);
        successCount++;
        
    } catch (error) {
        console.error(`❌ Error copiando a ${asesor}/:`, error.message);
        errorCount++;
    }
});

console.log('\n📊 Resumen:');
console.log(`✅ Archivos actualizados: ${successCount}`);
console.log(`❌ Errores: ${errorCount}`);
console.log(`📁 Total de asesores procesados: ${asesores.length}`);

if (errorCount === 0) {
    console.log('\n🎉 ¡Todos los archivos app.js han sido actualizados exitosamente!');
    console.log('💡 Los archivos originales se han respaldado con extensión .backup');
} else {
    console.log('\n⚠️  Algunos archivos no pudieron ser actualizados. Revisa los errores arriba.');
} 