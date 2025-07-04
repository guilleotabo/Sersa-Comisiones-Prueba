/* ========================================
   INTERFAZ DE USUARIO - SISTEMA COMISIONES
   Manipulación del DOM y elementos visuales
   ======================================== */

/**
 * Actualiza las barras de progreso clickeables
 * @param {string} tipo - Tipo de barra (interno, externo, recuperado, cantidad)
 * @param {number} valor - Valor actual
 * @param {string} containerId - ID del contenedor de la barra
 * @param {string} infoId - ID del elemento de información
 * @returns {number} Nivel alcanzado
 */
function updateProgressBar(tipo, valor, containerId, infoId) {
    const config = window.systemConfig || CONFIG;
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
    
    // Crear segmentos clickeables
    let html = '<div class="progress-segments">';
    let nivelAlcanzado = -1;
    
    for (let i = 0; i < config.niveles.length; i++) {
        const alcanzado = valor >= metas_array[i];
        if (alcanzado) nivelAlcanzado = i;
        
        let className = 'progress-segment';
        if (alcanzado) className += ' reached';
        if (i === nivelAlcanzado) className += ' current';
        
        const metaTexto = tipo === 'cantidad' ? metas_array[i] : formatNumber(metas_array[i]/1000000) + 'M';
        const premioTexto = formatNumber(pagos_array[i]);
        
        html += `<div class="${className}" onclick="cargarValor('${tipo}', ${metas_array[i]})" 
                 title="Click para cargar ${metaTexto}">
            <div class="level">${config.niveles[i]}</div>
            <div class="meta">Meta: ${metaTexto}</div>
            <div class="premio">Premio: ${premioTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Actualizar info
    const progreso = Math.round((valor / maxMeta) * 100);
    const nivelTexto = nivelAlcanzado >= 0 ? config.niveles[nivelAlcanzado] : 'Ninguno';
    const premioTexto = nivelAlcanzado >= 0 ? formatNumber(pagos_array[nivelAlcanzado]) : '0';
    
    info.innerHTML = `Progreso total: ${tipo === 'cantidad' ? valor : formatNumber(valor)} de ${tipo === 'cantidad' ? maxMeta : formatNumber(maxMeta)} (${progreso}%)<br>
                     Nivel alcanzado: <strong>${nivelTexto}</strong> | Premio: <strong>${premioTexto} Gs</strong>`;
    
    return nivelAlcanzado;
}

/**
 * Carga un valor en el input correspondiente al hacer click en una barra
 * @param {string} tipo - Tipo de valor (interno, externo, recuperado, cantidad)
 * @param {number} valor - Valor a cargar
 */
function cargarValor(tipo, valor) {
    if (tipo === 'interno') {
        document.getElementById('montoInterno').value = formatNumber(valor);
        document.getElementById('montoInterno').classList.add('filled');
        document.getElementById('montoInterno').classList.remove('empty');
    } else if (tipo === 'externo') {
        document.getElementById('montoExterno').value = formatNumber(valor);
        document.getElementById('montoExterno').classList.add('filled');
        document.getElementById('montoExterno').classList.remove('empty');
    } else if (tipo === 'recuperado') {
        document.getElementById('montoRecuperado').value = formatNumber(valor);
        document.getElementById('montoRecuperado').classList.add('filled');
        document.getElementById('montoRecuperado').classList.remove('empty');
    } else if (tipo === 'cantidad') {
        document.getElementById('cantidadDesembolsos').value = valor;
        document.getElementById('cantidadDesembolsos').classList.add('filled');
        document.getElementById('cantidadDesembolsos').classList.remove('empty');
    }
    updateCalculations();
}

/**
 * Actualiza la barra de carrera
 * @param {number} nivelCarrera - Nivel de carrera alcanzado
 * @returns {number} Premio de carrera correspondiente
 */
function updateCarreraBar(nivelCarrera) {
    const config = window.systemConfig || CONFIG;
    const container = document.getElementById('barraCarrera');
    const info = document.getElementById('infoCarrera');
    
    // Crear segmentos
    let html = '<div class="progress-segments">';
    
    for (let i = 0; i < config.niveles.length; i++) {
        let className = 'progress-segment';
        
        // Marcar nivel actual y anteriores
        if (i <= nivelCarrera && nivelCarrera >= 0) {
            className += ' reached';
        }
        if (i === nivelCarrera) {
            className += ' current';
        }
        
        const premio = config.pagos.carrera[i];
        const premioTexto = premio > 0 ? formatNumber(premio) : '0';
        
        html += `<div class="${className}" style="${i < 2 ? 'opacity: 0.5;' : ''}">
            <div class="level">${config.niveles[i]}</div>
            <div class="premio">Premio: ${premioTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Actualizar info
    const nivelTexto = nivelCarrera >= 0 ? config.niveles[nivelCarrera] : 'Sin carrera';
    const premioCarrera = nivelCarrera >= 0 ? config.pagos.carrera[nivelCarrera] : 0;
    
    info.innerHTML = `Tu nivel de carrera: <strong>${nivelTexto}</strong> | 
                     Premio: <strong>${formatNumber(premioCarrera)} Gs</strong><br>
                     <span class="text-muted">Definido por el menor nivel de los últimos 2 meses</span>`;
    
    return premioCarrera;
}

/**
 * Actualiza la barra de equipo
 * @param {number} nivelEquipo - Nivel del equipo
 * @param {number} nivelCarrera - Nivel de carrera del asesor
 * @returns {number} Premio de equipo correspondiente
 */
function updateEquipoBar(nivelEquipo, nivelCarrera) {
    const config = window.systemConfig || CONFIG;
    const container = document.getElementById('barraEquipo');
    const info = document.getElementById('infoEquipo');
    const requisitos = document.getElementById('equipoRequisitos');
    
    // Crear segmentos
    let html = '<div class="progress-segments">';
    
    for (let i = 0; i < config.niveles.length; i++) {
        let className = 'progress-segment';
        
        // Solo marcar si cumple requisitos
        if (i <= nivelEquipo && nivelCarrera >= 2) {
            className += ' reached';
        }
        if (i === nivelEquipo && nivelCarrera >= 2) {
            className += ' current';
        }
        
        const premio = config.pagos.equipo[i];
        const premioTexto = premio > 0 ? formatNumber(premio) : '0';
        
        html += `<div class="${className}" style="${i < 2 ? 'opacity: 0.5;' : ''}">
            <div class="level">${config.niveles[i]}</div>
            <div class="premio">Premio: ${premioTexto}</div>
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    
    // Calcular premio (solo si califica)
    let premioEquipo = 0;
    if (nivelCarrera >= 2 && nivelEquipo >= 2) {
        premioEquipo = config.pagos.equipo[nivelEquipo] || 0;
    }
    
    // Actualizar info
    const nivelTexto = config.niveles[nivelEquipo] || 'Sin equipo';
    const requisitoTexto = nivelCarrera >= 2 ? 'cumples requisitos' : 'necesitas Senior A+';
    
    info.innerHTML = `Menor nivel del equipo: <strong>${nivelTexto}</strong> | 
                     Premio: <strong>${formatNumber(premioEquipo)} Gs</strong><br>
                     <span class="text-muted">Tu carrera: ${config.niveles[nivelCarrera] || 'Sin carrera'} - ${requisitoTexto}</span>`;
    
    // Actualizar mensaje de requisitos
    if (requisitos) {
        if (nivelCarrera < 2) {
            requisitos.style.display = 'block';
            requisitos.innerHTML = '⚠️ Necesitas estar en Senior A+ para cobrar premio equipo';
        } else {
            requisitos.style.display = 'none';
        }
    }
    
    return premioEquipo;
}

/**
 * Actualiza la barra de subtotal
 * @param {number} subtotal - Subtotal calculado
 */
function updateSubtotalBar(subtotal) {
    const config = window.systemConfig || CONFIG;
    const maxSubtotal = calcularMaximoSubtotal();
    const fill = document.getElementById('subtotalFill');
    const texto = document.getElementById('subtotalMonto');
    
    const porcentaje = Math.min((subtotal / maxSubtotal) * 100, 100);
    
    if (fill) {
        fill.style.width = `${porcentaje}%`;
        
        // Cambiar color según el progreso
        if (porcentaje >= 80) {
            fill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
        } else if (porcentaje >= 60) {
            fill.style.background = 'linear-gradient(90deg, #FF9800, #FFC107)';
        } else {
            fill.style.background = 'linear-gradient(90deg, #f44336, #FF5722)';
        }
    }
    
    if (texto) {
        texto.textContent = formatNumber(subtotal) + ' Gs';
    }
}

/**
 * Actualiza las tablas de multiplicadores clickeables
 */
function updateMultiplicadorTables() {
    const conversion = parseFloat(document.getElementById('conversion').value) || 0;
    const empatia = parseFloat(document.getElementById('empatia').value) || 0;
    const proceso = parseFloat(document.getElementById('proceso').value) || 0;
    const mora = parseFloat(document.getElementById('mora').value) || 0;
    
    const config = window.systemConfig || CONFIG;
    const container = document.getElementById('multiplicadorTables');
    let html = '';
    
    // Tabla Conversión
    const multConv = calcularMultiplicador('conversion', conversion);
    let classConv = 'multiplier-table';
    if (multConv >= 0.9) classConv += ' good';
    else if (multConv >= 0.7) classConv += ' warning';
    else if (multConv > 0) classConv += ' danger';
    
    html += `<div class="${classConv}">
        <div class="multiplier-title">Conversión</div>`;
    
    for (let i = 0; i < config.multiplicadores.conversion.length; i++) {
        const item = config.multiplicadores.conversion[i];
        const nextItem = config.multiplicadores.conversion[i - 1];
        const active = conversion >= item.min && (!nextItem || conversion < nextItem.min);
        html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                 onclick="cargarMultiplicador('conversion', ${item.min === 0 ? 3 : item.min})"
                 title="Click para cargar ${item.min === 0 ? 3 : item.min}%">
            <span>${item.text}</span>
            <span>→ ${Math.round(item.mult * 100)}%</span>
        </div>`;
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
    
    for (let i = 0; i < config.multiplicadores.empatia.length; i++) {
        const item = config.multiplicadores.empatia[i];
        const nextItem = config.multiplicadores.empatia[i - 1];
        const active = empatia >= item.min && (!nextItem || empatia < nextItem.min);
        html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                 onclick="cargarMultiplicador('empatia', ${item.min === 0 ? 69 : item.min})"
                 title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
            <span>${item.text}</span>
            <span>→ ${Math.round(item.mult * 100)}%</span>
        </div>`;
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
    
    for (let i = 0; i < config.multiplicadores.proceso.length; i++) {
        const item = config.multiplicadores.proceso[i];
        const nextItem = config.multiplicadores.proceso[i - 1];
        const active = proceso >= item.min && (!nextItem || proceso < nextItem.min);
        html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                 onclick="cargarMultiplicador('proceso', ${item.min === 0 ? 69 : item.min})"
                 title="Click para cargar ${item.min === 0 ? 69 : item.min}%">
            <span>${item.text}</span>
            <span>→ ${Math.round(item.mult * 100)}%</span>
        </div>`;
    }
    html += `<div class="multiplier-current">Tu valor: ${proceso || '-'}%</div>
    </div>`;
    
    // Tabla Mora
    const multMora = calcularMultiplicador('mora', mora);
    let classMora = 'multiplier-table';
    if (multMora >= 1.0) classMora += ' good';
    else if (multMora >= 0.8) classMora += ' warning';
    else if (multMora > 0) classMora += ' danger';
    
    html += `<div class="${classMora}">
        <div class="multiplier-title">Mora</div>`;
    
    for (let i = 0; i < config.multiplicadores.mora.length; i++) {
        const item = config.multiplicadores.mora[i];
        const nextItem = config.multiplicadores.mora[i + 1];
        const active = (mora >= item.min && (!nextItem || mora < nextItem.min));
        
        html += `<div class="multiplier-row ${active ? 'active' : ''}" 
                 onclick="cargarMultiplicador('mora', ${item.min === 0 ? 1 : item.min})"
                 title="Click para cargar ${item.min === 0 ? 1 : item.min}%">
            <span>${item.text}</span>
            <span>→ ${Math.round(item.mult * 100)}%</span>
        </div>`;
    }
    html += `<div class="multiplier-current">Tu valor: ${mora || '-'}%</div>
    </div>`;
    
    container.innerHTML = html;
    
    // Actualizar cálculo combinado
    const multiplicadorFinal = multConv * multEmp * multProc * multMora;
    const calcContainer = document.getElementById('multiplicadorCalc');
    if (calcContainer) {
        calcContainer.innerHTML = `Cálculo: ${Math.round(multConv * 100)}% × ${Math.round(multEmp * 100)}% × ${Math.round(multProc * 100)}% × ${Math.round(multMora * 100)}% = ${Math.round(multiplicadorFinal * 100)}%`;
    }
}

/**
 * Carga un multiplicador al hacer click
 * @param {string} tipo - Tipo de multiplicador
 * @param {number} valor - Valor a cargar
 */
function cargarMultiplicador(tipo, valor) {
    const input = document.getElementById(tipo);
    if (input) {
        input.value = valor;
        input.classList.add('filled');
        input.classList.remove('empty');
        updateCalculations();
    }
}

/**
 * Actualiza las estadísticas en el panel superior
 * @param {Object} datos - Datos calculados
 */
function updateTopStats(datos) {
    const config = window.systemConfig || CONFIG;
    
    const statNivel = document.getElementById('statNivel');
    const statSubtotal = document.getElementById('statSubtotal');
    const statMulti = document.getElementById('statMulti');
    const statComision = document.getElementById('statComision');
    
    if (statNivel) {
        const nivelTexto = datos.nivelCarrera >= 0 ? config.niveles[datos.nivelCarrera] : 'Sin carrera';
        statNivel.textContent = nivelTexto;
    }
    
    if (statSubtotal) {
        statSubtotal.textContent = formatNumber(datos.subtotal) + ' Gs';
    }
    
    if (statMulti) {
        statMulti.textContent = Math.round(datos.multiplicadorFinal * 100) + '%';
    }
    
    if (statComision) {
        statComision.textContent = formatNumber(datos.comisionFinal) + ' Gs';
    }
}

/**
 * Actualiza los campos de cálculo detallado
 * @param {Object} datos - Datos calculados
 */
function updateCalculationFields(datos) {
    const config = window.systemConfig || CONFIG;
    
    // Actualizar campos de cálculo
    const campos = {
        'calcBase': config.base,
        'calcCarrera': datos.premioCarrera,
        'calcInterno': datos.premioInterno,
        'calcExterno': datos.premioExterno,
        'calcRecuperado': datos.premioRecuperado,
        'calcCantidad': datos.premioCantidad,
        'calcEquipo': datos.premioEquipo,
        'calcSubtotal': datos.subtotal,
        'calcMultiplicador': Math.round(datos.multiplicadorFinal * 100) + '%',
        'totalComision': datos.comisionFinal
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const element = document.getElementById(id);
        if (element) {
            if (typeof valor === 'number') {
                element.textContent = formatNumber(valor) + ' Gs';
            } else {
                element.textContent = valor;
            }
        }
    });
    
    // Actualizar información de llave cantidad
    const cantidadLlaveInfo = document.getElementById('cantidadLlaveInfo');
    if (cantidadLlaveInfo) {
        const llaveTexto = datos.infoCantidad.llaveHabilitada ? '(✅ Llave)' : '(❌ Sin llave)';
        cantidadLlaveInfo.textContent = llaveTexto;
    }
}

/**
 * Actualiza las sugerencias personalizadas
 * @param {Object} datos - Datos calculados
 */
function updateSugerencias(datos) {
    const sugerenciasContainer = document.getElementById('sugerencias');
    if (sugerenciasContainer) {
        const sugerenciasHTML = generarSugerencias(datos);
        sugerenciasContainer.innerHTML = sugerenciasHTML;
    }
}

/**
 * Alterna la visibilidad del sidebar
 */
function toggleSidebar() {
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const openBtn = document.getElementById('openSidebarBtn');
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    
    if (leftPanel && rightPanel) {
        if (leftPanel.style.display === 'none') {
            // Mostrar sidebar
            leftPanel.style.display = 'block';
            rightPanel.style.marginLeft = '0';
            if (openBtn) openBtn.style.display = 'none';
            if (toggleBtn) toggleBtn.innerHTML = '⬅️ Ocultar';
        } else {
            // Ocultar sidebar
            leftPanel.style.display = 'none';
            rightPanel.style.marginLeft = '20px';
            if (openBtn) openBtn.style.display = 'block';
            if (toggleBtn) toggleBtn.innerHTML = '➡️ Mostrar';
        }
    }
}

/**
 * Actualiza todos los cálculos y elementos visuales
 */
function updateCalculations() {
    // Obtener valores del formulario
    const values = {
        nivelAnterior: parseInt(document.getElementById('nivelAnterior').value) || 0,
        nivelEquipo: parseInt(document.getElementById('nivelEquipo').value) || 0,
        montoInterno: getNumericValue('montoInterno'),
        montoExterno: getNumericValue('montoExterno'),
        montoRecuperado: getNumericValue('montoRecuperado'),
        cantidadDesembolsos: getNumericValue('cantidadDesembolsos'),
        menorSemana: getNumericValue('menorSemana'),
        conversion: parseFloat(document.getElementById('conversion').value) || 0,
        empatia: parseFloat(document.getElementById('empatia').value) || 0,
        proceso: parseFloat(document.getElementById('proceso').value) || 0,
        mora: parseFloat(document.getElementById('mora').value) || 0
    };
    
    // Calcular niveles por categoría
    const nivelInterno = updateProgressBar('interno', values.montoInterno, 'barraInterno', 'infoInterno');
    const nivelExterno = updateProgressBar('externo', values.montoExterno, 'barraExterno', 'infoExterno');
    const nivelRecuperado = updateProgressBar('recuperado', values.montoRecuperado, 'barraRecuperado', 'infoRecuperado');
    const nivelCantidad = updateProgressBar('cantidad', values.cantidadDesembolsos, 'barraCantidad', 'infoCantidad');
    
    const info = {
        nivelInterno,
        nivelExterno,
        nivelRecuperado,
        nivelCantidad
    };
    
    // Calcular bonos y comisiones
    const datos = computeBonuses(values, info);
    
    // Actualizar elementos visuales
    updateCarreraBar(datos.nivelCarrera);
    updateEquipoBar(values.nivelEquipo, datos.nivelCarrera);
    updateSubtotalBar(datos.subtotal);
    updateMultiplicadorTables();
    updateTopStats(datos);
    updateCalculationFields(datos);
    updateSugerencias(datos);
}

// Exportar funciones para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateProgressBar,
        cargarValor,
        updateCarreraBar,
        updateEquipoBar,
        updateSubtotalBar,
        updateMultiplicadorTables,
        cargarMultiplicador,
        updateTopStats,
        updateCalculationFields,
        updateSugerencias,
        toggleSidebar,
        updateCalculations
    };
}