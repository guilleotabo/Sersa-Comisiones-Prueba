// CONFIGURACIÓN DE SUPABASE - SIMPLE Y DIRECTO
const SUPABASE_URL = 'https://eojszhsljnmrrtjjhody.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvanN6aHNsam5tcnJ0ampob2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjA5NDAsImV4cCI6MjA2NzU5Njk0MH0.voN4vFl1PRAjv6fV3zdu_UAmXpa35Az7pYUUYlHqnPI';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let asesorActual = null;
let asesorActualId = null;
let configuracionActual = null;
let isCalculating = false;

// Configuración por defecto del sistema (como respaldo)
const CONFIG_DEFAULT = {
    base: 3000000,
    niveles: ["Capilla", "Junior", "Senior A", "Senior B", "Máster", "Genio"],
    iconos: ["⛪", "🌱", "💼", "🌟", "👑", "🏆"],
    metas: {
        montoInterno: [700000000, 800000000, 900000000, 1000000000, 1100000000, 1200000000],
        montoExterno: [80000000, 100000000, 120000000, 140000000, 160000000, 180000000],
        montoRecuperado: [0, 30000000, 60000000, 90000000, 120000000, 150000000],
        cantidad: [6, 7, 8, 9, 10, 11]
    },
    pagos: {
        carrera: [0, 0, 1000000, 1500000, 2000000, 2500000],
        montoInterno: [1000000, 1500000, 2000000, 2500000, 3000000, 3500000],
        montoExterno: [500000, 600000, 700000, 800000, 900000, 1000000],
        montoRecuperado: [0, 300000, 400000, 500000, 600000, 700000],
        cantidad: [500000, 700000, 900000, 1100000, 1300000, 1500000],
        equipo: [0, 0, 500000, 600000, 700000, 800000]
    },
    multiplicadores: {
        conversion: [
            {min: 15, mult: 1.1, text: "15%+"},
            {min: 11, mult: 1, text: "11%"},
            {min: 9, mult: 0.8, text: "9%"},
            {min: 7, mult: 0.7, text: "7%"},
            {min: 6, mult: 0.6, text: "6%"},
            {min: 5, mult: 0.5, text: "5%"},
            {min: 0, mult: 0.5, text: "<5%"}
        ],
        empatia: [
            {min: 96, mult: 1, text: "96%+"},
            {min: 90, mult: 0.9, text: "90%"},
            {min: 80, mult: 0.7, text: "80%"},
            {min: 70, mult: 0.5, text: "70%"},
            {min: 0, mult: 0.3, text: "<70%"}
        ],
        proceso: [
            {min: 95, mult: 1, text: "95%+"},
            {min: 90, mult: 0.95, text: "90%"},
            {min: 85, mult: 0.8, text: "85%"},
            {min: 70, mult: 0.5, text: "70%"},
            {min: 0, mult: 0.3, text: "<70%"}
        ],
        mora: [
            {min: 0, mult: 1.05, text: "0-2%"},
            {min: 3, mult: 1, text: "3-7%"},
            {min: 8, mult: 0.9, text: "8-9%"},
            {min: 10, mult: 0.8, text: "10-14%"},
            {min: 15, mult: 0.7, text: "15%+"}
        ]
    },
    nombres_bonos: {
        interno: "📊 MONTO INTERNO - Meta desembolso | Bono",
        externo: "💎 MONTO EXTERNO/REFERENCIADO - Meta | Bono",
        cantidad: "🎯 CANTIDAD DESEMBOLSOS - Meta | Bono | Llave",
        recuperados: "🔄 RECUPERADOS +3 MESES - Meta | Bono",
        carrera: "📈 BONO CARRERA - Según menor nivel entre mes actual y anterior",
        equipo: "👥 BONO EQUIPO - Según menor nivel del equipo"
    }
};

// Cargar asesores al iniciar
window.addEventListener('DOMContentLoaded', async function() {
    await cargarAsesores();
    
    // Agregar evento para cambio dinámico de placeholder
    const asesorSelect = document.getElementById('asesor-select');
    const passwordInput = document.getElementById('password-input');
    
    asesorSelect.addEventListener('change', function() {
        const asesorSeleccionado = this.value;
        if (asesorSeleccionado) {
            passwordInput.placeholder = `Contraseña para ${asesorSeleccionado}`;
            passwordInput.disabled = false;
        } else {
            passwordInput.placeholder = 'Primero selecciona un asesor';
            passwordInput.disabled = true;
            passwordInput.value = '';
        }
        // Limpiar errores
        document.getElementById('login-error').style.display = 'none';
    });
    
    // Permitir Enter para hacer login
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verificarContrasena();
        }
    });
});

// FUNCIÓN 1: Cargar lista de usuarios (asesores + admins)
async function cargarAsesores() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('nombre, rol')
            .eq('activo', true)
            .in('rol', ['asesor', 'admin'])
            .order('rol', { ascending: false }) // Admin primero
            .order('nombre');

        if (error) throw error;

        const select = document.getElementById('asesor-select');
        select.innerHTML = '<option value="">-- Selecciona usuario --</option>';
        
        data.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.nombre;
            option.textContent = usuario.rol === 'admin' ? 
                `🛠️ ${usuario.nombre} (Admin)` : 
                `👤 ${usuario.nombre}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        mostrarError('Error cargando usuarios. Intenta recargar la página.');
    }
}

// FUNCIÓN 2: Verificar contraseña (unificado para asesores y admins)
async function verificarContrasena() {
    const usuario = document.getElementById('asesor-select').value;
    const password = document.getElementById('password-input').value;
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    
    if (!usuario) {
        mostrarError('Por favor selecciona un usuario');
        return;
    }
    
    if (!password) {
        mostrarError('Por favor ingresa tu contraseña');
        return;
    }
    
    // Mostrar estado de carga
    loginBtn.innerHTML = '<span class="btn-text">Verificando...</span><span class="btn-icon">⏳</span>';
    loginBtn.disabled = true;
    
    try {
        // Verificar usuario y contraseña directamente en tabla users
        const { data, error } = await supabase
            .from('users')
            .select('id, password_hash, rol')
            .eq('nombre', usuario)
            .eq('activo', true)
            .in('rol', ['asesor', 'admin'])
            .single();
        
        if (error) throw error;
        
        if (data.password_hash === password) {
            mostrarExito(`¡Bienvenido ${usuario}!`);
            asesorActual = usuario;
            asesorActualId = data.id;
            
            // Redirigir según el rol
            if (data.rol === 'admin') {
                // Pequeña pausa para mostrar el mensaje de éxito
                setTimeout(() => {
                    window.location.href = 'admin.html#admin-authenticated';
                }, 1000);
            } else {
                // Cargar configuración para asesores
                await cargarConfiguracion(data.id);
                
                // Pequeña pausa para mostrar el mensaje de éxito
                setTimeout(() => {
                    mostrarSistema();
                }, 1000);
            }
        } else {
            mostrarError('Contraseña incorrecta');
        }
    } catch (error) {
        console.error('Error verificando contraseña:', error);
        mostrarError('Error al verificar contraseña. Verifica tu conexión.');
    } finally {
        // Restaurar botón
        setTimeout(() => {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }, 1000);
    }
}

// FUNCIÓN 3: Cargar configuración del asesor
async function cargarConfiguracion(userId = null) {
    try {
        // Si hay userId, intentar cargar configuración específica del usuario
        if (userId) {
            const { data: configUsuario, error: errorUsuario } = await supabase
                .from('settings')
                .select('config')
                .eq('tipo', 'user_specific')
                .eq('user_id', userId)
                .eq('activo', true)
                .single();
            
            if (configUsuario && configUsuario.config) {
                configuracionActual = configUsuario.config;
                aplicarConfiguracion();
                return;
            }
        }
        
        // Si no hay config específica, usar configuración global
        const { data: configGlobal, error: errorGlobal } = await supabase
            .from('settings')
            .select('config')
            .eq('tipo', 'global')
            .is('user_id', null)
            .eq('activo', true)
            .single();
        
        if (configGlobal && configGlobal.config) {
            configuracionActual = configGlobal.config;
        } else {
            // Usar configuración por defecto
            configuracionActual = CONFIG_DEFAULT;
        }
        
        // Aplicar configuración a la interfaz
        aplicarConfiguracion();
        
    } catch (error) {
        console.error('Error cargando configuración:', error);
        configuracionActual = CONFIG_DEFAULT;
        aplicarConfiguracion();
    }
}

// FUNCIÓN 4: Mostrar sistema principal
function mostrarSistema() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    document.getElementById('nombre-asesor').textContent = asesorActual;
    
    // Aplicar configuración
    aplicarConfiguracion();
}

// FUNCIÓN 5: Cerrar sesión
function cerrarSesion() {
    asesorActual = null;
    asesorActualId = null;
    configuracionActual = null;
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('password-input').value = '';
    limpiarTodo();
}

// FUNCIÓN 6: Mostrar errores
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
    
    // Agregar efecto de shake al contenedor
    const loginContainer = document.querySelector('.login-container');
    loginContainer.style.animation = 'shake 0.5s ease';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
        loginContainer.style.animation = '';
    }, 4000);
}

// FUNCIÓN 6.1: Mostrar éxito
function mostrarExito(mensaje) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#27ae60';
    errorDiv.style.background = 'rgba(39, 174, 96, 0.1)';
    errorDiv.style.borderColor = 'rgba(39, 174, 96, 0.2)';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.background = 'rgba(231, 76, 60, 0.1)';
        errorDiv.style.borderColor = 'rgba(231, 76, 60, 0.2)';
    }, 2000);
}

// FUNCIÓN 7: Obtener configuración base (por defecto)
function getConfiguracionBase() {
    return {
        base: 3000000,
        niveles: ["Capilla", "Junior", "Senior A", "Senior B", "Máster", "Genio"],
        metas: {
            montoInterno: [500000000, 700000000, 900000000, 1000000000, 1100000000, 1200000000],
            montoExterno: [50000000, 100000000, 150000000, 200000000, 300000000, 400000000],
            montoRecuperado: [40000000, 60000000, 80000000, 100000000, 120000000, 150000000],
            cantidad: [6, 7, 9, 10, 12, 13]
        },
        pagos: {
            carrera: [0, 0, 500000, 1000000, 1500000, 2000000],
            montoInterno: [500000, 600000, 1000000, 1400000, 2000000, 2500000],
            montoExterno: [800000, 1000000, 1500000, 2000000, 2500000, 3300000],
            montoRecuperado: [300000, 400000, 500000, 600000, 800000, 1000000],
            cantidad: [0, 400000, 600000, 700000, 1000000, 1200000],
            equipo: [0, 0, 0, 500000, 800000, 1000000]
        },
        multiplicadores: {
            conversion: [
                {min: 15, mult: 1.1, text: "15%+"},
                {min: 11, mult: 1, text: "11%"},
                {min: 9, mult: 0.8, text: "9%"},
                {min: 7, mult: 0.7, text: "7%"},
                {min: 6, mult: 0.6, text: "6%"},
                {min: 5, mult: 0.5, text: "5%"},
                {min: 0, mult: 0.5, text: "<5%"}
            ],
            empatia: [
                {min: 96, mult: 1, text: "96%+"},
                {min: 90, mult: 0.9, text: "90%"},
                {min: 80, mult: 0.7, text: "80%"},
                {min: 70, mult: 0.5, text: "70%"},
                {min: 0, mult: 0.3, text: "<70%"}
            ],
            proceso: [
                {min: 95, mult: 1, text: "95%+"},
                {min: 90, mult: 0.95, text: "90%"},
                {min: 85, mult: 0.8, text: "85%"},
                {min: 70, mult: 0.5, text: "70%"},
                {min: 0, mult: 0.3, text: "<70%"}
            ],
            mora: [
                {min: 0, mult: 1.05, text: "0-2%"},
                {min: 3, mult: 1, text: "3-7%"},
                {min: 8, mult: 0.9, text: "8-9%"},
                {min: 10, mult: 0.8, text: "10-14%"},
                {min: 15, mult: 0.7, text: "15%+"}
            ]
        }
    };
}

// FUNCIÓN 8: Aplicar configuración (actualizar selectores, etc.)
function aplicarConfiguracion() {
    const config = configuracionActual;
    
    // Actualizar nombres de bonos si existen
    if (config.nombres_bonos) {
        document.getElementById('titulo-bono-interno').textContent = config.nombres_bonos.interno || CONFIG_DEFAULT.nombres_bonos.interno;
        document.getElementById('titulo-bono-externo').textContent = config.nombres_bonos.externo || CONFIG_DEFAULT.nombres_bonos.externo;
        document.getElementById('titulo-bono-cantidad').textContent = config.nombres_bonos.cantidad || CONFIG_DEFAULT.nombres_bonos.cantidad;
        document.getElementById('titulo-bono-recuperados').textContent = config.nombres_bonos.recuperados || CONFIG_DEFAULT.nombres_bonos.recuperados;
        document.getElementById('titulo-bono-carrera').textContent = config.nombres_bonos.carrera || CONFIG_DEFAULT.nombres_bonos.carrera;
        document.getElementById('titulo-bono-equipo').textContent = config.nombres_bonos.equipo || CONFIG_DEFAULT.nombres_bonos.equipo;
    }
    
    // Actualizar labels si se personalizaron
    document.getElementById('label-monto-interno').innerHTML = 'Monto Interno <span class="req">*</span>';
    document.getElementById('label-monto-externo').textContent = 'Monto Externo/Referenciado';
    document.getElementById('label-recuperados').textContent = 'Recuperados +3 meses';
    document.getElementById('label-cantidad').innerHTML = 'Cantidad Desembolsos <span class="req">*</span>';
    
    // Llenar los selects de niveles
    llenarSelectsNiveles();
    
    // Actualizar cálculos (esto ya llama a updateMultiplicadorTables)
    updateCalculations();
}

// Llenar selects de niveles
function llenarSelectsNiveles() {
    const config = configuracionActual || CONFIG_DEFAULT;
    const selectAnterior = document.getElementById('nivelAnterior');
    const selectEquipo = document.getElementById('nivelEquipo');
    
    // Limpiar opciones actuales
    selectAnterior.innerHTML = '';
    selectEquipo.innerHTML = '';
    
    // Agregar opciones
    config.niveles.forEach((nivel, index) => {
        const optionAnterior = new Option(nivel, index);
        const optionEquipo = new Option(nivel, index);
        
        if (index === 2) { // Senior A por defecto
            optionAnterior.selected = true;
            optionEquipo.selected = true;
        }
        
        selectAnterior.add(optionAnterior);
        selectEquipo.add(optionEquipo);
    });
}

// FUNCIONES DE UTILIDAD ======================================

// Formatear número
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Remover formato
function removeFormat(input) {
    if (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado') {
        input.value = input.value.replace(/\./g, '');
    }
}

// Aplicar formato
function applyFormat(input) {
    if (input.value && (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado')) {
        const num = parseInt(input.value.replace(/\./g, ''), 10) || 0;
        input.value = formatNumber(num);
    }
}

// Formatear y calcular
function formatAndCalculate(input) {
    if (isCalculating) return;
    isCalculating = true;

    validateInput(input);

    let value = input.value.replace(/[^0-9]/g, '');
    
    if (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado') {
        const cursorPos = input.selectionStart;
        const oldLength = input.value.length;
        
        if (value) {
            input.value = formatNumber(parseInt(value, 10));
        } else {
            input.value = '';
        }
        
        const newLength = input.value.length;
        const diff = newLength - oldLength;
        const newPos = Math.max(0, cursorPos + diff);
        input.setSelectionRange(newPos, newPos);
    } else {
        input.value = value;
    }
    
    if (input.classList.contains('required')) {
        if (input.value) {
            input.classList.add('filled');
            input.classList.remove('empty');
        } else {
            input.classList.remove('filled');
            input.classList.add('empty');
        }
    }

    if (input.id === 'menorSemana') {
        const valor = parseInt(input.value, 10) || 0;
        if (valor >= 2) {
            input.classList.add('filled');
            input.classList.remove('empty');
        } else {
            input.classList.remove('filled');
            input.classList.add('empty');
        }
    }
    
    isCalculating = false;
    updateCalculations();
}

// Validar entrada
function validateInput(input) {
    const id = input.id;
    let num = parseInt(input.value.replace(/\./g, ''), 10) || 0;

    if (['conversion', 'empatia', 'proceso', 'mora'].includes(id)) {
        num = Math.max(0, num);
    } else if (['cantidadDesembolsos', 'menorSemana'].includes(id)) {
        num = Math.max(0, Math.min(999, num));
    } else if (['montoInterno', 'montoExterno', 'montoRecuperado'].includes(id)) {
        num = Math.max(0, Math.min(10000000000, num));
    }

    input.value = num.toString();
}

// Obtener valor numérico
function getNumericValue(id) {
    const input = document.getElementById(id);
    if (!input.value) return 0;
    return parseInt(input.value.replace(/\./g, ''), 10) || 0;
}

// Calcular multiplicador
function calcularMultiplicador(tipo, valor) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const multiplicadorConfig = config.multiplicadores[tipo];
    
    if (!multiplicadorConfig) return 1;
    
    // Manejar nueva estructura (array de objetos)
    if (Array.isArray(multiplicadorConfig)) {
        // Buscar el multiplicador correspondiente
        // Los rangos están ordenados de mayor a menor valor mínimo
        for (let i = 0; i < multiplicadorConfig.length; i++) {
            const rango = multiplicadorConfig[i];
            if (valor >= rango.min) {
                return rango.mult;
            }
        }
        return multiplicadorConfig[multiplicadorConfig.length - 1]?.mult || 1;
    } else {
        // Estructura antigua: objeto con rangos
        const rangos = multiplicadorConfig.rangos;
        
        // Buscar el rango apropiado
        for (let rango of rangos) {
            if (valor >= rango.desde && valor <= rango.hasta) {
                return rango.multiplicador;
            }
        }
        
        // Si no se encuentra en ningún rango, usar el multiplicador del primer rango
        return rangos[0]?.multiplicador || 1;
    }
}

// FUNCIONES DE ACTUALIZACIÓN DE BARRAS ======================================

// Actualizar barra de progreso
function updateProgressBar(tipo, valor, containerId, infoId) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const container = document.getElementById(containerId);
    const info = document.getElementById(infoId);
    
    let metas_array, pagos_array, maxMeta;
    if (tipo === 'interno') {
        metas_array = config.metas.montoInterno;
        pagos_array = config.pagos.montoInterno;
        maxMeta = 1200000000;
    } else if (tipo === 'externo') {
        metas_array = config.metas.montoExterno;
        pagos_array = config.pagos.montoExterno;
        maxMeta = 400000000;
    } else if (tipo === 'recuperado') {
        metas_array = config.metas.montoRecuperado;
        pagos_array = config.pagos.montoRecuperado;
        maxMeta = 150000000;
    } else if (tipo === 'cantidad') {
        metas_array = config.metas.cantidad;
        pagos_array = config.pagos.cantidad;
        maxMeta = 13;
    }
    
    // Calcular niveles
    let nivelVisual = -1;
    let nivelConBono = -1;
    
    if (valor >= 0) {
        // Nivel visual (más alto alcanzado)
        for (let i = config.niveles.length - 1; i >= 0; i--) {
            if (valor >= metas_array[i]) {
                nivelVisual = i;
                break;
            }
        }
        
        if (nivelVisual === -1 && valor >= 0) {
            nivelVisual = 0;
        }
        
        // Nivel con bono (solo si alcanza metas exactas)
        for (let i = 0; i < config.niveles.length; i++) {
            if (valor >= metas_array[i]) {
                nivelConBono = i;
            }
        }
    }
    
    // Crear segmentos
    let html = '<div class="progress-segments">';
    
    for (let i = 0; i < config.niveles.length; i++) {
        const alcanzado = valor >= metas_array[i];
        const esNivelVisual = i === nivelVisual;
        const esNivelConBono = i === nivelConBono;
        
        let className = 'progress-segment';
        if (alcanzado) className += ' reached';
        if (esNivelConBono) className += ' current';
        if (esNivelVisual && !alcanzado) className += ' current-no-prize';
        
        const metaTexto = tipo === 'cantidad' ? metas_array[i] : formatNumber(metas_array[i]/1000000) + 'M';
        const bonoTexto = formatNumber(pagos_array[i]);
        
        html += `<div class="${className}" onclick="cargarValor('${tipo}', ${metas_array[i]})" 
                 title="Click para cargar ${metaTexto}">
            <div class="level">${config.niveles[i]}</div>
            <div class="meta">Meta: ${metaTexto}</div>
            <div class="bono">Bono: ${bonoTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Actualizar info
    const progreso = Math.round((valor / maxMeta) * 100);
    let nivelTexto = 'Ninguno';
    let bonoTexto = '0';
    let mensajeExtra = '';
    
    if (nivelVisual >= 0) {
        nivelTexto = config.niveles[nivelVisual];
        if (nivelConBono >= 0) {
            bonoTexto = formatNumber(pagos_array[nivelConBono]);
        } else {
            bonoTexto = '0';
            if (nivelVisual === 0) {
                const falta = metas_array[0] - valor;
                const faltaTexto = tipo === 'cantidad' ? falta : formatNumber(falta);
                mensajeExtra = `<br><span style="color: #ff9800;">⚠️ Sin bono - Falta ${faltaTexto} para meta</span>`;
            }
        }
    }
    
    info.innerHTML = `Progreso total: ${tipo === 'cantidad' ? valor : formatNumber(valor)} de ${tipo === 'cantidad' ? maxMeta : formatNumber(maxMeta)} (${progreso}%)<br>
                     Nivel alcanzado: <strong>${nivelTexto}</strong> | Bono: <strong>${bonoTexto} Gs</strong>${mensajeExtra}`;
    
    return {
        nivelVisual: nivelVisual,
        nivelConBono: nivelConBono,
        nivelAlcanzado: nivelConBono
    };
}

// Cargar valor al hacer click
function cargarValor(tipo, valor) {
    if (tipo === 'interno') {
        document.getElementById('montoInterno').value = formatNumber(valor);
        document.getElementById('montoInterno').classList.add('filled');
    } else if (tipo === 'externo') {
        document.getElementById('montoExterno').value = formatNumber(valor);
        document.getElementById('montoExterno').classList.add('filled');
    } else if (tipo === 'recuperado') {
        document.getElementById('montoRecuperado').value = formatNumber(valor);
        document.getElementById('montoRecuperado').classList.add('filled');
    } else if (tipo === 'cantidad') {
        document.getElementById('cantidadDesembolsos').value = valor;
        document.getElementById('cantidadDesembolsos').classList.add('filled');
    }
    updateCalculations();
}

// Actualizar barra de carrera
function updateCarreraBar(nivelCarrera, nivelActualMes, nivelAnterior) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const container = document.getElementById('barraCarrera');
    const info = document.getElementById('infoCarrera');
    
    // Crear segmentos
    let html = '<div class="progress-segments">';
    
    for (let i = 0; i < config.niveles.length; i++) {
        let className = 'progress-segment';
        
        if (i <= nivelCarrera && nivelCarrera >= 0) {
            className += ' reached';
        }
        if (i === nivelCarrera) {
            className += ' current';
        }
        
        const bono = config.pagos.carrera[i];
        const bonoTexto = bono > 0 ? formatNumber(bono) : '0';
        
        html += `<div class="${className}" style="${i < 2 ? 'opacity: 0.5;' : ''}">
            <div class="level">${config.niveles[i]}</div>
            <div class="bono">Bono: ${bonoTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Actualizar info
    const nivelTexto = nivelCarrera >= 0 ? config.niveles[nivelCarrera] : 'Sin carrera';
    const bonoCarrera = nivelCarrera >= 0 ? config.pagos.carrera[nivelCarrera] : 0;
    
    let detalle = '';
    if (nivelActualMes >= 0 && nivelAnterior >= 0) {
        const nivelActualTexto = config.niveles[nivelActualMes];
        const nivelAnteriorTexto = config.niveles[nivelAnterior];
        
        if (nivelActualMes === nivelAnterior) {
            detalle = `<span class="text-muted">Mes actual: ${nivelActualTexto} | Mes anterior: ${nivelAnteriorTexto} | Ambos iguales</span>`;
        } else if (nivelActualMes < nivelAnterior) {
            detalle = `<span class="text-muted">Mes actual: ${nivelActualTexto} | Mes anterior: ${nivelAnteriorTexto} | Se toma el menor (actual)</span>`;
        } else {
            detalle = `<span class="text-muted">Mes actual: ${nivelActualTexto} | Mes anterior: ${nivelAnteriorTexto} | Se toma el menor (anterior)</span>`;
        }
    }
    
    info.innerHTML = `Tu nivel de carrera: <strong>${nivelTexto}</strong> | 
                     Bono: <strong>${formatNumber(bonoCarrera)} Gs</strong><br>
                     ${detalle}`;
    
    return bonoCarrera;
}



// Actualizar tabla de multiplicadores clickeable (FORMATO ORIGINAL RESTAURADO)
function updateMultiplicadorTables() {
    const config = configuracionActual || CONFIG_DEFAULT;
    const conversion = parseFloat(document.getElementById('conversion').value) || 0;
    const empatia = parseFloat(document.getElementById('empatia').value) || 0;
    const proceso = parseFloat(document.getElementById('proceso').value) || 0;
    const mora = parseFloat(document.getElementById('mora').value) || 0;
    
    const container = document.getElementById('multiplicadorTables');
    if (!container) return;
    
    let html = '';
    
    // Tabla Conversión
    const multConv = calcularMultiplicador('conversion', conversion);
    let classConv = 'multiplier-table';
    if (multConv >= 0.9) classConv += ' good';
    else if (multConv >= 0.7) classConv += ' warning';
    else if (multConv > 0) classConv += ' danger';
    
    html += `<div class="${classConv}">
        <div class="multiplier-title">Conversión</div>`;
    
    const multiplicadorConversion = config.multiplicadores.conversion;
    if (Array.isArray(multiplicadorConversion)) {
        // Nueva estructura: array de objetos con min, mult, text
        for (let i = 0; i < multiplicadorConversion.length; i++) {
            const item = multiplicadorConversion[i];
            const nextItem = multiplicadorConversion[i - 1];
            const active = conversion >= item.min && (!nextItem || conversion < nextItem.min);
            html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                     onclick="cargarMultiplicador('conversion', ${item.min === 0 ? 3 : item.min})"
                     title="Click para cargar ${item.min === 0 ? 3 : item.min}%">
                <span>${item.text}</span>
                <span>→ ${Math.round(item.mult * 100)}%</span>
            </div>`;
        }
    }
    html += `<div class="multiplier-current">Tu valor: ${conversion || '-'}%</div>
    </div>`;
    
    // Tabla Empatía
    const multEmp = calcularMultiplicador('empatia', empatia);
    let classEmp = 'multiplier-table';
    if (multEmp >= 0.9) classEmp += ' good';
    else if (multEmp >= 0.7) classEmp += ' warning';
    else if (multEmp > 0) classEmp += ' danger';
    
    html += `<div class="${classEmp}">
        <div class="multiplier-title">Empatía</div>`;
    
    const multiplicadorEmpatia = config.multiplicadores.empatia;
    if (Array.isArray(multiplicadorEmpatia)) {
        for (let i = 0; i < multiplicadorEmpatia.length; i++) {
            const item = multiplicadorEmpatia[i];
            const nextItem = multiplicadorEmpatia[i - 1];
            const active = empatia >= item.min && (!nextItem || empatia < nextItem.min);
            html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                     onclick="cargarMultiplicador('empatia', ${item.min === 0 ? 69 : item.min})"
                     title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
                <span>${item.text}</span>
                <span>→ ${Math.round(item.mult * 100)}%</span>
            </div>`;
        }
    }
    html += `<div class="multiplier-current">Tu valor: ${empatia || '-'}%</div>
    </div>`;
    
    // Tabla Proceso
    const multProc = calcularMultiplicador('proceso', proceso);
    let classProc = 'multiplier-table';
    if (multProc >= 0.9) classProc += ' good';
    else if (multProc >= 0.7) classProc += ' warning';
    else if (multProc > 0) classProc += ' danger';
    
    html += `<div class="${classProc}">
        <div class="multiplier-title">Proceso</div>`;
    
    const multiplicadorProceso = config.multiplicadores.proceso;
    if (Array.isArray(multiplicadorProceso)) {
        for (let i = 0; i < multiplicadorProceso.length; i++) {
            const item = multiplicadorProceso[i];
            const nextItem = multiplicadorProceso[i - 1];
            const active = proceso >= item.min && (!nextItem || proceso < nextItem.min);
            html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                     onclick="cargarMultiplicador('proceso', ${item.min === 0 ? 69 : item.min})"
                     title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
                <span>${item.text}</span>
                <span>→ ${Math.round(item.mult * 100)}%</span>
            </div>`;
        }
    }
    html += `<div class="multiplier-current">Tu valor: ${proceso || '-'}%</div>
    </div>`;

    // Tabla Mora
    const multMora = calcularMultiplicador('mora', mora);
    let classMora = 'multiplier-table';
    if (mora <= 2) classMora += ' good';
    else if (mora <= 7) classMora += ' warning';
    else classMora += ' danger';

    html += `<div class="${classMora}">
        <div class="multiplier-title">Mora</div>`;

    const multiplicadorMora = config.multiplicadores.mora;
    if (Array.isArray(multiplicadorMora)) {
        for (let i = 0; i < multiplicadorMora.length; i++) {
            const item = multiplicadorMora[i];
            const nextItem = multiplicadorMora[i + 1];
            // Para mora, la lógica es diferente: recorremos de menor a mayor
            let active = false;
            if (mora >= item.min) {
                if (!nextItem || mora < nextItem.min) {
                    active = true;
                }
            }
            html += `<div class="multiplier-row ${active ? 'active' : ''}"
                     onclick="cargarMultiplicador('mora', ${item.min})"
                     title="Click para cargar ${item.text}">
                <span>${item.text}</span>
                <span>→ ${Math.round(item.mult * 100)}%</span>
            </div>`;
        }
    }
    let moraTexto = '-';
    if (mora > 0) {
        // Encontrar el texto correcto para el valor de mora
        if (Array.isArray(multiplicadorMora)) {
            for (let i = multiplicadorMora.length - 1; i >= 0; i--) {
                const item = multiplicadorMora[i];
                if (mora >= item.min) {
                    moraTexto = item.text;
                    break;
                }
            }
        }
    }
    html += `<div class="multiplier-current">Tu valor: ${mora || '-'}${mora > 0 ? '% (' + moraTexto + ')' : ''}</div>
    </div>`;
    
    container.innerHTML = html;
    
    // Actualizar cálculo
    const totalMult = Math.max(multConv * multEmp * multProc * multMora, 0.1);
    const calcElement = document.getElementById('multiplicadorCalc');
    if (calcElement) {
        calcElement.textContent = conversion && empatia && proceso && mora ?
            `Cálculo: ${multConv.toFixed(2)} × ${multEmp.toFixed(2)} × ${multProc.toFixed(2)} × ${multMora.toFixed(2)} = ${(totalMult*100).toFixed(1)}%` :
            'Completa todos los campos de calidad';
    }
    
    return totalMult;
}



// Cargar multiplicador
function cargarMultiplicador(tipo, valor) {
    const input = document.getElementById(tipo);
    if (input) {
        input.value = valor;
        input.classList.add('filled');
        formatAndCalculate(input);
    }
}

// Actualizar cantidad con llave
function updateCantidadConLlave(cantidad, menorSemana) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const cantidadStatus = document.getElementById('cantidadStatus');
    const llaveInfo = document.getElementById('llaveInfo');
    const cantidadLlaveInfo = document.getElementById('cantidadLlaveInfo');
    
    const llaveSemanal = menorSemana >= 2;
    const llave6Desembolsos = cantidad >= 6;
    
    // Actualizar info de llave semanal
    if (llaveSemanal) {
        llaveInfo.innerHTML = `
            <div><strong>✅ LLAVE HABILITADA</strong></div>
            <div class="llave-rules">
                <div>✅ 2/sem → habilita bono cantidad completo</div>
            </div>`;
        cantidadLlaveInfo.textContent = '';
    } else {
        llaveInfo.innerHTML = `
            <div><strong>❌ LLAVE DESHABILITADA</strong></div>
            <div class="llave-rules">
                <div>❌ Menos de 2/sem → sin bono cantidad</div>
            </div>`;
        cantidadLlaveInfo.textContent = '❌';
    }
    
    // Actualizar status de cantidad
    if (llave6Desembolsos) {
        cantidadStatus.innerHTML = '✅ Llave 6 desembolsos activa';
        cantidadStatus.style.color = '#2E7D32';
    } else {
        cantidadStatus.innerHTML = '❌ Necesitas 6+ desembolsos para bono interno';
        cantidadStatus.style.color = '#d32f2f';
    }
    
    // Actualizar llave de monto interno
    const montoLlave = document.getElementById('montoLlave');
    if (llave6Desembolsos) {
        montoLlave.innerHTML = '✅ Llave OK';
        montoLlave.style.color = '#2E7D32';
    } else {
        montoLlave.innerHTML = '❌ Sin llave (necesitas 6+ desemb.)';
        montoLlave.style.color = '#d32f2f';
    }
    
    return { llaveSemanal, llave6Desembolsos };
}

// Actualizar barra de equipo
function updateEquipoBar(nivelEquipo, nivelCarrera) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const container = document.getElementById('barraEquipo');
    const info = document.getElementById('infoEquipo');
    const requisitos = document.getElementById('equipoRequisitos');
    
    let html = '<div class="progress-segments">';
    
    for (let i = 0; i < config.niveles.length; i++) {
        let className = 'progress-segment';
        
        if (i <= nivelEquipo) {
            className += ' reached';
        }
        if (i === nivelEquipo) {
            className += ' current';
        }
        
        const bono = config.pagos.equipo[i];
        const bonoTexto = bono > 0 ? formatNumber(bono) : '0';
        
        html += `<div class="${className}">
            <div class="level">${config.niveles[i]}</div>
            <div class="bono">Bono: ${bonoTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Verificar si cumple requisitos
    const cumpleRequisito = nivelCarrera >= 2; // Senior A o superior
    const bonoEquipo = cumpleRequisito ? config.pagos.equipo[nivelEquipo] : 0;
    
    info.innerHTML = `Nivel del equipo: <strong>${config.niveles[nivelEquipo]}</strong> | 
                     Bono: <strong>${formatNumber(bonoEquipo)} Gs</strong>`;
    
    if (cumpleRequisito) {
        requisitos.style.display = 'none';
    } else {
        requisitos.style.display = 'block';
        requisitos.innerHTML = '⚠️ Necesitas estar en Senior A+ para cobrar bono equipo';
    }
    
    return bonoEquipo;
}

// Actualizar barra de subtotal
function updateSubtotalBar(subtotal) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const fill = document.getElementById('subtotalFill');
    const monto = document.getElementById('subtotalMonto');
    const maxElement = document.getElementById('maxSubtotal');
    
    // Calcular máximo subtotal dinámicamente
    const MAXIMO_SUBTOTAL = config.base + 
        config.pagos.carrera[5] + 
        config.pagos.montoInterno[5] + 
        config.pagos.montoExterno[5] + 
        config.pagos.montoRecuperado[5] + 
        config.pagos.cantidad[5] + 
        config.pagos.equipo[5];
    
    const porcentaje = Math.min(100, (subtotal / MAXIMO_SUBTOTAL) * 100);
    
    fill.style.width = porcentaje + '%';
    monto.textContent = formatNumber(subtotal) + ' Gs';
    maxElement.textContent = formatNumber(MAXIMO_SUBTOTAL) + ' Gs';
}

// FUNCIÓN PRINCIPAL DE CÁLCULO ======================================

function updateCalculations() {
    const config = configuracionActual || CONFIG_DEFAULT;
    
    // Obtener valores
    const nivelAnterior = parseInt(document.getElementById('nivelAnterior').value) || 0;
    const montoInterno = getNumericValue('montoInterno');
    const montoExterno = getNumericValue('montoExterno');
    const montoRecuperado = getNumericValue('montoRecuperado');
    const cantidadDesembolsos = parseInt(document.getElementById('cantidadDesembolsos').value) || 0;
    const menorSemana = parseInt(document.getElementById('menorSemana').value) || 0;
    const nivelEquipo = parseInt(document.getElementById('nivelEquipo').value) || 0;
    
    // Obtener multiplicadores
    const conversion = parseFloat(document.getElementById('conversion').value) || 0;
    const empatia = parseFloat(document.getElementById('empatia').value) || 0;
    const proceso = parseFloat(document.getElementById('proceso').value) || 0;
    const mora = parseFloat(document.getElementById('mora').value) || 0;
    
    // Actualizar barras de progreso
    const internoInfo = updateProgressBar('interno', montoInterno, 'barraInterno', 'infoInterno');
    const externoInfo = updateProgressBar('externo', montoExterno, 'barraExterno', 'infoExterno');
    const recuperadoInfo = updateProgressBar('recuperado', montoRecuperado, 'barraRecuperado', 'infoRecuperado');
    const cantidadInfo = updateProgressBar('cantidad', cantidadDesembolsos, 'barraCantidad', 'infoCantidad');
    
    // Verificar llaves
    const llaves = updateCantidadConLlave(cantidadDesembolsos, menorSemana);
    
    // Calcular nivel actual del mes (menor nivel visual alcanzado)
    const nivelesVisuales = [
        internoInfo.nivelVisual,
        externoInfo.nivelVisual,
        recuperadoInfo.nivelVisual,
        cantidadInfo.nivelVisual
    ].filter(n => n >= 0);
    
    const nivelActualMes = nivelesVisuales.length > 0 ? Math.min(...nivelesVisuales) : -1;
    
    // Calcular nivel de carrera (menor entre actual y anterior)
    let nivelCarrera = -1;
    if (nivelActualMes >= 0 && nivelAnterior >= 0) {
        nivelCarrera = Math.min(nivelActualMes, nivelAnterior);
    } else if (nivelActualMes >= 0) {
        nivelCarrera = nivelActualMes;
    } else if (nivelAnterior >= 0) {
        nivelCarrera = nivelAnterior;
    }
    
    // Actualizar barras de carrera y equipo
    const bonoCarrera = updateCarreraBar(nivelCarrera, nivelActualMes, nivelAnterior);
    const bonoEquipo = updateEquipoBar(nivelEquipo, nivelCarrera);
    
    // Calcular multiplicadores
    const multConv = calcularMultiplicador('conversion', conversion);
    const multEmp = calcularMultiplicador('empatia', empatia);
    const multProc = calcularMultiplicador('proceso', proceso);
    const multMora = calcularMultiplicador('mora', mora);
    const multiplicadorTotal = multConv * multEmp * multProc * multMora;
    
    // Actualizar cálculo de multiplicadores
    const calcElement = document.getElementById('multiplicadorCalc');
    if (calcElement) {
        calcElement.innerHTML = `Cálculo: ${Math.round(multConv * 100)}% × ${Math.round(multEmp * 100)}% × ${Math.round(multProc * 100)}% × ${Math.round(multMora * 100)}% = ${Math.round(multiplicadorTotal * 100)}%`;
    }
    
    updateMultiplicadorTables();
    
    // Calcular bonos
    const bonos = {
        base: config.base,
        carrera: bonoCarrera,
        interno: llaves.llave6Desembolsos ? (internoInfo.nivelConBono >= 0 ? config.pagos.montoInterno[internoInfo.nivelConBono] : 0) : 0,
        externo: externoInfo.nivelConBono >= 0 ? config.pagos.montoExterno[externoInfo.nivelConBono] : 0,
        recuperado: recuperadoInfo.nivelConBono >= 0 ? config.pagos.montoRecuperado[recuperadoInfo.nivelConBono] : 0,
        cantidad: llaves.llaveSemanal ? (cantidadInfo.nivelConBono >= 0 ? config.pagos.cantidad[cantidadInfo.nivelConBono] : 0) : 0,
        equipo: bonoEquipo
    };
    
    // Calcular subtotal y total
    const subtotal = bonos.base + bonos.carrera + bonos.interno + 
                    bonos.externo + bonos.recuperado + bonos.cantidad + bonos.equipo;
    const totalComision = bonos.base + ((subtotal - bonos.base) * multiplicadorTotal);
    
    // Actualizar barra de subtotal
    updateSubtotalBar(subtotal);
    
    // Actualizar estadísticas superiores
    document.getElementById('statNivel').textContent = nivelCarrera >= 0 ? config.niveles[nivelCarrera] : 'Sin nivel';
    document.getElementById('statSubtotal').textContent = formatNumber(subtotal) + ' Gs';
    document.getElementById('statMulti').textContent = Math.round(multiplicadorTotal * 100) + '%';
    document.getElementById('statComision').textContent = formatNumber(totalComision) + ' Gs';
    
    // Actualizar cálculo detallado
    document.getElementById('calcBase').textContent = formatNumber(bonos.base) + ' Gs';
    document.getElementById('calcCarrera').textContent = formatNumber(bonos.carrera) + ' Gs';
    document.getElementById('calcInterno').textContent = formatNumber(bonos.interno) + ' Gs';
    document.getElementById('calcExterno').textContent = formatNumber(bonos.externo) + ' Gs';
    document.getElementById('calcRecuperado').textContent = formatNumber(bonos.recuperado) + ' Gs';
    document.getElementById('calcCantidad').textContent = formatNumber(bonos.cantidad) + ' Gs';
    document.getElementById('calcEquipo').textContent = formatNumber(bonos.equipo) + ' Gs';
    document.getElementById('calcSubtotal').textContent = formatNumber(subtotal) + ' Gs';
    document.getElementById('calcMultiplicador').textContent = Math.round(multiplicadorTotal * 100) + '%';
    document.getElementById('totalComision').textContent = formatNumber(totalComision) + ' Gs';
    
    // Generar sugerencias
    generarSugerencias({
        nivelCarrera,
        internoInfo,
        externoInfo,
        recuperadoInfo,
        cantidadInfo,
        llaves,
        multiplicadores: { conversion, empatia, proceso, mora },
        multiplicadorTotal,
        bonos,
        subtotal,
        totalComision
    });
    
    // Guardar en Supabase si hay asesor logueado
    if (asesorActualId) {
        guardarCalculoEnSupabase({
            montoInterno,
            montoExterno,
            montoRecuperado,
            cantidadDesembolsos,
            menorSemana,
            conversion,
            empatia,
            proceso,
            mora,
            nivelAnterior,
            nivelEquipo,
            nivelCarrera,
            bonos,
            subtotal,
            multiplicadorTotal,
            totalComision
        });
    }
}

// Generar sugerencias
function generarSugerencias(datos) {
    const config = configuracionActual || CONFIG_DEFAULT;
    const container = document.getElementById('sugerencias');
    let sugerencias = [];
    
    // Sugerencia de llave de 6 desembolsos
    if (!datos.llaves.llave6Desembolsos) {
        sugerencias.push({
            tipo: 'critico',
            texto: '🚨 Sin 6 desembolsos no cobras bono interno. ¡Es prioridad!'
        });
    }
    
    // Sugerencia de llave semanal
    if (!datos.llaves.llaveSemanal) {
        sugerencias.push({
            tipo: 'critico',
            texto: '🚨 Necesitas 2 desembolsos/semana mínimo para bono cantidad'
        });
    }
    
    // Sugerencias de multiplicadores
    if (datos.multiplicadores.conversion < 7) {
        sugerencias.push({
            tipo: 'importante',
            texto: `📊 Tu conversión (${datos.multiplicadores.conversion}%) reduce tu bono. Meta: 7%+`
        });
    }
    
    if (datos.multiplicadores.empatia < 90) {
        sugerencias.push({
            tipo: 'importante',
            texto: `💬 Empatía (${datos.multiplicadores.empatia}%) por debajo del óptimo. Meta: 90%+`
        });
    }
    
    if (datos.multiplicadores.proceso < 90) {
        sugerencias.push({
            tipo: 'importante',
            texto: `📋 Proceso (${datos.multiplicadores.proceso}%) puede mejorar. Meta: 90%+`
        });
    }
    
    if (datos.multiplicadores.mora > 2) {
        sugerencias.push({
            tipo: 'importante',
            texto: `⚠️ Mora (${datos.multiplicadores.mora}%) afecta tu multiplicador. Meta: 0-2%`
        });
    }
    
    // Sugerencias de progreso
    ['internoInfo', 'externoInfo', 'recuperadoInfo', 'cantidadInfo'].forEach(tipo => {
        const info = datos[tipo];
        if (info.nivelVisual > info.nivelConBono) {
            const tipoTexto = {
                internoInfo: 'monto interno',
                externoInfo: 'monto externo',
                recuperadoInfo: 'recuperados',
                cantidadInfo: 'cantidad'
            }[tipo];
            sugerencias.push({
                tipo: 'mejora',
                texto: `💡 Estás cerca del siguiente bono en ${tipoTexto}`
            });
        }
    });
    
    // Mostrar sugerencias
    if (sugerencias.length === 0) {
        container.innerHTML = '<div class="suggestion excellent">🎉 ¡Excelente trabajo! Todos los indicadores están optimizados</div>';
    } else {
        container.innerHTML = sugerencias.map(s => 
            `<div class="suggestion ${s.tipo}">${s.texto}</div>`
        ).join('');
    }
}

// Guardar cálculo en Supabase
async function guardarCalculoEnSupabase(datos) {
    if (!asesorActualId) return;
    
    try {
        const { error } = await supabase
            .from('calculations')
            .insert({
                user_id: asesorActualId,
                data: {
                    montoInterno: datos.montoInterno,
                    montoExterno: datos.montoExterno,
                    montoRecuperado: datos.montoRecuperado,
                    cantidadDesembolsos: datos.cantidadDesembolsos,
                    menorSemana: datos.menorSemana,
                    conversion: datos.conversion,
                    empatia: datos.empatia,
                    proceso: datos.proceso,
                    mora: datos.mora,
                    nivelAnterior: datos.nivelAnterior,
                    nivelEquipo: datos.nivelEquipo
                },
                resultado: {
                    nivelCarrera: datos.nivelCarrera,
                    bonos: datos.bonos,
                    subtotal: datos.subtotal,
                    multiplicadorTotal: datos.multiplicadorTotal,
                    totalComision: datos.totalComision
                }
            });
        
        if (error) console.error('Error guardando cálculo:', error);
    } catch (error) {
        console.error('Error:', error);
    }
}

// FUNCIONES AUXILIARES ======================================

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.left-panel');
    const btn = document.getElementById('openSidebarBtn');
    
    sidebar.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        btn.textContent = '⬅️ Ocultar';
    } else {
        btn.textContent = '➡️ Mostrar';
    }
}

// Limpiar todo
function limpiarTodo() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los campos?')) {
        // Limpiar inputs
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            if (input.id !== 'menorSemana') {
                input.value = '';
                input.classList.remove('filled', 'empty');
            }
        });
        
        // Resetear selects
        document.getElementById('nivelAnterior').selectedIndex = 2;
        document.getElementById('nivelEquipo').selectedIndex = 2;
        
        // Resetear valores óptimos de multiplicadores
        document.getElementById('conversion').value = '8';
        document.getElementById('empatia').value = '96';
        document.getElementById('proceso').value = '95';
        document.getElementById('mora').value = '2';
        
        updateCalculations();
    }
}

// Inicializar valores por defecto
window.addEventListener('DOMContentLoaded', function() {
    // Establecer valores óptimos por defecto
    document.getElementById('conversion').value = '8';
    document.getElementById('empatia').value = '96';
    document.getElementById('proceso').value = '95';
    document.getElementById('mora').value = '2';
    document.getElementById('menorSemana').value = '2';
    
    // Marcar campos con valores por defecto
    ['conversion', 'empatia', 'proceso', 'mora', 'menorSemana'].forEach(id => {
        const input = document.getElementById(id);
        if (input && input.value) {
            input.classList.add('filled');
        }
    });
}); 