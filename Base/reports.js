// Generador de Reporte Digital para Sistema de Bonos
// Función para formatear números con puntos
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function generarPDFMejorado() {
    // Función auxiliar para escapar HTML
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Función para obtener valor
    function getValue(id, prop = 'value') {
        const el = document.getElementById(id);
        return escapeHTML(el ? el[prop] : '');
    }

    // Obtener datos
    const fecha = new Date();
    const mesActual = fecha.toLocaleDateString('es-PY', { month: 'long', year: 'numeric' });
    const fechaHora = fecha.toLocaleDateString('es-PY') + ' ' + fecha.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    
    // Datos del asesor
    const nivelActual = getValue('statNivel', 'textContent');
    const comisionTotal = getValue('totalComision', 'textContent');
    const multiplicadorFinal = getValue('statMulti', 'textContent');
    const subtotal = getValue('calcSubtotal', 'textContent');
    
    // Valores para cálculos
    const montoInterno = parseInt(getValue('montoInterno').replace(/\./g, '') || '0');
    const montoExterno = parseInt(getValue('montoExterno').replace(/\./g, '') || '0');
    const montoRecuperado = parseInt(getValue('montoRecuperado').replace(/\./g, '') || '0');
    const totalDesembolsado = montoInterno + montoExterno + montoRecuperado;
    const cantidadDesembolsos = getValue('cantidadDesembolsos') || '0';
    
    // Valores de bonos para el gráfico
    const bonoBase = parseInt(getValue('calcBase', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoCarrera = parseInt(getValue('calcCarrera', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoInterno = parseInt(getValue('calcInterno', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoExterno = parseInt(getValue('calcExterno', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoRecuperado = parseInt(getValue('calcRecuperado', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoCantidad = parseInt(getValue('calcCantidad', 'textContent').replace(/[^0-9]/g, '') || '0');
    const bonoEquipo = parseInt(getValue('calcEquipo', 'textContent').replace(/[^0-9]/g, '') || '0');
    
    // Crear ventana de impresión
    const ventana = window.open('', '_blank');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Bonos - ${mesActual}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f5f7fa;
                    color: #2d3748;
                    line-height: 1.6;
                }
                
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                /* Header */
                .header {
                    background: linear-gradient(135deg, #006D77 0%, #83C5BE 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    box-shadow: 0 5px 15px rgba(0,109,119,0.2);
                }
                
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 5px;
                    font-weight: 300;
                }
                
                .header .subtitle {
                    font-size: 18px;
                    opacity: 0.9;
                }
                
                .header .date {
                    font-size: 14px;
                    opacity: 0.8;
                    margin-top: 10px;
                }
                
                /* Cards de resumen */
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .summary-card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    text-align: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .summary-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                
                .summary-card.primary {
                    background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
                    color: white;
                }
                
                .summary-card .label {
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                    margin-bottom: 8px;
                }
                
                .summary-card .value {
                    font-size: 28px;
                    font-weight: 600;
                    line-height: 1.2;
                }
                
                .summary-card .detail {
                    font-size: 14px;
                    margin-top: 5px;
                    opacity: 0.7;
                }
                
                /* Secciones */
                .section {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                
                .section-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #006D77;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                /* Barras de progreso */
                .progress-item {
                    margin-bottom: 20px;
                }
                
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                
                .progress-bar {
                    height: 24px;
                    background: #e9ecef;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #006D77 0%, #83C5BE 100%);
                    border-radius: 12px;
                    transition: width 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 10px;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .progress-fill.complete {
                    background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%);
                }
                
                .progress-fill.warning {
                    background: linear-gradient(90deg, #F57C00 0%, #FFA726 100%);
                }
                
                .progress-fill.danger {
                    background: linear-gradient(90deg, #D32F2F 0%, #F44336 100%);
                }
                
                /* Tablas mejoradas */
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                th {
                    background: #f8f9fa;
                    padding: 12px 15px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #6c757d;
                    border-bottom: 2px solid #e9ecef;
                }
                
                td {
                    padding: 15px;
                    border-bottom: 1px solid #e9ecef;
                    font-size: 14px;
                }
                
                tr:last-child td {
                    border-bottom: none;
                }
                
                tr:hover {
                    background: #f8f9fa;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                /* Estados y badges */
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .badge.success {
                    background: #E8F5E9;
                    color: #2E7D32;
                }
                
                .badge.warning {
                    background: #FFF3E0;
                    color: #F57C00;
                }
                
                .badge.danger {
                    background: #FFEBEE;
                    color: #D32F2F;
                }
                
                .badge.info {
                    background: #E3F2FD;
                    color: #1976D2;
                }
                
                /* Gráfico de torta */
                .chart-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 20px 0;
                }
                
                .chart-legend {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }
                
                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }
                
                /* Total destacado */
                .total-section {
                    background: linear-gradient(135deg, #006D77 0%, #83C5BE 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 30px 0;
                }
                
                .total-label {
                    font-size: 16px;
                    opacity: 0.9;
                    margin-bottom: 10px;
                }
                
                .total-amount {
                    font-size: 42px;
                    font-weight: 700;
                    margin: 10px 0;
                }
                
                /* Footer */
                .footer {
                    text-align: center;
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 40px;
                    padding: 20px;
                }
                
                /* Utilidades */
                .mt-3 { margin-top: 20px; }
                .mb-3 { margin-bottom: 20px; }
                .text-muted { color: #6c757d; }
                .text-success { color: #2E7D32; }
                .text-danger { color: #D32F2F; }
                .text-warning { color: #F57C00; }
                
                /* Print */
                @media print {
                    body {
                        background: white;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .container {
                        max-width: 100%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <h1>Reporte de Bonos</h1>
                    <div class="subtitle">SERSA SAECA - Sistema Comercial</div>
                    <div class="date">Período: ${mesActual}</div>
                </div>
                
                <!-- Cards de resumen -->
                <div class="summary-grid">
                    <div class="summary-card primary">
                        <div class="label">Bonos Totales</div>
                        <div class="value">${comisionTotal}</div>
                        <div class="detail">Guaraníes</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Nivel Alcanzado</div>
                        <div class="value">${nivelActual}</div>
                        <div class="detail">Este mes</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Total Desembolsado</div>
                        <div class="value">${formatNumber(totalDesembolsado)}</div>
                        <div class="detail">Gs</div>
                    </div>
                    <div class="summary-card">
                        <div class="label">Multiplicador</div>
                        <div class="value">${multiplicadorFinal}</div>
                        <div class="detail">Calidad</div>
                    </div>
                </div>
                
                <!-- Progreso de Metas -->
                <div class="section">
                    <h2 class="section-title">📊 Progreso de Metas</h2>
                    
                    <div class="progress-item">
                        <div class="progress-header">
                            <span><strong>Monto Interno</strong></span>
                            <span>${getValue('montoInterno') || '0'} Gs</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${montoInterno >= 600000000 ? 'complete' : ''}" 
                                 style="width: ${Math.min((montoInterno / 1200000000) * 100, 100)}%">
                                ${Math.round((montoInterno / 1200000000) * 100)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-item">
                        <div class="progress-header">
                            <span><strong>Monto Externo</strong></span>
                            <span>${getValue('montoExterno') || '0'} Gs</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${montoExterno >= 50000000 ? 'complete' : ''}" 
                                 style="width: ${Math.min((montoExterno / 400000000) * 100, 100)}%">
                                ${Math.round((montoExterno / 400000000) * 100)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-item">
                        <div class="progress-header">
                            <span><strong>Recuperados</strong></span>
                            <span>${getValue('montoRecuperado') || '0'} Gs</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${montoRecuperado >= 40000000 ? 'complete' : ''}" 
                                 style="width: ${Math.min((montoRecuperado / 150000000) * 100, 100)}%">
                                ${Math.round((montoRecuperado / 150000000) * 100)}%
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-item">
                        <div class="progress-header">
                            <span><strong>Cantidad Desembolsos</strong></span>
                            <span>${cantidadDesembolsos} operaciones</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${parseInt(cantidadDesembolsos) >= 6 ? 'complete' : ''}" 
                                 style="width: ${Math.min((parseInt(cantidadDesembolsos) / 13) * 100, 100)}%">
                                ${cantidadDesembolsos} / 13
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Indicadores de Calidad -->
                <div class="section">
                    <h2 class="section-title">⭐ Indicadores de Calidad</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Indicador</th>
                                <th class="text-center">Valor</th>
                                <th class="text-center">Multiplicador</th>
                                <th class="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Conversión</td>
                                <td class="text-center">${getValue('conversion') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('conversion', getValue('conversion'))}</td>
                                <td class="text-center">
                                    <span class="badge ${getMultiplicadorBadgeClass('conversion', getValue('conversion'))}">
                                        ${getMultiplicadorStatus('conversion', getValue('conversion'))}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Empatía/Mystery</td>
                                <td class="text-center">${getValue('empatia') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('empatia', getValue('empatia'))}</td>
                                <td class="text-center">
                                    <span class="badge ${getMultiplicadorBadgeClass('empatia', getValue('empatia'))}">
                                        ${getMultiplicadorStatus('empatia', getValue('empatia'))}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Proceso/CRM</td>
                                <td class="text-center">${getValue('proceso') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('proceso', getValue('proceso'))}</td>
                                <td class="text-center">
                                    <span class="badge ${getMultiplicadorBadgeClass('proceso', getValue('proceso'))}">
                                        ${getMultiplicadorStatus('proceso', getValue('proceso'))}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Mora</td>
                                <td class="text-center">${getValue('mora') || '0'}%</td>
                                <td class="text-center">${calcularMultiplicadorTexto('mora', getValue('mora'))}</td>
                                <td class="text-center">
                                    <span class="badge ${getMultiplicadorBadgeClass('mora', getValue('mora'))}">
                                        ${getMultiplicadorStatus('mora', getValue('mora'))}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Distribución de Bonos -->
                <div class="section">
                    <h2 class="section-title">💰 Distribución de Bonos</h2>
                    
                    <div class="chart-container">
                        <canvas id="pieChart" width="300" height="300"></canvas>
                    </div>
                    
                    <div class="chart-legend" id="chartLegend"></div>
                    
                    <table class="mt-3">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th class="text-right">Monto (Gs)</th>
                                <th class="text-center">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generarFilasDesglose(bonoBase, bonoCarrera, bonoInterno, bonoExterno, bonoRecuperado, bonoCantidad, bonoEquipo, subtotal)}
                        </tbody>
                    </table>
                </div>
                
                <!-- Total Final -->
                <div class="total-section">
                    <div class="total-label">BONOS TOTALES DEL MES</div>
                    <div class="total-amount">${comisionTotal}</div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Subtotal: ${subtotal} × Multiplicador: ${multiplicadorFinal}
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p>Reporte generado el ${fechaHora}</p>
                    <p>Sistema de Bonos Comerciales - SERSA SAECA</p>
                </div>
            </div>
            
            <script>
                // Dibujar gráfico de torta
                window.onload = function() {
                    const canvas = document.getElementById('pieChart');
                    const ctx = canvas.getContext('2d');
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = 120;
                    
                    // Datos del gráfico
                    const data = [
                                ${bonoBase > 0 ? `{label: 'Base Fija', value: ${bonoBase}, color: '#006D77'}` : ''},
        ${bonoCarrera > 0 ? `{label: 'Carrera', value: ${bonoCarrera}, color: '#83C5BE'}` : ''},
        ${bonoInterno > 0 ? `{label: 'Interno', value: ${bonoInterno}, color: '#4CAF50'}` : ''},
        ${bonoExterno > 0 ? `{label: 'Externo', value: ${bonoExterno}, color: '#FFA726'}` : ''},
        ${bonoRecuperado > 0 ? `{label: 'Recuperados', value: ${bonoRecuperado}, color: '#AB47BC'}` : ''},
        ${bonoCantidad > 0 ? `{label: 'Cantidad', value: ${bonoCantidad}, color: '#EF5350'}` : ''},
        ${bonoEquipo > 0 ? `{label: 'Equipo', value: ${bonoEquipo}, color: '#42A5F5'}` : ''}
                    ].filter(item => item);
                    
                    const total = data.reduce((sum, item) => sum + item.value, 0);
                    let currentAngle = -Math.PI / 2;
                    
                    // Dibujar segmentos
                    data.forEach(item => {
                        const sliceAngle = (item.value / total) * 2 * Math.PI;
                        
                        // Dibujar segmento
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                        ctx.lineTo(centerX, centerY);
                        ctx.fillStyle = item.color;
                        ctx.fill();
                        
                        // Borde blanco
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        currentAngle += sliceAngle;
                    });
                    
                    // Generar leyenda
                    const legendHTML = data.map(item => {
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return \`
                            <div class="legend-item">
                                <div class="legend-color" style="background: \${item.color}"></div>
                                <span>\${item.label} (\${percentage}%)</span>
                            </div>
                        \`;
                    }).join('');
                    
                    document.getElementById('chartLegend').innerHTML = legendHTML;
                };
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

// Función auxiliar para calcular texto del multiplicador
function calcularMultiplicadorTexto(tipo, valor) {
    const config = getConfig();
    const valorNum = parseFloat(valor) || 0;
    const tabla = config.multiplicadores[tipo];
    
    if (!tabla) return '-';
    
    let multiplicador = 0;
    if (tipo === 'mora') {
        for (let i = tabla.length - 1; i >= 0; i--) {
            if (valorNum >= tabla[i].min) {
                multiplicador = tabla[i].mult;
                break;
            }
        }
    } else {
        for (let item of tabla) {
            if (valorNum >= item.min) {
                multiplicador = item.mult;
                break;
            }
        }
    }
    
    return `${(multiplicador * 100).toFixed(0)}%`;
}

// Función para obtener clase de badge según multiplicador
function getMultiplicadorBadgeClass(tipo, valor) {
    const config = getConfig();
    const valorNum = parseFloat(valor) || 0;
    const tabla = config.multiplicadores[tipo];
    
    if (!tabla) return 'info';
    
    let multiplicador = 0;
    if (tipo === 'mora') {
        for (let i = tabla.length - 1; i >= 0; i--) {
            if (valorNum >= tabla[i].min) {
                multiplicador = tabla[i].mult;
                break;
            }
        }
    } else {
        for (let item of tabla) {
            if (valorNum >= item.min) {
                multiplicador = item.mult;
                break;
            }
        }
    }
    
    if (multiplicador >= 1) return 'success';
    if (multiplicador >= 0.8) return 'warning';
    return 'danger';
}

// Función para obtener estado del multiplicador
function getMultiplicadorStatus(tipo, valor) {
    const badgeClass = getMultiplicadorBadgeClass(tipo, valor);
    if (badgeClass === 'success') return 'Óptimo';
    if (badgeClass === 'warning') return 'Regular';
    return 'Mejorar';
}

// Función para generar filas del desglose
function generarFilasDesglose(base, carrera, interno, externo, recuperado, cantidad, equipo, subtotal) {
    const subtotalNum = parseInt(subtotal.replace(/[^0-9]/g, '') || '0');
    let html = '';
    
    const items = [
        {nombre: 'Base Fija', valor: base},
        {nombre: 'Bono Carrera', valor: carrera},
        {nombre: 'Bono Monto Interno', valor: interno},
        {nombre: 'Bono Monto Externo', valor: externo},
        {nombre: 'Bono Recuperados', valor: recuperado},
        {nombre: 'Bono Cantidad', valor: cantidad},
        {nombre: 'Bono Equipo', valor: equipo}
    ];
    
    items.forEach(item => {
        if (item.valor > 0) {
            const porcentaje = ((item.valor / subtotalNum) * 100).toFixed(1);
            html += `
                <tr>
                    <td>${item.nombre}</td>
                    <td class="text-right">${formatNumber(item.valor)} Gs</td>
                    <td class="text-center">${porcentaje}%</td>
                </tr>
            `;
        }
    });
    
    html += `
        <tr style="background: #f8f9fa; font-weight: 600;">
            <td>SUBTOTAL</td>
            <td class="text-right">${formatNumber(subtotalNum)} Gs</td>
            <td class="text-center">100%</td>
        </tr>
    `;
    
    return html;
}
