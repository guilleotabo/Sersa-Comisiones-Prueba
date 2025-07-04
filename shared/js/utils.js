/* ========================================
   UTILIDADES - SISTEMA COMISIONES
   Funciones auxiliares, formateo y validaciones
   ======================================== */

/**
 * Formatea un número agregando separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado con puntos como separadores
 */
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Remueve el formato de un input (elimina puntos)
 * @param {HTMLElement} input - Elemento input
 */
function removeFormat(input) {
    if (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado') {
        input.value = input.value.replace(/\./g, '');
    }
}

/**
 * Aplica formato a un input (agrega puntos como separadores)
 * @param {HTMLElement} input - Elemento input
 */
function applyFormat(input) {
    if (input.value && (input.id === 'montoInterno' || input.id === 'montoExterno' || input.id === 'montoRecuperado')) {
        const num = parseInt(input.value.replace(/\./g, ''), 10) || 0;
        input.value = formatNumber(num);
    }
}

/**
 * Valida y formatea un input, luego actualiza los cálculos
 * @param {HTMLElement} input - Elemento input a procesar
 */
function formatAndCalculate(input) {
    if (window.isCalculating) return;
    window.isCalculating = true;

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
    
    // Actualizar clases CSS según el valor
    updateInputClasses(input);
    
    window.isCalculating = false;
    
    // Actualizar cálculos si la función existe
    if (typeof updateCalculations === 'function') {
        updateCalculations();
    }
}

/**
 * Actualiza las clases CSS de un input según su valor
 * @param {HTMLElement} input - Elemento input
 */
function updateInputClasses(input) {
    if (input.classList.contains('required')) {
        if (input.value) {
            input.classList.add('filled');
            input.classList.remove('empty');
        } else {
            input.classList.remove('filled');
            input.classList.add('empty');
        }
    }

    // Validación especial para menorSemana
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
}

/**
 * Verifica si todos los campos requeridos están completos
 * @returns {boolean} True si todos los campos requeridos tienen valor
 */
function checkRequiredFields() {
    const required = document.querySelectorAll('.required');
    for (let field of required) {
        if (!field.value) return false;
    }
    return true;
}

/**
 * Obtiene el valor numérico de un input por su ID
 * @param {string} id - ID del elemento input
 * @returns {number} Valor numérico del input
 */
function getNumericValue(id) {
    const input = document.getElementById(id);
    if (!input || !input.value) return 0;
    return parseInt(input.value.replace(/\./g, ''), 10) || 0;
}

/**
 * Valida un input según su tipo y aplica restricciones
 * @param {HTMLElement} input - Elemento input a validar
 */
function validateInput(input) {
    const id = input.id;
    let num = parseInt(input.value.replace(/\./g, ''), 10) || 0;

    // Validaciones específicas por tipo de campo
    if (['conversion', 'empatia', 'proceso', 'mora'].includes(id)) {
        num = Math.max(0, num); // Sin límite superior para estos campos
    } else if (['cantidadDesembolsos', 'menorSemana'].includes(id)) {
        num = Math.max(0, Math.min(999, num));
    } else if (['montoInterno', 'montoExterno', 'montoRecuperado'].includes(id)) {
        num = Math.max(0, Math.min(10000000000, num));
    }

    input.value = num.toString();
}

/**
 * Formatea input para el panel de administración
 * @param {HTMLElement} input - Elemento input del admin
 */
function formatearAdminInput(input) {
    const value = input.value.replace(/[^0-9]/g, '');
    if (value) {
        input.value = formatNumber(parseInt(value, 10));
    }
}

/**
 * Limpia el formato de un string para obtener solo números
 * @param {string} str - String a limpiar
 * @returns {number} Número sin formato
 */
function limpiarFormatoAdmin(str) {
    return parseInt(str.replace(/\./g, ''), 10) || 0;
}

/**
 * Muestra indicador de guardado automático
 */
function showIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
        indicator.innerHTML = '💾 Guardando...';
        indicator.style.opacity = '1';
    }
}

/**
 * Oculta indicador de guardado automático
 */
function hideIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
        setTimeout(() => {
            indicator.innerHTML = '✅ Guardado';
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 1000);
        }, 500);
    }
}

/**
 * Restaura un borrador guardado automáticamente
 */
function restoreDraft() {
    const draft = localStorage.getItem('comisionesDraft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            
            // Restaurar valores en los inputs
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = data[key];
                    updateInputClasses(input);
                }
            });
            
            console.log('📄 Borrador restaurado automáticamente');
            
            // Actualizar cálculos si la función existe
            if (typeof updateCalculations === 'function') {
                updateCalculations();
            }
        } catch (e) {
            console.error('❌ Error restaurando borrador:', e);
        }
    }
}

/**
 * Guarda automáticamente los valores del formulario
 * @param {Event} e - Evento del input
 */
function autosave(e) {
    if (!e.target.id) return;
    
    showIndicator();
    
    // Recopilar todos los valores del formulario
    const formData = {};
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.id && input.value) {
            formData[input.id] = input.value;
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('comisionesDraft', JSON.stringify(formData));
    
    hideIndicator();
}

/**
 * Limpia todos los datos del formulario
 */
function limpiarTodo() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type !== 'password') {
            input.value = '';
            input.classList.remove('filled', 'empty');
        }
    });
    
    // Restaurar valores por defecto específicos
    document.getElementById('nivelAnterior').value = '2';
    document.getElementById('nivelEquipo').value = '2';
    document.getElementById('menorSemana').value = '2';
    document.getElementById('conversion').value = '8';
    document.getElementById('empatia').value = '96';
    document.getElementById('proceso').value = '95';
    document.getElementById('mora').value = '2';
    
    // Limpiar localStorage
    localStorage.removeItem('comisionesDraft');
    
    // Actualizar cálculos si la función existe
    if (typeof updateCalculations === 'function') {
        updateCalculations();
    }
    
    console.log('🗑️ Formulario limpiado');
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(mensaje);
    }
}

/**
 * Muestra el sistema principal ocultando la pantalla de login
 */
function mostrarSistema() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
    
    // Restaurar borrador si existe
    restoreDraft();
    
    // Configurar autosave
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', autosave);
        input.addEventListener('change', autosave);
    });
}

// Inicializar variable global para evitar cálculos múltiples
window.isCalculating = false;

// Exportar funciones para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatNumber,
        removeFormat,
        applyFormat,
        formatAndCalculate,
        checkRequiredFields,
        getNumericValue,
        validateInput,
        formatearAdminInput,
        limpiarFormatoAdmin,
        limpiarTodo,
        mostrarError,
        mostrarSistema,
        restoreDraft,
        autosave
    };
}