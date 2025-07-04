/* ========================================
   API Y CONFIGURACIÓN - SISTEMA COMISIONES
   Manejo de comunicación con el backend y configuración
   ======================================== */

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
let cachedConfig = null;
let configLoaded = false;

/**
 * Obtiene la configuración desde la API o fallback local
 * @returns {Promise<Object>} Configuración del sistema
 */
async function getConfig() {
    // Si ya tenemos la configuración en caché, retornarla
    if (cachedConfig && configLoaded) {
        return cachedConfig;
    }

    try {
        // Obtener nombre del asesor desde la URL
        const asesorName = getAsesorName();
        
        // Intentar cargar desde la API
        const response = await fetch(`${API_BASE_URL}/config/${asesorName}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                cachedConfig = data.data.config_data;
                configLoaded = true;
                console.log(`✅ Configuración cargada desde API para ${asesorName}`);
                return cachedConfig;
            }
        }
        
        // Si la API falla, usar fallback
        console.warn(`⚠️ API no disponible, usando configuración local para ${asesorName}`);
        return getConfigFallback();
        
    } catch (error) {
        console.error('❌ Error cargando configuración desde API:', error);
        return getConfigFallback();
    }
}

/**
 * Función de fallback para cargar configuración local
 * @returns {Object} Configuración desde localStorage o CONFIG por defecto
 */
function getConfigFallback() {
    const savedConfig = localStorage.getItem('comisionesConfig');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            console.log('📁 Usando configuración desde localStorage');
            return parsed;
        } catch (e) {
            console.error('❌ Error parseando localStorage:', e);
        }
    }
    
    console.log('📁 Usando configuración por defecto (config.js)');
    return CONFIG;
}

/**
 * Guarda la configuración en la API
 * @param {Object} configData - Configuración a guardar
 * @returns {Promise<boolean>} True si se guardó exitosamente
 */
async function saveConfigToAPI(configData) {
    try {
        const asesorName = getAsesorName();
        const response = await fetch(`${API_BASE_URL}/config/${asesorName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoria: getAsesorCategoria(asesorName),
                config_data: configData
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log('✅ Configuración guardada en API exitosamente');
                cachedConfig = configData;
                return true;
            }
        }
        
        console.error('❌ Error guardando en API:', response.statusText);
        return false;
        
    } catch (error) {
        console.error('❌ Error de conexión al guardar en API:', error);
        return false;
    }
}

/**
 * Obtiene la categoría del asesor basada en su nombre
 * @param {string} nombreAsesor - Nombre del asesor
 * @returns {string} Categoría del asesor
 */
function getAsesorCategoria(nombreAsesor) {
    const categorias = {
        'Base': 'Template',
        'Alejandra': 'Agil',
        'Aletzia': 'Agil',
        'Erika': 'Agil_Recupero',
        'Maximiliano': 'Empresarial',
        'Micaela': 'Agil',
        'Rodrigo': 'Empresarial'
    };
    return categorias[nombreAsesor] || 'Sin_Categoria';
}

/**
 * Obtiene el nombre del asesor desde la URL
 * @returns {string} Nombre del asesor
 */
function getAsesorName() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+)\/?$/);
    return match ? match[1] : 'Base';
}

/**
 * Inicializa el sistema cargando la configuración
 * @returns {Promise<void>}
 */
async function inicializarSistema() {
    try {
        // Cargar configuración
        const config = await getConfig();
        
        // Configurar variables globales
        window.systemConfig = config;
        
        // Mostrar mensaje de bienvenida
        mostrarMensajeBienvenida();
        
        // Mostrar el sistema principal
        mostrarSistema();
        
        console.log('✅ Sistema inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando sistema:', error);
        mostrarError('Error al cargar el sistema. Por favor, recarga la página.');
    }
}

/**
 * Muestra mensaje de bienvenida personalizado
 */
function mostrarMensajeBienvenida() {
    const asesorName = getAsesorName();
    const asesorDisplay = asesorName === 'Base' ? 'Sistema Base' : asesorName;
    
    console.log(`🎉 ¡Bienvenido/a al Sistema de Comisiones de ${asesorDisplay}!`);
    
    // Actualizar elementos de la interfaz
    const statAsesor = document.getElementById('statAsesor');
    if (statAsesor) {
        statAsesor.textContent = asesorDisplay;
    }
}

// Exportar funciones para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getConfig,
        saveConfigToAPI,
        getAsesorCategoria,
        getAsesorName,
        inicializarSistema
    };
}