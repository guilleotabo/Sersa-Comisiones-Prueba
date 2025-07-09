// Configuración de Supabase
const SUPABASE_URL = 'https://eojszhsljnmrrtjjhody.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvanN6aHNsam5tcnJ0ampob2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjA5NDAsImV4cCI6MjA2NzU5Njk0MH0.voN4vFl1PRAjv6fV3zdu_UAmXpa35Az7pYUUYlHqnPI';

// Inicializar cliente Supabase
let supabase;

// Función para inicializar Supabase
function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado correctamente');
        return true;
    } else {
        console.error('❌ Supabase no está disponible');
        return false;
    }
}

// Función para obtener contraseña de un asesor
async function obtenerPasswordAsesor(nombreAsesor) {
    try {
        const { data, error } = await supabase
            .from('contraseñas')
            .select('password')
            .eq('asesor', nombreAsesor)
            .single();

        if (error) {
            console.warn(`⚠️ Error obteniendo contraseña para ${nombreAsesor}:`, error);
            return null;
        }

        console.log(`✅ Contraseña obtenida para ${nombreAsesor}`);
        return data.password;
    } catch (error) {
        console.error('❌ Error en obtenerPasswordAsesor:', error);
        return null;
    }
}

// Función para obtener configuración de un asesor
async function obtenerConfigAsesor(nombreAsesor) {
    try {
        const { data, error } = await supabase
            .from('configuraciones')
            .select('config')
            .eq('asesor', nombreAsesor)
            .single();

        if (error) {
            console.warn(`⚠️ Error obteniendo configuración para ${nombreAsesor}:`, error);
            return null;
        }

        console.log(`✅ Configuración obtenida para ${nombreAsesor}`);
        return data.config;
    } catch (error) {
        console.error('❌ Error en obtenerConfigAsesor:', error);
        return null;
    }
}

// Función para obtener todos los asesores
async function obtenerTodosAsesores() {
    try {
        const { data, error } = await supabase
            .from('asesores')
            .select('*')
            .order('nombre');

        if (error) {
            console.warn('⚠️ Error obteniendo asesores:', error);
            return [];
        }

        console.log(`✅ ${data.length} asesores obtenidos`);
        return data;
    } catch (error) {
        console.error('❌ Error en obtenerTodosAsesores:', error);
        return [];
    }
}

// Función para actualizar contraseña de un asesor
async function actualizarPasswordAsesor(nombreAsesor, nuevaPassword) {
    try {
        const { data, error } = await supabase
            .from('contraseñas')
            .update({ password: nuevaPassword })
            .eq('asesor', nombreAsesor);

        if (error) {
            console.error(`❌ Error actualizando contraseña para ${nombreAsesor}:`, error);
            return false;
        }

        console.log(`✅ Contraseña actualizada para ${nombreAsesor}`);
        return true;
    } catch (error) {
        console.error('❌ Error en actualizarPasswordAsesor:', error);
        return false;
    }
}

// Función para actualizar configuración de un asesor
async function actualizarConfigAsesor(nombreAsesor, nuevaConfig) {
    try {
        const { data, error } = await supabase
            .from('configuraciones')
            .update({ config: nuevaConfig })
            .eq('asesor', nombreAsesor);

        if (error) {
            console.error(`❌ Error actualizando configuración para ${nombreAsesor}:`, error);
            return false;
        }

        console.log(`✅ Configuración actualizada para ${nombreAsesor}`);
        return true;
    } catch (error) {
        console.error('❌ Error en actualizarConfigAsesor:', error);
        return false;
    }
}

// Función para agregar nuevo asesor
async function agregarNuevoAsesor(nombre, email, password, configuracion) {
    try {
        // Agregar a tabla asesores
        const { data: asesorData, error: asesorError } = await supabase
            .from('asesores')
            .insert([{ nombre, email, activo: true }]);

        if (asesorError) {
            console.error('❌ Error agregando asesor:', asesorError);
            return false;
        }

        // Agregar contraseña
        const { data: passwordData, error: passwordError } = await supabase
            .from('contraseñas')
            .insert([{ asesor: nombre, password }]);

        if (passwordError) {
            console.error('❌ Error agregando contraseña:', passwordError);
            return false;
        }

        // Agregar configuración
        const { data: configData, error: configError } = await supabase
            .from('configuraciones')
            .insert([{ asesor: nombre, config: configuracion }]);

        if (configError) {
            console.error('❌ Error agregando configuración:', configError);
            return false;
        }

        console.log(`✅ Nuevo asesor ${nombre} agregado exitosamente`);
        return true;
    } catch (error) {
        console.error('❌ Error en agregarNuevoAsesor:', error);
        return false;
    }
}

// Función para eliminar asesor
async function eliminarAsesor(nombreAsesor) {
    try {
        // Eliminar de todas las tablas
        const promises = [
            supabase.from('asesores').delete().eq('nombre', nombreAsesor),
            supabase.from('contraseñas').delete().eq('asesor', nombreAsesor),
            supabase.from('configuraciones').delete().eq('asesor', nombreAsesor)
        ];

        const results = await Promise.all(promises);
        
        for (let result of results) {
            if (result.error) {
                console.error('❌ Error eliminando asesor:', result.error);
                return false;
            }
        }

        console.log(`✅ Asesor ${nombreAsesor} eliminado exitosamente`);
        return true;
    } catch (error) {
        console.error('❌ Error en eliminarAsesor:', error);
        return false;
    }
}

// Función para verificar conexión a Supabase
async function verificarConexionSupabase() {
    try {
        const { data, error } = await supabase
            .from('asesores')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Error verificando conexión:', error);
            return false;
        }

        console.log('✅ Conexión a Supabase verificada');
        return true;
    } catch (error) {
        console.error('❌ Error en verificarConexionSupabase:', error);
        return false;
    }
}

// Inicializar automáticamente cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
}); 