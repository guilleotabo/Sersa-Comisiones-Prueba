const { getConfiguracion, getAllAsesores, testConnection } = require('../database');

// Función para verificar estructura de configuración
function verificarEstructuraConfig(configData) {
    const camposRequeridos = [
        'base', 'niveles', 'iconos', 'metas', 'pagos', 'multiplicadores'
    ];
    
    const camposMetas = ['montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad'];
    const camposPagos = ['carrera', 'montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad', 'equipo'];
    const camposMultiplicadores = ['conversion', 'empatia', 'proceso', 'mora'];
    
    const errores = [];
    
    // Verificar campos principales
    for (const campo of camposRequeridos) {
        if (!configData[campo]) {
            errores.push(`Campo requerido faltante: ${campo}`);
        }
    }
    
    // Verificar estructura de metas
    if (configData.metas) {
        for (const campo of camposMetas) {
            if (!Array.isArray(configData.metas[campo])) {
                errores.push(`Metas.${campo} debe ser un array`);
            } else if (configData.metas[campo].length !== 6) {
                errores.push(`Metas.${campo} debe tener 6 elementos (niveles)`);
            }
        }
    }
    
    // Verificar estructura de pagos
    if (configData.pagos) {
        for (const campo of camposPagos) {
            if (!Array.isArray(configData.pagos[campo])) {
                errores.push(`Pagos.${campo} debe ser un array`);
            } else if (configData.pagos[campo].length !== 6) {
                errores.push(`Pagos.${campo} debe tener 6 elementos (niveles)`);
            }
        }
    }
    
    // Verificar estructura de multiplicadores
    if (configData.multiplicadores) {
        for (const campo of camposMultiplicadores) {
            if (!Array.isArray(configData.multiplicadores[campo])) {
                errores.push(`Multiplicadores.${campo} debe ser un array`);
            } else {
                // Verificar estructura de cada multiplicador
                for (const mult of configData.multiplicadores[campo]) {
                    if (!mult.min || !mult.mult || !mult.text) {
                        errores.push(`Multiplicador ${campo} debe tener min, mult y text`);
                    }
                }
            }
        }
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

// Función para verificar configuración específica
async function verificarConfiguracionAsesor(nombreAsesor) {
    try {
        console.log(`🔍 Verificando configuración de ${nombreAsesor}...`);
        
        const configuracion = await getConfiguracion(nombreAsesor);
        
        if (!configuracion) {
            console.log(`❌ No se encontró configuración para ${nombreAsesor}`);
            return false;
        }
        
        console.log(`  📊 Categoría: ${configuracion.categoria}`);
        console.log(`  📅 Creado: ${configuracion.created_at}`);
        console.log(`  🔄 Actualizado: ${configuracion.updated_at}`);
        
        // Verificar estructura de datos
        const validacion = verificarEstructuraConfig(configuracion.config_data);
        
        if (validacion.valido) {
            console.log(`  ✅ Estructura de datos válida`);
            
            // Mostrar algunos valores de ejemplo
            const config = configuracion.config_data;
            console.log(`  💰 Base: ${config.base?.toLocaleString() || 'N/A'}`);
            console.log(`  📈 Niveles: ${config.niveles?.join(', ') || 'N/A'}`);
            console.log(`  🎯 Meta Interno (Nivel 5): ${config.metas?.montoInterno?.[5]?.toLocaleString() || 'N/A'}`);
            console.log(`  💸 Pago Interno (Nivel 5): ${config.pagos?.montoInterno?.[5]?.toLocaleString() || 'N/A'}`);
            
            return true;
        } else {
            console.log(`  ❌ Errores en estructura:`);
            validacion.errores.forEach(error => {
                console.log(`    - ${error}`);
            });
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error verificando ${nombreAsesor}:`, error.message);
        return false;
    }
}

// Función para verificar todas las configuraciones
async function verificarTodasLasConfiguraciones() {
    try {
        console.log('🔍 Verificando todas las configuraciones...');
        console.log('='.repeat(60));
        
        // Verificar conexión a la base de datos
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            return;
        }
        
        // Obtener todos los asesores
        const asesores = await getAllAsesores();
        
        if (asesores.length === 0) {
            console.log('⚠️  No se encontraron configuraciones en la base de datos');
            console.log('💡 Ejecuta primero: node seed.js seed');
            return;
        }
        
        console.log(`📊 Total de asesores encontrados: ${asesores.length}`);
        console.log('');
        
        let validos = 0;
        let invalidos = 0;
        
        // Verificar cada asesor
        for (const asesor of asesores) {
            const esValido = await verificarConfiguracionAsesor(asesor.nombre_asesor);
            console.log('');
            
            if (esValido) {
                validos++;
            } else {
                invalidos++;
            }
        }
        
        console.log('='.repeat(60));
        console.log('📊 Resumen de verificación:');
        console.log(`✅ Válidos: ${validos}`);
        console.log(`❌ Inválidos: ${invalidos}`);
        console.log(`📁 Total verificados: ${asesores.length}`);
        
        if (invalidos === 0) {
            console.log('🎉 Todas las configuraciones son válidas');
        } else {
            console.log('⚠️  Algunas configuraciones tienen errores');
        }
        
        // Mostrar estadísticas por categoría
        console.log('');
        console.log('📈 Estadísticas por categoría:');
        const categorias = {};
        asesores.forEach(asesor => {
            if (!categorias[asesor.categoria]) {
                categorias[asesor.categoria] = 0;
            }
            categorias[asesor.categoria]++;
        });
        
        Object.entries(categorias).forEach(([categoria, count]) => {
            console.log(`  ${categoria}: ${count} asesor(es)`);
        });
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error.message);
    }
}

// Función para comparar configuraciones
async function compararConfiguraciones(asesor1, asesor2) {
    try {
        console.log(`🔄 Comparando configuraciones: ${asesor1} vs ${asesor2}`);
        console.log('='.repeat(50));
        
        const config1 = await getConfiguracion(asesor1);
        const config2 = await getConfiguracion(asesor2);
        
        if (!config1 || !config2) {
            console.log('❌ No se pudieron obtener ambas configuraciones');
            return;
        }
        
        const data1 = config1.config_data;
        const data2 = config2.config_data;
        
        // Comparar campos principales
        const campos = ['base', 'niveles', 'iconos'];
        
        console.log('📊 Comparación de campos principales:');
        for (const campo of campos) {
            if (JSON.stringify(data1[campo]) === JSON.stringify(data2[campo])) {
                console.log(`  ✅ ${campo}: Igual`);
            } else {
                console.log(`  ❌ ${campo}: Diferente`);
                console.log(`     ${asesor1}: ${JSON.stringify(data1[campo])}`);
                console.log(`     ${asesor2}: ${JSON.stringify(data2[campo])}`);
            }
        }
        
        // Comparar metas
        console.log('');
        console.log('🎯 Comparación de metas:');
        const tiposMetas = ['montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad'];
        
        for (const tipo of tiposMetas) {
            const igual = JSON.stringify(data1.metas[tipo]) === JSON.stringify(data2.metas[tipo]);
            console.log(`  ${igual ? '✅' : '❌'} ${tipo}: ${igual ? 'Igual' : 'Diferente'}`);
        }
        
    } catch (error) {
        console.error('❌ Error comparando configuraciones:', error.message);
    }
}

// Manejo de argumentos de línea de comandos
const comando = process.argv[2];
const parametro1 = process.argv[3];
const parametro2 = process.argv[4];

switch (comando) {
    case 'all':
        verificarTodasLasConfiguraciones();
        break;
    case 'asesor':
        if (parametro1) {
            verificarConfiguracionAsesor(parametro1);
        } else {
            console.log('❌ Debes especificar el nombre del asesor');
            console.log('Ejemplo: node verify.js asesor Alejandra');
        }
        break;
    case 'compare':
        if (parametro1 && parametro2) {
            compararConfiguraciones(parametro1, parametro2);
        } else {
            console.log('❌ Debes especificar dos nombres de asesores');
            console.log('Ejemplo: node verify.js compare Alejandra Erika');
        }
        break;
    default:
        console.log('🔍 Script de verificación de configuraciones');
        console.log('');
        console.log('Uso:');
        console.log('  node verify.js all                    - Verificar todas las configuraciones');
        console.log('  node verify.js asesor <nombre>        - Verificar configuración específica');
        console.log('  node verify.js compare <asesor1> <asesor2> - Comparar dos configuraciones');
        console.log('');
        console.log('Ejemplos:');
        console.log('  node verify.js all');
        console.log('  node verify.js asesor Alejandra');
        console.log('  node verify.js compare Alejandra Erika');
} 