const { updateConfiguracion, testConnection } = require('../database');

// Datos de configuración base (del config.js actual)
const CONFIG_BASE = {
    base: 3000000,
    niveles: [
        "Capilla",
        "Junior", 
        "Senior A",
        "Senior B",
        "Máster",
        "Genio"
    ],
    iconos: [
        "🏠",
        "👤", 
        "⭐",
        "💎",
        "👑",
        "🏆"
    ],
    metas: {
        montoInterno: [
            500000000,
            700000000,
            900000000,
            1000000000,
            1100000000,
            1200000000
        ],
        montoExterno: [
            50000000,
            100000000,
            150000000,
            200000000,
            300000000,
            400000000
        ],
        montoRecuperado: [
            40000000,
            60000000,
            80000000,
            100000000,
            120000000,
            150000000
        ],
        cantidad: [
            6,
            7,
            9,
            10,
            12,
            13
        ]
    },
    pagos: {
        carrera: [
            0,
            0,
            500000,
            1000000,
            1500000,
            2000000
        ],
        montoInterno: [
            500000,
            600000,
            1000000,
            1400000,
            2000000,
            2500000
        ],
        montoExterno: [
            800000,
            1000000,
            1500000,
            2000000,
            2500000,
            3300000
        ],
        montoRecuperado: [
            300000,
            400000,
            500000,
            600000,
            800000,
            1000000
        ],
        cantidad: [
            0,
            400000,
            600000,
            700000,
            1000000,
            1200000
        ],
        equipo: [
            0,
            0,
            0,
            500000,
            800000,
            1000000
        ]
    },
    multiplicadores: {
        conversion: [
            {
                min: 15,
                mult: 1.1,
                text: "15%+"
            },
            {
                min: 11,
                mult: 1,
                text: "11%"
            },
            {
                min: 9,
                mult: 0.8,
                text: "9%"
            },
            {
                min: 7,
                mult: 0.7,
                text: "7%"
            },
            {
                min: 6,
                mult: 0.6,
                text: "6%"
            },
            {
                min: 5,
                mult: 0.5,
                text: "5%"
            },
            {
                min: 0,
                mult: 0.5,
                text: "<5%"
            }
        ],
        empatia: [
            {
                min: 96,
                mult: 1,
                text: "96%+"
            },
            {
                min: 90,
                mult: 0.9,
                text: "90%"
            },
            {
                min: 80,
                mult: 0.7,
                text: "80%"
            },
            {
                min: 70,
                mult: 0.5,
                text: "70%"
            },
            {
                min: 0,
                mult: 0.3,
                text: "<70%"
            }
        ],
        proceso: [
            {
                min: 95,
                mult: 1,
                text: "95%+"
            },
            {
                min: 90,
                mult: 0.95,
                text: "90%"
            },
            {
                min: 85,
                mult: 0.8,
                text: "85%"
            },
            {
                min: 70,
                mult: 0.5,
                text: "70%"
            },
            {
                min: 0,
                mult: 0.3,
                text: "<70%"
            }
        ],
        mora: [
            {
                min: 0,
                mult: 1.05,
                text: "0-2%"
            },
            {
                min: 3,
                mult: 1,
                text: "3-7%"
            },
            {
                min: 8,
                mult: 0.9,
                text: "8-9%"
            },
            {
                min: 10,
                mult: 0.8,
                text: "10-14%"
            },
            {
                min: 15,
                mult: 0.7,
                text: "15%+"
            }
        ]
    }
};

// Datos de asesores con sus categorías
const ASESORES_DATA = [
    { nombre: 'Alejandra', categoria: 'Agil' },
    { nombre: 'Aletzia', categoria: 'Agil' },
    { nombre: 'Erika', categoria: 'Agil_Recupero' },
    { nombre: 'Maximiliano', categoria: 'Empresarial' },
    { nombre: 'Micaela', categoria: 'Agil' },
    { nombre: 'Rodrigo', categoria: 'Empresarial' },
    { nombre: 'Base', categoria: 'Template' }
];

// Función para insertar datos de prueba
async function insertarDatosPrueba() {
    try {
        console.log('🌱 Insertando datos de prueba...');
        console.log('='.repeat(50));
        
        // Verificar conexión a la base de datos
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            return;
        }
        
        let exitosos = 0;
        let fallidos = 0;
        
        // Insertar cada asesor
        for (const asesor of ASESORES_DATA) {
            try {
                console.log(`📝 Insertando ${asesor.nombre} (${asesor.categoria})...`);
                
                // Usar la misma configuración base para todos (puedes personalizar después)
                const resultado = await updateConfiguracion(
                    asesor.nombre, 
                    asesor.categoria, 
                    CONFIG_BASE
                );
                
                console.log(`✅ ${asesor.nombre} insertado exitosamente`);
                exitosos++;
                
            } catch (error) {
                console.error(`❌ Error insertando ${asesor.nombre}:`, error.message);
                fallidos++;
            }
        }
        
        console.log('='.repeat(50));
        console.log('📊 Resumen de inserción:');
        console.log(`✅ Exitosos: ${exitosos}`);
        console.log(`❌ Fallidos: ${fallidos}`);
        console.log(`📁 Total procesados: ${ASESORES_DATA.length}`);
        
        if (exitosos > 0) {
            console.log('🎉 Datos de prueba insertados exitosamente');
            console.log('');
            console.log('💡 Ahora puedes:');
            console.log('  1. Probar la API: GET http://localhost:3000/api/asesores');
            console.log('  2. Obtener configuración: GET http://localhost:3000/api/config/Alejandra');
            console.log('  3. Personalizar configuraciones según cada asesor');
        } else {
            console.log('⚠️  No se pudo insertar ningún asesor');
        }
        
    } catch (error) {
        console.error('❌ Error insertando datos de prueba:', error.message);
    }
}

// Función para crear configuración personalizada
async function crearConfiguracionPersonalizada(nombreAsesor, categoria, configPersonalizada) {
    try {
        console.log(`🎨 Creando configuración personalizada para ${nombreAsesor}...`);
        
        const resultado = await updateConfiguracion(nombreAsesor, categoria, configPersonalizada);
        
        console.log(`✅ Configuración personalizada creada para ${nombreAsesor}`);
        return resultado;
        
    } catch (error) {
        console.error(`❌ Error creando configuración personalizada para ${nombreAsesor}:`, error.message);
        return null;
    }
}

// Ejemplo de configuración personalizada para Erika (Agil_Recupero)
const CONFIG_ERIKA = {
    ...CONFIG_BASE,
    // Personalizar metas para Recupero
    metas: {
        ...CONFIG_BASE.metas,
        montoRecuperado: [
            60000000,  // Aumentar metas de recupero
            80000000,
            100000000,
            120000000,
            140000000,
            180000000
        ]
    },
    // Personalizar pagos para Recupero
    pagos: {
        ...CONFIG_BASE.pagos,
        montoRecuperado: [
            400000,    // Aumentar pagos por recupero
            500000,
            600000,
            700000,
            900000,
            1200000
        ]
    }
};

// Manejo de argumentos de línea de comandos
const comando = process.argv[2];

switch (comando) {
    case 'seed':
        insertarDatosPrueba();
        break;
    case 'erika':
        crearConfiguracionPersonalizada('Erika', 'Agil_Recupero', CONFIG_ERIKA);
        break;
    default:
        console.log('🌱 Script de datos de prueba');
        console.log('');
        console.log('Uso:');
        console.log('  node seed.js seed  - Insertar datos de prueba básicos');
        console.log('  node seed.js erika - Crear configuración personalizada para Erika');
        console.log('');
        console.log('Ejemplo:');
        console.log('  node seed.js seed');
} 