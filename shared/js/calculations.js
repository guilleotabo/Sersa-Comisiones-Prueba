/* ========================================
   CÁLCULOS - SISTEMA COMISIONES
   Lógica de cálculo de comisiones, multiplicadores y niveles
   ======================================== */

/**
 * Calcula el multiplicador para un tipo y valor específico
 * @param {string} tipo - Tipo de multiplicador (conversion, empatia, proceso, mora)
 * @param {number} valor - Valor a evaluar
 * @returns {number} Multiplicador correspondiente
 */
function calcularMultiplicador(tipo, valor) {
    const config = window.systemConfig || CONFIG;
    const tabla = config.multiplicadores[tipo];
    if (!tabla) return 0;

    if (tipo === 'mora') {
        // Para mora, recorrer de mayor a menor para encontrar el rango correcto
        for (let i = tabla.length - 1; i >= 0; i--) {
            if (valor >= tabla[i].min) return tabla[i].mult;
        }
        return 0;
    }

    // Para las demás tablas (conversion, empatia, proceso)
    for (let item of tabla) {
        if (valor >= item.min) return item.mult;
    }
    return 0;
}

/**
 * Encuentra automáticamente el valor más cercano al multiplicador 1.0
 * @param {string} tipo - Tipo de multiplicador
 * @returns {number} Valor óptimo para obtener multiplicador cercano a 1.0
 */
function encontrarValorOptimo(tipo) {
    const config = window.systemConfig || CONFIG;
    const tabla = config.multiplicadores[tipo];
    if (!tabla || tabla.length === 0) return 0;
    
    let mejorOpcion = tabla[0];
    let menorDiferencia = Math.abs(tabla[0].mult - 1.0);
    
    for (let item of tabla) {
        const diferencia = Math.abs(item.mult - 1.0);
        if (diferencia < menorDiferencia) {
            menorDiferencia = diferencia;
            mejorOpcion = item;
        }
    }
    
    // Para mora, retornar un valor dentro del rango
    if (tipo === 'mora') {
        if (mejorOpcion.min === 0) {
            return 1; // Valor dentro del rango 0-2%
        } else if (mejorOpcion.min === 3) {
            return 5; // Valor dentro del rango 3-7%
        } else {
            return mejorOpcion.min;
        }
    }
    
    // Para el resto de tablas, usar exactamente el valor min del mejor multiplicador
    return mejorOpcion.min;
}

/**
 * Establece valores óptimos por defecto para obtener multiplicadores cercanos a 1.0
 * @returns {Object} Valores óptimos establecidos
 */
function establecerValoresOptimos() {
    const valoresOptimos = {
        conversion: encontrarValorOptimo('conversion'),
        empatia: encontrarValorOptimo('empatia'),
        proceso: encontrarValorOptimo('proceso'),
        mora: encontrarValorOptimo('mora')
    };
    
    // Aplicar los valores a los campos
    Object.entries(valoresOptimos).forEach(([campo, valor]) => {
        const input = document.getElementById(campo);
        if (input) {
            input.value = valor;
            input.classList.add('filled');
            input.classList.remove('empty');
        }
    });
    
    return valoresOptimos;
}

/**
 * Actualiza la cantidad considerando la llave semanal
 * @param {number} cantidad - Cantidad de desembolsos
 * @param {number} menorSemana - Desembolsos en la peor semana
 * @returns {Object} Información de la cantidad con llave aplicada
 */
function updateCantidadConLlave(cantidad, menorSemana) {
    const config = window.systemConfig || CONFIG;
    const llaveHabilitada = menorSemana >= 2;
    
    let nivelCantidad = -1;
    let premioCantidad = 0;
    
    // Determinar nivel alcanzado
    for (let i = 0; i < config.metas.cantidad.length; i++) {
        if (cantidad >= config.metas.cantidad[i]) {
            nivelCantidad = i;
        }
    }
    
    // Aplicar premio solo si la llave está habilitada
    if (llaveHabilitada && nivelCantidad >= 0) {
        premioCantidad = config.pagos.cantidad[nivelCantidad];
    }
    
    return {
        nivel: nivelCantidad,
        premio: premioCantidad,
        llaveHabilitada: llaveHabilitada,
        cantidad: cantidad
    };
}

/**
 * Calcula los bonos y premios basados en los valores ingresados
 * @param {Object} values - Valores del formulario
 * @param {Object} info - Información adicional
 * @returns {Object} Resultado de los cálculos
 */
function computeBonuses(values, info) {
    const config = window.systemConfig || CONFIG;
    
    // Determinar nivel de carrera (menor de los últimos 2 meses)
    const nivelCarrera = Math.min(
        info.nivelInterno,
        info.nivelExterno, 
        info.nivelRecuperado,
        info.nivelCantidad,
        values.nivelAnterior
    );
    
    // Calcular premios
    const premioCarrera = nivelCarrera >= 0 ? config.pagos.carrera[nivelCarrera] : 0;
    const premioInterno = info.nivelInterno >= 0 ? config.pagos.montoInterno[info.nivelInterno] : 0;
    const premioExterno = info.nivelExterno >= 0 ? config.pagos.montoExterno[info.nivelExterno] : 0;
    const premioRecuperado = info.nivelRecuperado >= 0 ? config.pagos.montoRecuperado[info.nivelRecuperado] : 0;
    
    // Premio cantidad con llave
    const infoCantidad = updateCantidadConLlave(values.cantidadDesembolsos, values.menorSemana);
    const premioCantidad = infoCantidad.premio;
    
    // Premio equipo (solo desde Senior A y si el asesor califica)
    let premioEquipo = 0;
    if (nivelCarrera >= 2 && values.nivelEquipo >= 2) {
        premioEquipo = config.pagos.equipo[values.nivelEquipo] || 0;
    }
    
    // Calcular subtotal
    const subtotal = config.base + premioCarrera + premioInterno + 
                    premioExterno + premioRecuperado + premioCantidad + premioEquipo;
    
    // Calcular multiplicadores
    const multConversion = calcularMultiplicador('conversion', values.conversion);
    const multEmpatia = calcularMultiplicador('empatia', values.empatia);
    const multProceso = calcularMultiplicador('proceso', values.proceso);
    const multMora = calcularMultiplicador('mora', values.mora);
    
    // Multiplicador final (se aplican en cadena)
    const multiplicadorFinal = multConversion * multEmpatia * multProceso * multMora;
    
    // Comisión final (base no se multiplica)
    const comisionFinal = config.base + 
                         (premioCarrera + premioInterno + premioExterno + 
                          premioRecuperado + premioCantidad + premioEquipo) * multiplicadorFinal;
    
    return {
        nivelCarrera,
        premioCarrera,
        premioInterno,
        premioExterno,
        premioRecuperado,
        premioCantidad,
        premioEquipo,
        subtotal,
        multConversion,
        multEmpatia,
        multProceso,
        multMora,
        multiplicadorFinal,
        comisionFinal,
        infoCantidad
    };
}

/**
 * Genera sugerencias personalizadas para mejorar la comisión
 * @param {Object} datos - Datos calculados del sistema
 * @returns {string} HTML con las sugerencias
 */
function generarSugerencias(datos) {
    const config = window.systemConfig || CONFIG;
    let sugerencias = [];
    
    // Obtener valores actuales
    const montoInterno = getNumericValue('montoInterno');
    const montoExterno = getNumericValue('montoExterno');
    const montoRecuperado = getNumericValue('montoRecuperado');
    const cantidad = getNumericValue('cantidadDesembolsos');
    const conversion = parseFloat(document.getElementById('conversion').value) || 0;
    const empatia = parseFloat(document.getElementById('empatia').value) || 0;
    const proceso = parseFloat(document.getElementById('proceso').value) || 0;
    const mora = parseFloat(document.getElementById('mora').value) || 0;
    
    // Sugerencias de metas
    if (datos.nivelInterno < 5) {
        const siguienteNivel = datos.nivelInterno + 1;
        const metaFaltante = config.metas.montoInterno[siguienteNivel] - montoInterno;
        const premioAdicional = config.pagos.montoInterno[siguienteNivel] - config.pagos.montoInterno[datos.nivelInterno];
        if (metaFaltante > 0) {
            sugerencias.push(`📈 <strong>Monto Interno:</strong> Te faltan ${formatNumber(metaFaltante)} para ${config.niveles[siguienteNivel]} (+${formatNumber(premioAdicional)} Gs)`);
        }
    }
    
    if (datos.nivelExterno < 5) {
        const siguienteNivel = datos.nivelExterno + 1;
        const metaFaltante = config.metas.montoExterno[siguienteNivel] - montoExterno;
        const premioAdicional = config.pagos.montoExterno[siguienteNivel] - config.pagos.montoExterno[datos.nivelExterno];
        if (metaFaltante > 0) {
            sugerencias.push(`💎 <strong>Monto Externo:</strong> Te faltan ${formatNumber(metaFaltante)} para ${config.niveles[siguienteNivel]} (+${formatNumber(premioAdicional)} Gs)`);
        }
    }
    
    if (datos.nivelRecuperado < 5) {
        const siguienteNivel = datos.nivelRecuperado + 1;
        const metaFaltante = config.metas.montoRecuperado[siguienteNivel] - montoRecuperado;
        const premioAdicional = config.pagos.montoRecuperado[siguienteNivel] - config.pagos.montoRecuperado[datos.nivelRecuperado];
        if (metaFaltante > 0) {
            sugerencias.push(`🔄 <strong>Recuperados:</strong> Te faltan ${formatNumber(metaFaltante)} para ${config.niveles[siguienteNivel]} (+${formatNumber(premioAdicional)} Gs)`);
        }
    }
    
    if (datos.nivelCantidad < 5) {
        const siguienteNivel = datos.nivelCantidad + 1;
        const metaFaltante = config.metas.cantidad[siguienteNivel] - cantidad;
        const premioAdicional = config.pagos.cantidad[siguienteNivel] - config.pagos.cantidad[datos.nivelCantidad];
        if (metaFaltante > 0) {
            sugerencias.push(`🎯 <strong>Cantidad:</strong> Te faltan ${metaFaltante} desembolsos para ${config.niveles[siguienteNivel]} (+${formatNumber(premioAdicional)} Gs)`);
        }
    }
    
    // Sugerencias de multiplicadores
    const multiplicadores = [
        {tipo: 'conversion', valor: conversion, label: 'Conversión'},
        {tipo: 'empatia', valor: empatia, label: 'Empatía'},
        {tipo: 'proceso', valor: proceso, label: 'Proceso'},
        {tipo: 'mora', valor: mora, label: 'Mora'}
    ];
    
    multiplicadores.forEach(mult => {
        const multActual = calcularMultiplicador(mult.tipo, mult.valor);
        if (multActual < 1.0) {
            const valorOptimo = encontrarValorOptimo(mult.tipo);
            sugerencias.push(`⭐ <strong>${mult.label}:</strong> Mejora a ${valorOptimo}% para multiplicador óptimo (actual: ${Math.round(multActual * 100)}%)`);
        }
    });
    
    // Sugerencia de llave semanal
    const menorSemana = getNumericValue('menorSemana');
    if (menorSemana < 2 && cantidad >= 6) {
        sugerencias.push(`🔑 <strong>Llave Semanal:</strong> Necesitas 2+ desembolsos/semana para habilitar el premio cantidad`);
    }
    
    if (sugerencias.length === 0) {
        sugerencias.push(`🎉 <strong>¡Excelente!</strong> Estás optimizado. Mantén el rendimiento para maximizar tu comisión.`);
    }
    
    return sugerencias.join('<br>');
}

/**
 * Calcula el máximo subtotal posible dinámicamente
 * @returns {number} Máximo subtotal posible
 */
function calcularMaximoSubtotal() {
    const config = window.systemConfig || CONFIG;
    return config.base + 
           config.pagos.carrera[5] + 
           config.pagos.montoInterno[5] + 
           config.pagos.montoExterno[5] + 
           config.pagos.montoRecuperado[5] + 
           config.pagos.cantidad[5] + 
           config.pagos.equipo[5];
}

/**
 * Calcula el multiplicador combinado de todos los factores
 * @param {number} conversion - Porcentaje de conversión
 * @param {number} empatia - Porcentaje de empatía
 * @param {number} proceso - Porcentaje de proceso
 * @param {number} mora - Porcentaje de mora
 * @returns {Object} Información detallada de los multiplicadores
 */
function calcularMultiplicadorCombinado(conversion, empatia, proceso, mora) {
    const multConversion = calcularMultiplicador('conversion', conversion);
    const multEmpatia = calcularMultiplicador('empatia', empatia);
    const multProceso = calcularMultiplicador('proceso', proceso);
    const multMora = calcularMultiplicador('mora', mora);
    
    const multiplicadorFinal = multConversion * multEmpatia * multProceso * multMora;
    
    return {
        conversion: multConversion,
        empatia: multEmpatia,
        proceso: multProceso,
        mora: multMora,
        final: multiplicadorFinal,
        porcentaje: Math.round(multiplicadorFinal * 100)
    };
}

// Exportar funciones para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calcularMultiplicador,
        encontrarValorOptimo,
        establecerValoresOptimos,
        updateCantidadConLlave,
        computeBonuses,
        generarSugerencias,
        calcularMaximoSubtotal,
        calcularMultiplicadorCombinado
    };
}