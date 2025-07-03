// Cargar configuración desde config.js o localStorage
        function getConfig() {
            const savedConfig = localStorage.getItem('comisionesConfig');
            return savedConfig ? JSON.parse(savedConfig) : CONFIG;
        }
        
        // Obtener configuración actual
        const config = getConfig();
        
        // Datos del sistema V2 con Recuperados - ahora desde config
        const niveles = config.niveles;
        const iconos = config.iconos;
        const metas = config.metas;
        const pagos = config.pagos;
        
        // Calcular máximo subtotal dinámicamente
        const MAXIMO_SUBTOTAL = config.base + 
            pagos.carrera[5] + 
            pagos.montoInterno[5] + 
            pagos.montoExterno[5] + 
            pagos.montoRecuperado[5] + 
            pagos.cantidad[5] + 
            pagos.equipo[5];
        
        // Datos de multiplicadores - ahora desde config
        const multiplicadores = config.multiplicadores;
        
        let isCalculating = false;
        
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
        
        // Verificar campos completos
        function checkRequiredFields() {
            const required = document.querySelectorAll('.required');
            for (let field of required) {
                if (!field.value) return false;
            }
            return true;
        }
        
        // Obtener valor numérico
        function getNumericValue(id) {
            const input = document.getElementById(id);
            if (!input.value) return 0;
            return parseInt(input.value.replace(/\./g, ''), 10) || 0;
        }

        function validateInput(input) {
            const id = input.id;
            let num = parseInt(input.value.replace(/\./g, ''), 10) || 0;

            if (['conversion', 'empatia', 'proceso', 'mora'].includes(id)) {
                num = Math.max(0, num); // Eliminado el Math.min(100, num)
            } else if (['cantidadDesembolsos', 'menorSemana'].includes(id)) {
                num = Math.max(0, Math.min(999, num));
            } else if (['montoInterno', 'montoExterno', 'montoRecuperado'].includes(id)) {
                num = Math.max(0, Math.min(10000000000, num));
            }

            input.value = num.toString();
        }
        
        // Calcular multiplicador
        function calcularMultiplicador(tipo, valor) {
            const tabla = multiplicadores[tipo];
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
        
        // Función para encontrar automáticamente el valor más cercano al multiplicador 1.0
        function encontrarValorOptimo(tipo) {
            const tabla = multiplicadores[tipo];
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
        
        // Función para establecer valores óptimos por defecto
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
        
        // Actualizar barra de progreso clickeable
        function updateProgressBar(tipo, valor, containerId, infoId) {
            const container = document.getElementById(containerId);
            const info = document.getElementById(infoId);
            
            let metas_array, pagos_array, maxMeta;
            if (tipo === 'interno') {
                metas_array = metas.montoInterno;
                pagos_array = pagos.montoInterno;
                maxMeta = 1200000000;
            } else if (tipo === 'externo') {
                metas_array = metas.montoExterno;
                pagos_array = pagos.montoExterno;
                maxMeta = 400000000;
            } else if (tipo === 'recuperado') {
                metas_array = metas.montoRecuperado;
                pagos_array = pagos.montoRecuperado;
                maxMeta = 150000000;
            } else if (tipo === 'cantidad') {
                metas_array = metas.cantidad;
                pagos_array = pagos.cantidad;
                maxMeta = 13;
            }
            
            // Crear segmentos clickeables
            let html = '<div class="progress-segments">';
            let nivelAlcanzado = -1;
            
            for (let i = 0; i < niveles.length; i++) {
                const alcanzado = valor >= metas_array[i];
                if (alcanzado) nivelAlcanzado = i;
                
                let className = 'progress-segment';
                if (alcanzado) className += ' reached';
                if (i === nivelAlcanzado) className += ' current';
                
                const metaTexto = tipo === 'cantidad' ? metas_array[i] : formatNumber(metas_array[i]/1000000) + 'M';
                const premioTexto = formatNumber(pagos_array[i]);
                
                html += `<div class="${className}" onclick="cargarValor('${tipo}', ${metas_array[i]})" 
                         title="Click para cargar ${metaTexto}">
                    <div class="level">${niveles[i]}</div>
                    <div class="meta">Meta: ${metaTexto}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const progreso = Math.round((valor / maxMeta) * 100);
            const nivelTexto = nivelAlcanzado >= 0 ? niveles[nivelAlcanzado] : 'Ninguno';
            const premioTexto = nivelAlcanzado >= 0 ? formatNumber(pagos_array[nivelAlcanzado]) : '0';
            
            info.innerHTML = `Progreso total: ${tipo === 'cantidad' ? valor : formatNumber(valor)} de ${tipo === 'cantidad' ? maxMeta : formatNumber(maxMeta)} (${progreso}%)<br>
                             Nivel alcanzado: <strong>${nivelTexto}</strong> | Premio: <strong>${premioTexto} Gs</strong>`;
            
            return nivelAlcanzado;
        }
        
        // Cargar valor al hacer click
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
        
        // Actualizar barra de carrera
        function updateCarreraBar(nivelCarrera) {
            const container = document.getElementById('barraCarrera');
            const info = document.getElementById('infoCarrera');
            
            // Crear segmentos
            let html = '<div class="progress-segments">';
            
            for (let i = 0; i < niveles.length; i++) {
                let className = 'progress-segment';
                
                // Marcar nivel actual y anteriores
                if (i <= nivelCarrera && nivelCarrera >= 0) {
                    className += ' reached';
                }
                if (i === nivelCarrera) {
                    className += ' current';
                }
                
                const premio = pagos.carrera[i];
                const premioTexto = premio > 0 ? formatNumber(premio) : '0';
                
                html += `<div class="${className}" style="${i < 2 ? 'opacity: 0.5;' : ''}">
                    <div class="level">${niveles[i]}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const nivelTexto = nivelCarrera >= 0 ? niveles[nivelCarrera] : 'Sin carrera';
            const premioCarrera = nivelCarrera >= 0 ? pagos.carrera[nivelCarrera] : 0;
            
            info.innerHTML = `Tu nivel de carrera: <strong>${nivelTexto}</strong> | 
                             Premio: <strong>${formatNumber(premioCarrera)} Gs</strong><br>
                             <span class="text-muted">Definido por el menor nivel de los últimos 2 meses</span>`;
            
            return premioCarrera;
        }
        
        // Actualizar tabla de multiplicadores clickeable
        function updateMultiplicadorTables() {
            const conversion = parseFloat(document.getElementById('conversion').value) || 0;
            const empatia = parseFloat(document.getElementById('empatia').value) || 0;
            const proceso = parseFloat(document.getElementById('proceso').value) || 0;
            const mora = parseFloat(document.getElementById('mora').value) || 0;
            
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
            
            for (let i = 0; i < multiplicadores.conversion.length; i++) {
                const item = multiplicadores.conversion[i];
                const nextItem = multiplicadores.conversion[i - 1];
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
            
            for (let i = 0; i < multiplicadores.empatia.length; i++) {
                const item = multiplicadores.empatia[i];
                const nextItem = multiplicadores.empatia[i - 1];
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
            
            for (let i = 0; i < multiplicadores.proceso.length; i++) {
                const item = multiplicadores.proceso[i];
                const nextItem = multiplicadores.proceso[i - 1];
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
            if (mora <= 2) classMora += ' good';
            else if (mora <= 7) classMora += ' warning';
            else classMora += ' danger';

            html += `<div class="${classMora}">
                <div class="multiplier-title">Mora</div>`;

            for (let i = 0; i < multiplicadores.mora.length; i++) {
                const item = multiplicadores.mora[i];
                const nextItem = multiplicadores.mora[i + 1];
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
            let moraTexto = '-';
            if (mora > 0) {
                // Encontrar el texto correcto para el valor de mora
                for (let i = multiplicadores.mora.length - 1; i >= 0; i--) {
                    const item = multiplicadores.mora[i];
                    if (mora >= item.min) {
                        moraTexto = item.text;
                        break;
                    }
                }
            }
            html += `<div class="multiplier-current">Tu valor: ${mora || '-'}${mora > 0 ? '% (' + moraTexto + ')' : ''}</div>
            </div>`;
            
            container.innerHTML = html;
            
            // Actualizar cálculo
            const totalMult = Math.max(multConv * multEmp * multProc * multMora, 0.1);
            document.getElementById('multiplicadorCalc').textContent =
                conversion && empatia && proceso && mora ?
                `Cálculo: ${multConv.toFixed(2)} × ${multEmp.toFixed(2)} × ${multProc.toFixed(2)} × ${multMora.toFixed(2)} = ${(totalMult*100).toFixed(1)}%` :
                'Completa todos los campos de calidad';
            
            return totalMult;
        }
        
        // Cargar multiplicador al hacer click
        function cargarMultiplicador(tipo, valor) {
            const input = document.getElementById(tipo);
            let finalValor = valor;
            if (tipo === 'mora') {
                const idx = multiplicadores.mora.findIndex(m => m.min === valor);
                if (idx !== -1) {
                    const next = multiplicadores.mora[idx + 1];
                    if (next) {
                        finalValor = next.min - 1; // límite superior del rango
                    } else {
                        finalValor = valor; // último rango 15%+
                    }
                }
            }
            input.value = finalValor;
            input.classList.add('filled');
            input.classList.remove('empty');
            updateCalculations();
        }
        
        // Actualizar llave de cantidad - SIMPLIFICADO
        function updateCantidadConLlave(cantidad, menorSemana) {
            const nivelCantidad = updateProgressBar('cantidad', cantidad, 'barraCantidad', 'infoCantidad');
            
            let nivelLimitado = nivelCantidad;
            let mensajeLlave = '';
            
            if (menorSemana < 2) {
                nivelLimitado = -1;
                mensajeLlave = '❌ Sin premio (requiere 2/sem)';
            } else {
                // Con 2/sem ya no hay límites
                mensajeLlave = '✅ Premio habilitado (2/sem cumplido)';
            }
            
            const info = document.getElementById('infoCantidad');
            if (mensajeLlave) {
                info.innerHTML += `<br><span class="${menorSemana >= 2 ? 'text-success' : 'text-warning'}">${mensajeLlave}</span>`;
            }
            
            return nivelLimitado;
        }
        
        // Generar sugerencias mejoradas
        function generarSugerencias(datos) {
            const container = document.getElementById('sugerencias');
            let html = '';
            
            // 1. PRIORIDAD ALTA - Tu limitante principal
            const limitantes = [];
            if (datos.nivelInterno >= 0) limitantes.push({tipo: 'Monto Interno', nivel: datos.nivelInterno});
            if (datos.nivelExterno >= 0) limitantes.push({tipo: 'Monto Externo', nivel: datos.nivelExterno});
            if (datos.nivelRecuperado >= 0) limitantes.push({tipo: 'Recuperados', nivel: datos.nivelRecuperado});
            if (datos.nivelCantidadReal >= 0) limitantes.push({tipo: 'Cantidad', nivel: datos.nivelCantidadReal});
            
            if (limitantes.length > 0) {
                const limitante = limitantes.reduce((min, curr) => curr.nivel < min.nivel ? curr : min);
                if (limitante.nivel < 5) {
                    const siguienteNivel = niveles[limitante.nivel + 1];
                    const diferenciaPremio = pagos.carrera[limitante.nivel + 1] - pagos.carrera[limitante.nivel];
                    
                    html += `<div class="suggestion-category high-priority">
                        <div class="suggestion-category-title">🚨 Tu Limitante Principal</div>
                        <div class="suggestion-item">Tu ${limitante.tipo} (${niveles[limitante.nivel]}) limita tu carrera. 
                        Alcanzando ${siguienteNivel} en este indicador sumarías ${formatNumber(diferenciaPremio)} Gs en premio carrera.</div>
                    </div>`;
                }
            }
            
            // 2. OPORTUNIDADES RÁPIDAS
            const oportunidades = [];
            
            // Monto Interno
            if (datos.nivelInterno < 5) {
                const falta = metas.montoInterno[datos.nivelInterno + 1] - datos.montoInterno;
                const porcentaje = (falta / metas.montoInterno[datos.nivelInterno + 1]) * 100;
                if (porcentaje <= 20) {
                    const bonusExtra = pagos.montoInterno[datos.nivelInterno + 1] - pagos.montoInterno[datos.nivelInterno];
                    oportunidades.push(`¡Estás a solo ${formatNumber(falta)} de ${niveles[datos.nivelInterno + 1]} en Interno! (+${formatNumber(bonusExtra)} Gs)`);
                }
            }
            
            // Cantidad
            if (datos.nivelCantidadReal < 5) {
                const falta = metas.cantidad[datos.nivelCantidadReal + 1] - datos.cantidad;
                if (falta <= 2) {
                    const bonusExtra = pagos.cantidad[datos.nivelCantidadReal + 1] - pagos.cantidad[datos.nivelCantidadReal];
                    oportunidades.push(`¡Estás a solo ${falta} desembolsos de ${niveles[datos.nivelCantidadReal + 1]}! (+${formatNumber(bonusExtra)} Gs)`);
                }
            }
            
            if (oportunidades.length > 0) {
                html += `<div class="suggestion-category quick-wins">
                    <div class="suggestion-category-title">💰 Oportunidades Rápidas</div>`;
                oportunidades.forEach(op => {
                    html += `<div class="suggestion-item">${op}</div>`;
                });
                html += `</div>`;
            }
            
            // 3. MEJORAS DE MULTIPLICADORES
            const multiplicadoresData = [
                {tipo: 'conversion', valor: datos.conversion, mult: datos.multiConversion, objetivo: 8, nombre: 'Conversión'},
                {tipo: 'empatia', valor: datos.empatia, mult: datos.multiEmpatia, objetivo: 96, nombre: 'Empatía'},
                {tipo: 'proceso', valor: datos.proceso, mult: datos.multiProceso, objetivo: 95, nombre: 'Proceso'}
            ];
            
            // Encontrar el multiplicador más bajo
            const peorMultiplicador = multiplicadoresData.reduce((min, curr) => 
                curr.mult < min.mult ? curr : min
            );
            
            if (peorMultiplicador.mult < 1) {
                const multObjetivo = calcularMultiplicador(peorMultiplicador.tipo, peorMultiplicador.objetivo);
                const mejora = Math.round(datos.subtotal * (multObjetivo - peorMultiplicador.mult) * 
                    (peorMultiplicador.tipo === 'conversion' ? datos.multiEmpatia * datos.multiProceso :
                     peorMultiplicador.tipo === 'empatia' ? datos.multiConversion * datos.multiProceso :
                     datos.multiConversion * datos.multiEmpatia));
                
                html += `<div class="suggestion-category multipliers">
                    <div class="suggestion-category-title">⚡ Mejora de Multiplicadores</div>
                    <div class="suggestion-item">Tu ${peorMultiplicador.nombre} (${peorMultiplicador.valor}%) es tu punto débil. 
                    Subirla a ${peorMultiplicador.objetivo}% aumentaría tu comisión en ${formatNumber(mejora)} Gs.</div>
                </div>`;
            }
            
            // 4. OBJETIVOS MOTIVACIONALES
            const objetivos = [];
            
            // Proyección de carrera
            if (datos.nivelCarreraActualMes > datos.nivelCarrera) {
                const diferencia = pagos.carrera[datos.nivelCarreraActualMes] - pagos.carrera[datos.nivelCarrera];
                objetivos.push(`Si mantenés ${niveles[datos.nivelCarreraActualMes]} por 2 meses → +${formatNumber(diferencia)} Gs en carrera el próximo mes`);
            }
            
            // Proyección de nivel completo
            const nivelObjetivo = Math.min(datos.nivelCarrera + 1, 5);
            if (nivelObjetivo > datos.nivelCarrera) {
                const totalObjetivo = config.base + pagos.carrera[nivelObjetivo] + 
                    pagos.montoInterno[nivelObjetivo] + pagos.montoExterno[nivelObjetivo] + 
                    pagos.montoRecuperado[nivelObjetivo] + pagos.cantidad[nivelObjetivo] + 
                    (nivelObjetivo >= 3 ? pagos.equipo[nivelObjetivo] : 0);
                objetivos.push(`Alcanzando todos los ${niveles[nivelObjetivo]} este mes = ${formatNumber(totalObjetivo)} Gs de comisión base`);
            }
            
            if (objetivos.length > 0) {
                html += `<div class="suggestion-category goals">
                    <div class="suggestion-category-title">🎯 Objetivos Motivacionales</div>`;
                objetivos.forEach(obj => {
                    html += `<div class="suggestion-item">${obj}</div>`;
                });
                html += `</div>`;
            }
            
            // 5. ALERTAS
            const alertas = [];
            
            // Llave semanal
            if (datos.menorSemana < 2 && datos.cantidad >= 6) {
                alertas.push(`Sin 2/sem no cobrás premio cantidad (perdés ${formatNumber(datos.bonusCantidadPotencial)} Gs)`);
            }
            
            // Llave montos
            if (!datos.cumpleLlaveMonto && datos.nivelInterno >= 0) {
                alertas.push(
                    `Te faltan ${6 - datos.cantidad} desembolsos para activar premios de montos (int/ext/rec)`
                );
            }

            if (datos.mora > 10) {
                alertas.push('❗ Mora crítica: revisa tu cartera de clientes');
            }
            
            if (alertas.length > 0) {
                html += `<div class="suggestion-category alerts">
                    <div class="suggestion-category-title">⚠️ Alertas</div>`;
                alertas.forEach(alerta => {
                    html += `<div class="suggestion-item">${alerta}</div>`;
                });
                html += `</div>`;
            }
            
            container.innerHTML = html || '<div class="suggestion-item">¡Excelente trabajo! Estás optimizando todos tus indicadores.</div>';
        }
        
        // Actualizar barra de equipo
        function updateEquipoBar(nivelEquipo, nivelCarrera) {
            const container = document.getElementById('barraEquipo');
            const info = document.getElementById('infoEquipo');
            const requisitos = document.getElementById('equipoRequisitos');
            
            // Crear segmentos
            let html = '<div class="progress-segments">';
            
            for (let i = 0; i < niveles.length; i++) {
                let className = 'progress-segment';
                
                // Marcar el nivel del equipo
                if (i === nivelEquipo) {
                    className += ' current';
                }
                
                // Los primeros 3 niveles no tienen premio
                const premio = pagos.equipo[i];
                const premioTexto = premio > 0 ? formatNumber(premio) : '0';
                
                html += `<div class="${className}" style="${i < 3 ? 'opacity: 0.5;' : ''}">
                    <div class="level">${niveles[i]}</div>
                    <div class="premio">Premio: ${premioTexto}</div>
                </div>`;
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Actualizar info
            const equipoTexto = niveles[nivelEquipo];
            const cumpleRequisito = nivelCarrera >= 2 && nivelEquipo >= 2;
            const bonusEquipo = cumpleRequisito ? pagos.equipo[nivelEquipo] : 0;
            
            info.innerHTML = `Menor nivel del equipo: <strong>${equipoTexto}</strong> | 
                             Tu nivel: <strong>${niveles[nivelCarrera]}</strong> | 
                             Premio: <strong>${formatNumber(bonusEquipo)} Gs</strong>`;
            
            // Actualizar mensaje de requisitos
            if (nivelCarrera < 2) {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '⚠️ Necesitas estar en Senior A+ para cobrar premio equipo';
                requisitos.style.background = '#FFF3E0';
            } else if (nivelEquipo < 2) {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '⚠️ El equipo necesita estar en Senior A+ para activar premio';
                requisitos.style.background = '#FFF3E0';
            } else {
                requisitos.style.display = 'block';
                requisitos.innerHTML = '✅ Premio equipo activado';
                requisitos.style.background = '#E8F5E9';
                requisitos.style.color = '#2E7D32';
            }
            
            return bonusEquipo;
        }
        
        // Actualizar barra de subtotal
        function updateSubtotalBar(subtotal) {
            const fill = document.getElementById('subtotalFill');
            const montoText = document.getElementById('subtotalMonto');
            const maxDisplay = document.querySelector('.subtotal-text strong:last-child');
            
            const porcentaje = Math.min((subtotal / MAXIMO_SUBTOTAL) * 100, 100);
            
            // Definir el gradiente según el porcentaje
            let gradiente;
            if (porcentaje < 25) {
                gradiente = 'linear-gradient(90deg, #F44336 0%, #FF9800 100%)';
            } else if (porcentaje < 50) {
                gradiente = 'linear-gradient(90deg, #FF9800 0%, #FFC107 100%)';
            } else if (porcentaje < 75) {
                gradiente = 'linear-gradient(90deg, #FFC107 0%, #8BC34A 100%)';
            } else {
                gradiente = 'linear-gradient(90deg, #8BC34A 0%, #4CAF50 100%)';
            }
            
            fill.style.width = porcentaje + '%';
            fill.style.background = gradiente;
            fill.innerHTML = `<span style="font-size: 16px;">${porcentaje.toFixed(1)}%</span>`;
            
            montoText.textContent = formatNumber(subtotal) + ' Gs';
            if (maxDisplay) {
                maxDisplay.textContent = formatNumber(MAXIMO_SUBTOTAL) + ' Gs';
            }
            const statSubtotal = document.getElementById('statSubtotal');
            if (statSubtotal) statSubtotal.textContent = formatNumber(subtotal) + ' Gs';
        }

       function toggleSidebar() {
           const panel = document.querySelector('.left-panel');
           const btn = document.getElementById('toggleSidebarBtn');
            const openBtn = document.getElementById('openSidebarBtn');
            if (panel.classList.contains('collapsed')) {
                panel.classList.remove('collapsed');
                btn.textContent = '⬅️ Ocultar';
                if (openBtn) openBtn.style.display = 'none';
            } else {
                panel.classList.add('collapsed');
                btn.textContent = '➡️ Mostrar';
                if (openBtn) openBtn.style.display = 'block';
            }
        }
        
        
        // Cálculo principal
        function updateFields(values) {
            const menorSemanaInput = document.getElementById('menorSemana');
            const menorSemanaVal = parseInt(menorSemanaInput.value, 10) || 0;
            if (menorSemanaVal >= 2) {
                menorSemanaInput.classList.add('filled');
                menorSemanaInput.classList.remove('empty');
            } else {
                menorSemanaInput.classList.remove('filled');
                menorSemanaInput.classList.add('empty');
            }
        
            const nivelInterno = updateProgressBar('interno', values.montoInterno, 'barraInterno', 'infoInterno');
            const nivelExterno = updateProgressBar('externo', values.montoExterno, 'barraExterno', 'infoExterno');
            const nivelRecuperado = updateProgressBar('recuperado', values.montoRecuperado, 'barraRecuperado', 'infoRecuperado');
            const nivelCantidadReal = updateProgressBar('cantidad', values.cantidad, 'barraCantidad', 'infoCantidad');
            const nivelCantidadLimitado = updateCantidadConLlave(values.cantidad, values.menorSemana);
        
            let nivelesAlcanzadosActual = [];
            if (nivelInterno >= 0) nivelesAlcanzadosActual.push(nivelInterno);
            if (nivelExterno >= 0) nivelesAlcanzadosActual.push(nivelExterno);
            if (nivelRecuperado >= 0) nivelesAlcanzadosActual.push(nivelRecuperado);
            if (nivelCantidadReal >= 0) nivelesAlcanzadosActual.push(nivelCantidadReal);
            let nivelActualMes = nivelesAlcanzadosActual.length > 0 ? Math.min(...nivelesAlcanzadosActual) : 0;
            const nivelActual = Math.min(nivelActualMes, values.nivelAnterior);
            document.getElementById('statNivel').textContent = niveles[nivelActual];
        
            const multiplicadorTotal = updateMultiplicadorTables();
        
            const cumpleLlaveMonto = values.cantidad >= 6;
            document.getElementById('montoLlave').textContent =
                cumpleLlaveMonto
                    ? 'Llave Montos (Int/Ext/Rec): \u2713 6 desem.'
                    : 'Llave Montos (Int/Ext/Rec): \u274C 6 desem.';
            document.getElementById('montoLlave').className =
                cumpleLlaveMonto ? 'llave text-success' : 'llave text-danger';
            document.getElementById('externoLlave').textContent =
                cumpleLlaveMonto
                    ? 'Llave Montos (Int/Ext/Rec): \u2713 6 desem.'
                    : 'Llave Montos (Int/Ext/Rec): \u274C 6 desem.';
            document.getElementById('externoLlave').className =
                cumpleLlaveMonto ? 'llave text-success' : 'llave text-danger';
            document.getElementById('recuperadoLlave').textContent =
                cumpleLlaveMonto
                    ? 'Llave Montos (Int/Ext/Rec): \u2713 6 desem.'
                    : 'Llave Montos (Int/Ext/Rec): \u274C 6 desem.';
            document.getElementById('recuperadoLlave').className =
                cumpleLlaveMonto ? 'llave text-success' : 'llave text-danger';
        
            document.getElementById('internoStatus').textContent = nivelInterno >= 0 ? `\u2713 Nivel: ${niveles[nivelInterno]}` : '';
            document.getElementById('cantidadStatus').textContent = values.cantidad >= metas.cantidad[nivelActual] ? `\u2713 ${values.cantidad} > meta ${metas.cantidad[nivelActual]}` : `${values.cantidad}/${metas.cantidad[nivelActual]}`;
        
            let nivelesAlcanzados = [];
            if (nivelInterno >= 0) nivelesAlcanzados.push(nivelInterno);
            if (nivelExterno >= 0) nivelesAlcanzados.push(nivelExterno);
            if (nivelRecuperado >= 0) nivelesAlcanzados.push(nivelRecuperado);
            if (nivelCantidadReal >= 0) nivelesAlcanzados.push(nivelCantidadReal);
            let nivelCarreraActualMes = nivelesAlcanzados.length > 0 ? Math.min(...nivelesAlcanzados) : -1;
            let nivelCarrera = Math.min(nivelCarreraActualMes, values.nivelAnterior);
        
            const bonusCarrera = updateCarreraBar(nivelCarrera);
            const bonusEquipoCalculado = updateEquipoBar(values.nivelEquipo, nivelCarrera);
        
            return {
                nivelInterno,
                nivelExterno,
                nivelRecuperado,
                nivelCantidadReal,
                nivelCantidadLimitado,
                multiplicadorTotal,
                nivelCarrera,
                nivelCarreraActualMes,
                bonusCarrera,
                bonusEquipoCalculado,
                cumpleLlaveMonto
            };
        }
        
        function computeBonuses(values, info) {
            const base = config.base;
            const bonusInterno = (info.nivelInterno >= 0 && info.cumpleLlaveMonto) ? pagos.montoInterno[info.nivelInterno] : 0;
            const bonusExterno = (info.nivelExterno >= 0 && info.cumpleLlaveMonto) ? pagos.montoExterno[info.nivelExterno] : 0;
            const bonusRecuperado = (info.nivelRecuperado >= 0 && info.cumpleLlaveMonto) ? pagos.montoRecuperado[info.nivelRecuperado] : 0;
            const bonusCantidad = info.nivelCantidadLimitado >= 0 ? pagos.cantidad[info.nivelCantidadLimitado] : 0;
        
            let bonusEquipo = 0;
            if (info.nivelCarrera >= 2 && values.nivelEquipo >= 2) {
                bonusEquipo = pagos.equipo[values.nivelEquipo];
            }
        
            const subtotal = base + info.bonusCarrera + bonusInterno + bonusExterno + bonusRecuperado + bonusCantidad + bonusEquipo;
        
            const allFields = checkRequiredFields();
        
            let total = subtotal;
            let totalVariable = 0;
            if (allFields) {
                totalVariable = Math.round((subtotal - base) * info.multiplicadorTotal);
                total = base + totalVariable;
            }
        
            const multiConversion = calcularMultiplicador('conversion', values.conversion);
            const multiEmpatia = calcularMultiplicador('empatia', values.empatia);
            const multiProceso = calcularMultiplicador('proceso', values.proceso);
        
            return {
                base,
                bonusCarrera: info.bonusCarrera,
                bonusInterno,
                bonusExterno,
                bonusRecuperado,
                bonusCantidad,
                bonusEquipo,
                subtotal,
                total,
                totalVariable,
                multiplicadorTotal: info.multiplicadorTotal,
                allFields,
                multiConversion,
                multiEmpatia,
                multiProceso
            };
        }
        
        function renderTotals(values, info, result) {
            updateSubtotalBar(result.subtotal);
        
            document.getElementById('calcBase').textContent = formatNumber(result.base) + ' Gs';
            document.getElementById('calcCarrera').textContent = formatNumber(result.bonusCarrera) + ' Gs';
            document.getElementById('calcInterno').textContent = formatNumber(result.bonusInterno) + ' Gs';
            document.getElementById('calcExterno').textContent = formatNumber(result.bonusExterno) + ' Gs';
            document.getElementById('calcRecuperado').textContent = formatNumber(result.bonusRecuperado) + ' Gs';
            document.getElementById('calcCantidad').textContent = formatNumber(result.bonusCantidad) + ' Gs';
            document.getElementById('calcEquipo').textContent = formatNumber(result.bonusEquipo) + ' Gs';
            document.getElementById('calcSubtotal').textContent = formatNumber(result.subtotal) + ' Gs';
        
            if (!result.allFields) {
                document.getElementById('statMulti').textContent = '0%';
                document.getElementById('statComision').textContent = formatNumber(result.subtotal) + ' Gs (parcial)';
                document.getElementById('calcMultiplicador').textContent = '0% (faltan campos)';
                document.getElementById('totalComision').textContent = formatNumber(result.subtotal) + ' Gs';
            } else {
                document.getElementById('calcMultiplicador').textContent = (result.multiplicadorTotal * 100).toFixed(1) + '%';
                document.getElementById('totalComision').textContent = formatNumber(result.total) + ' Gs';
                if (info.nivelCantidadLimitado < info.nivelCantidadReal && values.menorSemana < 2) {
                    document.getElementById('cantidadLlaveInfo').innerHTML = '<span class="tooltip" data-tip="Sin premio por llave semanal">\u26A0\uFE0F</span>';
                } else {
                    document.getElementById('cantidadLlaveInfo').textContent = '';
                }
                document.getElementById('statMulti').textContent = (result.multiplicadorTotal * 100).toFixed(1) + '%';
                document.getElementById('statComision').textContent = formatNumber(result.total) + ' Gs';
            }
        
            generarSugerencias({
                montoInterno: values.montoInterno,
                nivelInterno: info.nivelInterno,
                nivelExterno: info.nivelExterno,
                nivelRecuperado: info.nivelRecuperado,
                nivelCantidad: info.nivelCantidadReal,
                nivelCantidadLimitado: info.nivelCantidadLimitado,
                nivelCarrera: info.nivelCarrera,
                nivelCarreraActualMes: info.nivelCarreraActualMes,
                menorSemana: values.menorSemana,
                cantidad: values.cantidad,
                conversion: values.conversion,
                empatia: values.empatia,
                proceso: values.proceso,
                mora: values.mora,
                multiConversion: result.multiConversion,
                multiEmpatia: result.multiEmpatia,
                multiProceso: result.multiProceso,
                cumpleLlaveMonto: info.cumpleLlaveMonto,
                bonusCantidadPotencial: info.nivelCantidadReal >= 0 ? pagos.cantidad[info.nivelCantidadReal] : 0,
                subtotal: result.subtotal
            });
        }
        
        function updateCalculations() {
            const values = {
                nivelAnterior: parseInt(document.getElementById('nivelAnterior').value, 10),
                montoInterno: getNumericValue('montoInterno'),
                montoExterno: getNumericValue('montoExterno'),
                montoRecuperado: getNumericValue('montoRecuperado'),
                cantidad: getNumericValue('cantidadDesembolsos'),
                menorSemana: getNumericValue('menorSemana'),
                conversion: parseFloat(document.getElementById('conversion').value) || 0,
                empatia: parseFloat(document.getElementById('empatia').value) || 0,
                proceso: parseFloat(document.getElementById('proceso').value) || 0,
                mora: parseFloat(document.getElementById('mora').value) || 0,
                nivelEquipo: parseInt(document.getElementById('nivelEquipo').value, 10)
            };

            if (values.montoInterno > 0 && values.montoRecuperado > values.montoInterno * 0.5) {
                if (!updateCalculations.recAlertShown) {
                    alert('⚠️ Recuperados superan el 50% del monto interno');
                    updateCalculations.recAlertShown = true;
                }
            } else {
                updateCalculations.recAlertShown = false;
            }
        
            const info = updateFields(values);
            const result = computeBonuses(values, info);
            renderTotals(values, info, result);
        }
        
        // Limpiar todo
        function limpiarTodo() {
            if (confirm('¿Seguro que querés limpiar todos los datos?')) {
                document.querySelectorAll('input').forEach(input => {
                    input.value = '';
                    if (input.classList.contains('required')) {
                        input.classList.remove('filled');
                        input.classList.add('empty');
                    }
                });
                // Limpiar el borrador almacenado
                localStorage.removeItem('draftCommission');
                document.getElementById('nivelAnterior').value = '2';
                document.getElementById('nivelEquipo').value = '2';

                // Establecer valores óptimos automáticamente
                establecerValoresOptimos();

                const menorSemana = document.getElementById('menorSemana');
                menorSemana.value = '2';
                menorSemana.classList.add('filled');
                menorSemana.classList.remove('empty');

                updateCalculations();
            }
        }
        
     // Descargar PDF
function descargarPDF() {
    generarPDFMejorado();
}

        
        // Inicializar
        window.onload = function() {
            // Inicializar el modal de administración
            const adminModal = document.getElementById('adminModal');
            if (adminModal) {
                adminModal.style.display = 'none';
                // Cerrar modal al hacer clic fuera de él
                adminModal.addEventListener('click', function(e) {
                    if (e.target === adminModal) {
                        closeAdminPanel();
                    }
                });
            }

            document.querySelectorAll('.required').forEach(field => {
                if (field.value) {
                    field.classList.add('filled');
                } else {
                    field.classList.add('empty');
                }
            });

            // Establecer menorSemana por defecto si está vacío
            const menorSemana = document.getElementById('menorSemana');
            if (!menorSemana.value) {
                menorSemana.value = '2';
                menorSemana.classList.add('filled');
                menorSemana.classList.remove('empty');
            }

            updateCalculations();
        };
    

/* --- Added by AI 2025-06-26 --- */
(function(){
    let saveTimer;
    const indicator = document.getElementById('saveIndicator');

    function showIndicator(){
        if(indicator){
            indicator.textContent = '⚡ Guardando...';
            indicator.classList.add('saving');
        }
    }

    function hideIndicator(){
        if(indicator){
            indicator.classList.remove('saving');
            indicator.textContent = '';
        }
    }

    function restoreDraft(){
        try{
            const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
            const camposMultiplicadores = ['conversion', 'empatia', 'proceso', 'mora'];
            let valoresMultiplicadoresEnDraft = false;
            
            // Verificar si hay valores de multiplicadores en el draft
            camposMultiplicadores.forEach(campo => {
                if (draft[campo]) {
                    valoresMultiplicadoresEnDraft = true;
                }
            });
            
            // Si no hay valores de multiplicadores guardados, establecer valores óptimos
            if (!valoresMultiplicadoresEnDraft) {
                const valoresOptimos = {
                    conversion: encontrarValorOptimo('conversion'),
                    empatia: encontrarValorOptimo('empatia'),
                    proceso: encontrarValorOptimo('proceso'),
                    mora: encontrarValorOptimo('mora')
                };
                
                // Agregar valores óptimos al draft
                Object.assign(draft, valoresOptimos);
            }
            
            Object.entries(draft).forEach(([id,val])=>{
               const el = document.getElementById(id);
               if(!el) return;
               el.value = val;
               if(el.classList.contains('required')){
                  el.classList.add(val ? 'filled' : 'empty');
               }
            });
        }catch(e){console.warn('No draft to restore', e);}
    }

    function autosave(e){
        const el = e.target;
        if(!el.id) return;
        const draft = JSON.parse(localStorage.getItem('draftCommission') || '{}');
        draft[el.id] = el.value;
        showIndicator();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function(){
            localStorage.setItem('draftCommission', JSON.stringify(draft));
            hideIndicator();
        }, 500);
    }

    document.addEventListener('DOMContentLoaded', function(){
        restoreDraft();
        document.querySelectorAll('input, select, textarea').forEach(function(el){
            el.addEventListener('input', autosave);
        });
    });
})();

// === FUNCIONES DEL PANEL DE ADMINISTRACIÓN ===

// Variable para controlar si el panel admin está abierto
let adminPanelOpen = false;

// Función para formatear inputs del panel admin
function formatearAdminInput(input) {
    const valor = input.value.replace(/\./g, '');
    if (valor && valor !== '') {
        const num = parseInt(valor, 10);
        if (!isNaN(num)) {
            input.value = formatNumber(num);
        }
    }
}

// Función para limpiar formato de admin inputs
function limpiarFormatoAdmin(str) {
    return str.replace(/\./g, '');
}



// Función para abrir el panel admin
function openAdminPanel() {
    console.log('openAdminPanel ejecutado'); // Debug
    
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        console.log('Mostrando modal'); // Debug
        adminModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        adminPanelOpen = true;
        
        // Cargar valores actuales en el panel
        try {
            console.log('Cargando valores admin'); // Debug
            loadAdminValues();
            
            // Cargar datos completos del admin, incluyendo los multiplicadores
            setTimeout(() => {
                console.log('Cargando datos completos'); // Debug
                try {
                    loadAdminData(); 
                    setupLevelNameListeners();
                    setupSystemNameListener();
                    initializeAdminTabs();
                    console.log('Panel admin completamente inicializado'); // Debug
                } catch (error) {
                    console.error('Error en setTimeout:', error);
                }
            }, 100);
        } catch (error) {
            console.error('Error al cargar datos del admin:', error);
            alert('Hubo un error al cargar el panel de administración: ' + error.message);
            closeAdminPanel();
        }
    } else {
        console.error('adminModal no encontrado en openAdminPanel');
    }
}

// Función para cerrar el panel admin
function closeAdminPanel() {
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
        adminPanelOpen = false;
    }
}

// Función para inicializar las pestañas del panel de admin
function initializeAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Ocultar todos los contenidos
            tabContents.forEach(content => content.classList.remove('active'));
            // Desactivar todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));

            // Activar la pestaña y contenido seleccionados
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const activeContent = document.getElementById(`tab-${tabId}`);
            if (activeContent) {
                activeContent.classList.add('active');
                
                // Cargar contenido específico según la pestaña
                switch(tabId) {
                    case 'dashboard':
                        loadDashboardEjecutivo();
                        break;
                }
            }
        });
    });
}

// Función para cargar valores en el panel admin
function loadAdminValues() {
    const currentConfig = getConfig();
    
    // Nombre del sistema
    const nombreSistema = currentConfig.sistemaConfig?.nombre || '💰 Sistema de Comisiones Comerciales';
    const sistemaInput = document.getElementById('admin-sistema-nombre');
    if (sistemaInput) {
        sistemaInput.value = nombreSistema;
    }
    
    // Verificar si existe el elemento preview (opcional)
    const previewElement = document.getElementById('preview-sistema-nombre');
    if (previewElement) {
        previewElement.textContent = nombreSistema;
    }
    
    // Base
    const baseInput = document.getElementById('admin-base');
    if (baseInput) {
        baseInput.value = formatNumber(currentConfig.base);
    }
    
    // Nombres de niveles
    for (let i = 0; i < 6; i++) {
        const nivelInput = document.getElementById(`admin-nivel-${i}`);
        if (nivelInput) {
            nivelInput.value = currentConfig.niveles[i];
        }
    }
    
    // Metas
    for (let i = 0; i < 6; i++) {
        const metaInternoInput = document.getElementById(`admin-meta-interno-${i}`);
        const metaExternoInput = document.getElementById(`admin-meta-externo-${i}`);
        const metaRecuperadoInput = document.getElementById(`admin-meta-recuperado-${i}`);
        const metaCantidadInput = document.getElementById(`admin-meta-cantidad-${i}`);
        
        if (metaInternoInput) metaInternoInput.value = formatNumber(currentConfig.metas.montoInterno[i]);
        if (metaExternoInput) metaExternoInput.value = formatNumber(currentConfig.metas.montoExterno[i]);
        if (metaRecuperadoInput) metaRecuperadoInput.value = formatNumber(currentConfig.metas.montoRecuperado[i]);
        if (metaCantidadInput) metaCantidadInput.value = currentConfig.metas.cantidad[i];
    }
    
    // Premios
    for (let i = 0; i < 6; i++) {
        const premioCarreraInput = document.getElementById(`admin-premio-carrera-${i}`);
        const premioInternoInput = document.getElementById(`admin-premio-interno-${i}`);
        const premioExternoInput = document.getElementById(`admin-premio-externo-${i}`);
        const premioRecuperadoInput = document.getElementById(`admin-premio-recuperado-${i}`);
        const premioCantidadInput = document.getElementById(`admin-premio-cantidad-${i}`);
        const premioEquipoInput = document.getElementById(`admin-premio-equipo-${i}`);
        
        if (premioCarreraInput) premioCarreraInput.value = formatNumber(currentConfig.pagos.carrera[i]);
        if (premioInternoInput) premioInternoInput.value = formatNumber(currentConfig.pagos.montoInterno[i]);
        if (premioExternoInput) premioExternoInput.value = formatNumber(currentConfig.pagos.montoExterno[i]);
        if (premioRecuperadoInput) premioRecuperadoInput.value = formatNumber(currentConfig.pagos.montoRecuperado[i]);
        if (premioCantidadInput) premioCantidadInput.value = formatNumber(currentConfig.pagos.cantidad[i]);
        if (premioEquipoInput) premioEquipoInput.value = formatNumber(currentConfig.pagos.equipo[i]);
    }
    
    // Configurar listeners para nombres dinámicos y título
    try {
        setupLevelNameListeners();
        setupSystemNameListener();
        updateLevelNames();
    } catch (error) {
        console.warn('Error al configurar listeners:', error);
    }
}

// Función para cargar datos completos del admin
function loadAdminData() {
    loadAdminValues();
    loadAdminMultipliers(); // Cargar multiplicadores
}

// Función para cargar las tablas de multiplicadores en el panel admin
function loadAdminMultipliers() {
    // Usar la nueva función V2 mejorada
    loadMultipliersV2();
}

// ========================================
// FUNCIONES MULTIPLICADORES V2
// ========================================

// Función para crear el HTML de una regla de multiplicador V2
function createMultiplierRuleV2(type, rule = { op: '>=', valor: 0, mult: 100 }, index) {
    const newId = `${type}-${index}-${new Date().getTime()}`;
    const operatorText = rule.op === '>=' ? '≥' : rule.op === '<=' ? '≤' : '=';
    
    return `
        <div class="multiplier-rule-v2" data-id="${newId}">
            <span class="rule-label">Si</span>
            <select class="rule-operator" data-field="op" onchange="updateMultiplierCounters()">
                <option value=">=" ${rule.op === '>=' ? 'selected' : ''}>≥</option>
                <option value="<=" ${rule.op === '<=' ? 'selected' : ''}>≤</option>
                <option value="==" ${rule.op === '==' ? 'selected' : ''}>=</option>
            </select>
            <input type="number" class="rule-value" placeholder="0" value="${rule.valor}" data-field="valor" min="0" max="100" onchange="updateMultiplierCounters()">
            <span class="rule-percent">%</span>
            <span class="rule-arrow">→</span>
            <input type="number" class="rule-multiplier" placeholder="100" value="${rule.mult}" data-field="mult" min="0" max="200" onchange="updateMultiplierCounters()">
            <span class="rule-percent">%</span>
            <button type="button" class="rule-delete-btn" onclick="removeMultiplierRuleV2(this, '${type}')">✕</button>
        </div>
    `;
}

// Función para agregar una nueva regla de multiplicador V2
function addMultiplierRowV2(type) {
    const container = document.getElementById(`admin-${type}-table`);
    const emptyState = document.getElementById(`${type}-empty`);
    
    if (container) {
        // Ocultar estado vacío si existe
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        const newIndex = container.querySelectorAll('.multiplier-rule-v2').length;
        container.insertAdjacentHTML('beforeend', createMultiplierRuleV2(type, undefined, newIndex));
        
        // Actualizar contador
        updateMultiplierCounters();
        
        // Hacer focus en el primer input de la nueva regla
        const newRule = container.lastElementChild;
        const firstInput = newRule.querySelector('.rule-value');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

// Función para eliminar una regla de multiplicador V2
function removeMultiplierRuleV2(button, type) {
    const rule = button.closest('.multiplier-rule-v2');
    const container = document.getElementById(`admin-${type}-table`);
    const emptyState = document.getElementById(`${type}-empty`);
    
    if (rule) {
        rule.remove();
        
        // Mostrar estado vacío si no hay más reglas
        const remainingRules = container.querySelectorAll('.multiplier-rule-v2');
        if (remainingRules.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        }
        
        // Actualizar contador
        updateMultiplierCounters();
    }
}

// Función para actualizar contadores y vista previa
function updateMultiplierCounters() {
    const types = ['conversion', 'empatia', 'proceso', 'mora'];
    const multipliers = {};
    
    types.forEach(type => {
        const container = document.getElementById(`admin-${type}-table`);
        const counter = document.getElementById(`${type}-count`);
        const emptyState = document.getElementById(`${type}-empty`);
        
        if (container && counter) {
            const rules = container.querySelectorAll('.multiplier-rule-v2');
            const count = rules.length;
            
            // Actualizar contador
            counter.textContent = count === 1 ? '1 regla' : `${count} reglas`;
            
            // Mostrar/ocultar estado vacío
            if (emptyState) {
                emptyState.style.display = count === 0 ? 'block' : 'none';
            }
            
            // Calcular multiplicador para vista previa (usar 75% como ejemplo)
            multipliers[type] = calculateMultiplierForValue(type, 75);
        }
    });
    
    // Actualizar vista previa
    updateMultiplierPreview(multipliers);
}

// Función para calcular multiplicador para un valor específico
function calculateMultiplierForValue(type, value) {
    const container = document.getElementById(`admin-${type}-table`);
    if (!container) return 100;
    
    const rules = container.querySelectorAll('.multiplier-rule-v2');
    
    for (let rule of rules) {
        const op = rule.querySelector('[data-field="op"]').value;
        const ruleValue = parseFloat(rule.querySelector('[data-field="valor"]').value) || 0;
        const mult = parseFloat(rule.querySelector('[data-field="mult"]').value) || 100;
        
        let matches = false;
        if (op === '>=' && value >= ruleValue) matches = true;
        else if (op === '<=' && value <= ruleValue) matches = true;
        else if (op === '==' && value === ruleValue) matches = true;
        
        if (matches) {
            return mult;
        }
    }
    
    return 100; // Valor por defecto
}

// Función para actualizar la vista previa del cálculo
function updateMultiplierPreview(multipliers) {
    const preview = document.getElementById('multiplier-calculation-preview');
    if (!preview) return;
    
    const conv = multipliers.conversion || 100;
    const emp = multipliers.empatia || 100;
    const proc = multipliers.proceso || 100;
    const mora = multipliers.mora || 100;
    
    const total = (conv * emp * proc * mora) / 1000000; // Dividir por 100^3 para obtener porcentaje
    
    preview.innerHTML = `
        Conversión (${conv}%) × Empatía (${emp}%) × Proceso (${proc}%) × Mora (${mora}%) = <strong>${total.toFixed(1)}%</strong>
        <br><small style="color: #666; margin-top: 4px; display: block;">Ejemplo con valores de 75% en cada categoría</small>
    `;
}

// ========================================
// SISTEMA DE LOGIN
// ========================================

// Contraseña del sistema
const SISTEMA_PASSWORD = "comercial2027";

// Función para verificar contraseña
function verificarContrasena() {
    const passwordInput = document.getElementById('password-input');
    const errorDiv = document.getElementById('login-error');
    const password = passwordInput.value.trim();
    
    if (password === SISTEMA_PASSWORD) {
        // Contraseña correcta
        mostrarSistema();
    } else {
        // Contraseña incorrecta
        mostrarError("❌ Contraseña incorrecta");
        passwordInput.value = '';
        passwordInput.focus();
        
        // Agregar animación de error
        passwordInput.style.borderColor = '#d32f2f';
        setTimeout(() => {
            passwordInput.style.borderColor = '#e0e0e0';
        }, 2000);
    }
}

// Función para mostrar mensaje de error
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = mensaje;
    errorDiv.style.animation = 'none';
    setTimeout(() => {
        errorDiv.style.animation = 'shake 0.5s ease';
    }, 10);
}

// Función para mostrar el sistema principal
function mostrarSistema() {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    // Ocultar pantalla de login con animación
    loginScreen.style.animation = 'fadeOut 0.3s ease';
    
    setTimeout(() => {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'flex'; // Mantener el flex layout
        
        // Inicializar sistema
        inicializarSistema();
    }, 300);
}

// Función para inicializar el sistema después del login
function inicializarSistema() {
    // Cargar datos guardados
    loadData();
    
    // Actualizar cálculos
    updateCalculations();
    
    // Cargar multiplicadores
    loadMultipliersV2();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        mostrarMensajeBienvenida();
    }, 500);
}

// Función para mostrar mensaje de bienvenida
function mostrarMensajeBienvenida() {
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    mensaje.innerHTML = `✅ ¡Bienvenido al Sistema de Comisiones!`;
    
    document.body.appendChild(mensaje);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        mensaje.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.parentNode.removeChild(mensaje);
            }
        }, 300);
    }, 3000);
}

// Event listener para Enter en el campo de contraseña
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verificarContrasena();
            }
        });
        
        // Focus automático en el campo de contraseña
        setTimeout(() => {
            passwordInput.focus();
        }, 500);
    }
});

// Función para cargar multiplicadores existentes en el nuevo formato
function loadMultipliersV2() {
    const currentConfig = getConfig();
    const types = ['conversion', 'empatia', 'proceso', 'mora'];
    
    types.forEach(type => {
        const container = document.getElementById(`admin-${type}-table`);
        if (!container) return;
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        const multipliers = currentConfig.multiplicadores[type] || [];
        
        if (multipliers.length === 0) {
            // Mostrar estado vacío
            const emptyState = document.getElementById(`${type}-empty`);
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            // Cargar reglas existentes
            multipliers.forEach((rule, index) => {
                // Convertir del formato original al nuevo formato
                const convertedRule = {
                    op: rule.min === 0 ? '<=' : '>=',
                    valor: rule.min,
                    mult: rule.mult
                };
                
                container.insertAdjacentHTML('beforeend', createMultiplierRuleV2(type, convertedRule, index));
            });
        }
    });
    
    // Actualizar contadores
    updateMultiplierCounters();
}

// Función para crear el HTML de una fila de multiplicador (compatibilidad)
function createMultiplierRowHTML(type, rule = { op: '>=', valor: 0, mult: 100 }, index) {
    // Redirigir a la nueva función V2
    return createMultiplierRuleV2(type, rule, index);
}

// Función para agregar una nueva fila de multiplicador (compatibilidad)
function addMultiplierRow(type) {
    // Redirigir a la nueva función V2
    addMultiplierRowV2(type);
}

// Función para mantener compatibilidad con el sistema existente
function addMultiplierRow(type) {
    // Redirigir a la nueva función V2
    addMultiplierRowV2(type);
}

// Función para actualizar nombres de niveles en tiempo real
function updateLevelNames() {
    for (let i = 0; i < 6; i++) {
        const nivelInput = document.getElementById(`admin-nivel-${i}`);
        const nuevoNombre = nivelInput.value || `Nivel ${i + 1}`;
        
        // Actualizar todas las celdas con clase nivel-name-X
        const celdas = document.querySelectorAll(`.nivel-name-${i}`);
        celdas.forEach(celda => {
            celda.textContent = nuevoNombre;
        });
    }
}

// Agregar listeners para actualizar nombres en tiempo real
function setupLevelNameListeners() {
    for (let i = 0; i < 6; i++) {
        const nivelInput = document.getElementById(`admin-nivel-${i}`);
        if (nivelInput) {
            nivelInput.addEventListener('input', updateLevelNames);
        }
    }
}

// Función para configurar listener del nombre del sistema
function setupSystemNameListener() {
    const sistemaInput = document.getElementById('admin-sistema-nombre');
    if (sistemaInput) {
        sistemaInput.addEventListener('input', function() {
            const nuevoNombre = this.value || '💰 Sistema de Comisiones Comerciales';
            
            // Verificar si existe el elemento preview (opcional)
            const previewElement = document.getElementById('preview-sistema-nombre');
            if (previewElement) {
                previewElement.textContent = nuevoNombre;
            }
            
            // Actualizar el título principal del sistema
            const tituloH1 = document.querySelector('.header h1');
            if (tituloH1) {
                tituloH1.textContent = nuevoNombre;
            }
        });
    }
}

// Función para aplicar el nombre del sistema guardado
function applySystemName() {
    const currentConfig = getConfig();
    const nombreSistema = currentConfig.sistemaConfig?.nombre || '💰 Sistema de Comisiones Comerciales';
    
    const tituloH1 = document.querySelector('.header h1');
    if (tituloH1) {
        tituloH1.textContent = nombreSistema;
    }
    document.title = nombreSistema; // Actualizar título de la pestaña
}





// Aplicar el nombre del sistema al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    applySystemName();
});

// Función para obtener configuración actual desde el panel admin
function getAdminConfig() {
    const newConfig = {
        sistemaConfig: {
            nombre: document.getElementById('admin-sistema-nombre').value
        },
        base: parseInt(limpiarFormatoAdmin(document.getElementById('admin-base').value), 10) || 0,
        niveles: [],
        metas: { montoInterno: [], montoExterno: [], montoRecuperado: [], cantidad: [] },
        pagos: { carrera: [], montoInterno: [], montoExterno: [], montoRecuperado: [], cantidad: [], equipo: [] },
        multiplicadores: { conversion: [], empatia: [], proceso: [], mora: [] }
    };

    for (let i = 0; i < 6; i++) {
        newConfig.niveles.push(document.getElementById(`admin-nivel-${i}`).value);
        
        newConfig.metas.montoInterno.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-interno-${i}`).value), 10) || 0);
        newConfig.metas.montoExterno.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-externo-${i}`).value), 10) || 0);
        newConfig.metas.montoRecuperado.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-recuperado-${i}`).value), 10) || 0);
        newConfig.metas.cantidad.push(parseInt(document.getElementById(`admin-meta-cantidad-${i}`).value, 10) || 0);

        newConfig.pagos.carrera.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-carrera-${i}`).value), 10) || 0);
        newConfig.pagos.montoInterno.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-interno-${i}`).value), 10) || 0);
        newConfig.pagos.montoExterno.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-externo-${i}`).value), 10) || 0);
        newConfig.pagos.montoRecuperado.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-recuperado-${i}`).value), 10) || 0);
        newConfig.pagos.cantidad.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-cantidad-${i}`).value), 10) || 0);
        newConfig.pagos.equipo.push(parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-equipo-${i}`).value), 10) || 0);
    }

    // Leer multiplicadores
    const multiplierTypes = ['conversion', 'empatia', 'proceso', 'mora'];
    multiplierTypes.forEach(type => {
        const container = document.getElementById(`admin-${type}-table`);
        if (container) {
            const rows = container.querySelectorAll('.multiplier-row:not([style*="font-weight: bold"])');
            rows.forEach(row => {
                const op = row.querySelector('[data-field="op"]').value;
                const valor = parseFloat(row.querySelector('[data-field="valor"]').value);
                const mult = parseFloat(row.querySelector('[data-field="mult"]').value);

                if (!isNaN(valor) && !isNaN(mult)) {
                    newConfig.multiplicadores[type].push({ op, valor, mult });
                }
            });
            // Ordenar las reglas para un cálculo correcto
            newConfig.multiplicadores[type].sort((a, b) => {
                if (a.op.includes('<')) return a.valor - b.valor; // Ascendente para <=
                return b.valor - a.valor; // Descendente para >=
            });
        }
    });

    return newConfig;
}

// ===== FUNCIONES DE ADMINISTRACIÓN AVANZADAS =====

// Validar y guardar configuración
function validateAndSaveConfig() {
    showAdminMessage('Validando configuración...', 'info');
    
    try {
        const config = getCurrentConfig();
        
        // Validar multiplicadores
        const errors = validateMultipliers(config);
        if (errors.length > 0) {
            showAdminMessage('❌ Errores encontrados: ' + errors.join(', '), 'error');
            return;
        }
        
        // Guardar configuración
        localStorage.setItem('comisionesConfig', JSON.stringify(config));
        
        // Actualizar cálculos
        updateCalculations();
        
        showAdminMessage('✅ Configuración guardada exitosamente', 'success');
        
        // Auto-cerrar mensaje después de 3 segundos
        setTimeout(() => hideAdminMessage(), 3000);
        
        // Recargar la página para aplicar los cambios después de un momento
        setTimeout(() => {
            location.reload();
        }, 1000);
        
    } catch (error) {
        showAdminMessage('❌ Error al guardar: ' + error.message, 'error');
    }
}

// Obtener configuración actual desde los inputs del admin
function getCurrentConfig() {
    const currentConfig = getConfig(); // Obtener configuración actual
    const config = {
        base: parseInt(limpiarFormatoAdmin(document.getElementById('admin-base').value)) || currentConfig.base,
        niveles: [],
        iconos: currentConfig.iconos, // Mantener iconos originales
        metas: {
            montoInterno: [],
            montoExterno: [],
            montoRecuperado: [],
            cantidad: []
        },
        pagos: {
            carrera: [],
            montoInterno: [],
            montoExterno: [],
            montoRecuperado: [],
            cantidad: [],
            equipo: []
        },
        multiplicadores: {
            conversion: [],
            empatia: [],
            proceso: [],
            mora: []
        }
    };
    
    // Obtener niveles
    for (let i = 0; i < 6; i++) {
        config.niveles[i] = document.getElementById(`admin-nivel-${i}`).value || currentConfig.niveles[i];
        
        // Metas
        config.metas.montoInterno[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-interno-${i}`).value)) || 0;
        config.metas.montoExterno[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-externo-${i}`).value)) || 0;
        config.metas.montoRecuperado[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-meta-recuperado-${i}`).value)) || 0;
        config.metas.cantidad[i] = parseInt(document.getElementById(`admin-meta-cantidad-${i}`).value) || 0;
        
        // Pagos
        config.pagos.carrera[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-carrera-${i}`).value)) || 0;
        config.pagos.montoInterno[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-interno-${i}`).value)) || 0;
        config.pagos.montoExterno[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-externo-${i}`).value)) || 0;
        config.pagos.montoRecuperado[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-recuperado-${i}`).value)) || 0;
        config.pagos.cantidad[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-cantidad-${i}`).value)) || 0;
        config.pagos.equipo[i] = parseInt(limpiarFormatoAdmin(document.getElementById(`admin-premio-equipo-${i}`).value)) || 0;
    }
    
    // Leer multiplicadores del nuevo formato V2
    const multiplierTypes = ['conversion', 'empatia', 'proceso', 'mora'];
    multiplierTypes.forEach(type => {
        const container = document.getElementById(`admin-${type}-table`);
        if (container) {
            const rules = container.querySelectorAll('.multiplier-rule-v2');
            rules.forEach(rule => {
                const op = rule.querySelector('[data-field="op"]').value;
                const valor = parseFloat(rule.querySelector('[data-field="valor"]').value);
                const mult = parseFloat(rule.querySelector('[data-field="mult"]').value);

                if (!isNaN(valor) && !isNaN(mult)) {
                    // Convertir al formato original del sistema
                    let text = '';
                    if (op === '>=') {
                        text = valor === 0 ? 'Todos' : `${valor}%+`;
                    } else if (op === '<=') {
                        text = `≤${valor}%`;
                    } else if (op === '==') {
                        text = `=${valor}%`;
                    }
                    
                    config.multiplicadores[type].push({
                        min: valor,
                        mult: mult,
                        text: text
                    });
                }
            });
            
            // Ordenar las reglas para un cálculo correcto
            config.multiplicadores[type].sort((a, b) => b.min - a.min);
        }
    });
    
    return config;
}

// Validar multiplicadores
function validateMultipliers(config) {
    const errors = [];
    const types = ['conversion', 'empatia', 'proceso', 'mora'];
    
    types.forEach(type => {
        if (!config.multiplicadores[type] || config.multiplicadores[type].length === 0) {
            errors.push(`Multiplicador ${type} vacío`);
            return;
        }
        
        config.multiplicadores[type].forEach((item, index) => {
            if (item.min < 0 || item.min > 100) {
                errors.push(`${type}[${index}]: Valor "Desde %" debe estar entre 0-100`);
            }
            if (item.mult <= 0 || item.mult > 2) {
                errors.push(`${type}[${index}]: Multiplicador debe estar entre 0.01-2.0`);
            }
            if (!item.text || item.text.trim() === '') {
                errors.push(`${type}[${index}]: Texto no puede estar vacío`);
            }
        });
    });
    
    return errors;
}

// Mostrar mensaje de administración
function showAdminMessage(message, type = 'info') {
    const messageDiv = document.getElementById('admin-messages');
    messageDiv.style.display = 'block';
    messageDiv.className = `admin-messages ${type}`;
    messageDiv.innerHTML = message;
}

// Ocultar mensaje de administración
function hideAdminMessage() {
    const messageDiv = document.getElementById('admin-messages');
    messageDiv.style.display = 'none';
}

// Vista previa de cambios
function previewChanges() {
    showAdminMessage('Aplicando vista previa...', 'info');
    
    try {
        const config = getCurrentConfig();
        const errors = validateMultipliers(config);
        
        if (errors.length > 0) {
            showAdminMessage('❌ Corrige los errores antes de aplicar: ' + errors.join(', '), 'error');
            return;
        }
        
        // Aplicar temporalmente la configuración
        localStorage.setItem('tempConfig', JSON.stringify(config));
        
        // Simular aplicación de cambios
        const originalConfig = localStorage.getItem('comisionesConfig');
        localStorage.setItem('comisionesConfig', JSON.stringify(config));
        
        // Actualizar cálculos
        updateCalculations();
        
        showAdminMessage('👁️ Vista previa aplicada. Los cambios se ven en el panel principal.', 'success');
        
        // Restaurar configuración original después de 10 segundos
        setTimeout(() => {
            if (originalConfig) {
                localStorage.setItem('comisionesConfig', originalConfig);
            } else {
                localStorage.removeItem('comisionesConfig');
            }
            updateCalculations();
            showAdminMessage('↩️ Vista previa finalizada. Configuración restaurada.', 'info');
            setTimeout(() => hideAdminMessage(), 2000);
        }, 10000);
        
    } catch (error) {
        showAdminMessage('❌ Error en vista previa: ' + error.message, 'error');
    }
}

// Exportar configuración como archivo config.js
function exportConfigJS() {
    try {
        const currentConfig = getCurrentConfig();
        
        // Crear configuración en el formato exacto del archivo config.js original
        const originalConfig = getConfig(); // Obtener configuración original
        const exportConfig = {
            base: currentConfig.base,
            niveles: currentConfig.niveles,
            iconos: originalConfig.iconos, // Mantener iconos originales
            metas: currentConfig.metas,
            pagos: currentConfig.pagos,
            multiplicadores: {
                conversion: [],
                empatia: [],
                proceso: [],
                mora: []
            }
        };
        
        // Convertir multiplicadores del formato admin al formato original
        const multiplierTypes = ['conversion', 'empatia', 'proceso', 'mora'];
        multiplierTypes.forEach(type => {
            const container = document.getElementById(`admin-${type}-table`);
            if (container) {
                const rows = container.querySelectorAll('.multiplier-row:not([style*="font-weight: bold"])');
                rows.forEach(row => {
                    const op = row.querySelector('[data-field="op"]').value;
                    const valor = parseFloat(row.querySelector('[data-field="valor"]').value);
                    const mult = parseFloat(row.querySelector('[data-field="mult"]').value);
                    
                    if (!isNaN(valor) && !isNaN(mult)) {
                        // Convertir al formato original: min, mult, text
                        let text = '';
                        if (op === '>=') {
                            text = valor === 0 ? `<${valor + 1}%` : `${valor}%+`;
                        } else if (op === '<=') {
                            text = valor === 0 ? `0-${valor}%` : `${valor - 1}-${valor}%`;
                        }
                        
                        exportConfig.multiplicadores[type].push({
                            min: valor,
                            mult: mult,
                            text: text
                        });
                    }
                });
                
                // Ordenar las reglas para un cálculo correcto
                exportConfig.multiplicadores[type].sort((a, b) => b.min - a.min);
            }
        });
        
        // Validar que no haya errores
        if (!exportConfig.base || exportConfig.niveles.includes('') || exportConfig.niveles.length < 6) {
            showAdminMessage('❌ Por favor, complete todos los campos básicos (Base, Nombres de niveles) antes de exportar.', 'error');
            return;
        }
        
        const jsContent = `// Configuración del Sistema de Comisiones Comerciales
// Este archivo contiene todos los valores configurables del sistema
// Para modificar valores, usar el Panel de Administración

const CONFIG = ${JSON.stringify(exportConfig, null, 4)};`;
        
        const blob = new Blob([jsContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAdminMessage('✅ Archivo config.js exportado exitosamente', 'success');
        setTimeout(() => hideAdminMessage(), 3000);
        
    } catch (error) {
        showAdminMessage('❌ Error al exportar JS: ' + error.message, 'error');
    }
}

// Exportar configuración como JSON
function exportConfigJSON() {
    try {
        const config = getCurrentConfig();
        const errors = validateMultipliers(config);
        
        if (errors.length > 0) {
            showAdminMessage('❌ Corrige los errores antes de exportar: ' + errors.join(', '), 'error');
            return;
        }
        
        const jsonContent = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comisiones-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAdminMessage('✅ Archivo JSON exportado exitosamente', 'success');
        setTimeout(() => hideAdminMessage(), 3000);
        
    } catch (error) {
        showAdminMessage('❌ Error al exportar JSON: ' + error.message, 'error');
    }
}

// Importar configuración
function importConfig() {
    document.getElementById('import-file-input').click();
}

// Manejar importación de archivo
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let config;
            const content = e.target.result;
            
            if (file.name.endsWith('.js')) {
                // Extraer CONFIG del archivo JS
                const configMatch = content.match(/const CONFIG = ({[\s\S]*?});/);
                if (configMatch) {
                    config = JSON.parse(configMatch[1]);
                } else {
                    throw new Error('No se encontró la variable CONFIG en el archivo JS');
                }
            } else {
                // Archivo JSON
                config = JSON.parse(content);
            }
            
            // Validar estructura básica
            if (!config.niveles || !config.metas || !config.pagos || !config.multiplicadores) {
                throw new Error('Estructura de configuración inválida');
            }
            
            // Aplicar configuración
            localStorage.setItem('comisionesConfig', JSON.stringify(config));
            loadAdminData();
            updateCalculations();
            
            showAdminMessage('✅ Configuración importada exitosamente', 'success');
            setTimeout(() => hideAdminMessage(), 3000);
            
        } catch (error) {
            showAdminMessage('❌ Error al importar: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Restaurar valores por defecto
function restoreDefaults() {
    if (confirm('⚠️ ¿Estás seguro? Esto restaurará toda la configuración a los valores originales y se perderán todos los cambios.')) {
        localStorage.removeItem('comisionesConfig');
        loadAdminData();
        updateCalculations();
        showAdminMessage('✅ Configuración restaurada a valores por defecto', 'success');
        setTimeout(() => hideAdminMessage(), 3000);
    }
}

// Limpiar configuración local
function clearLocalStorage() {
    if (confirm('⚠️ ¿Estás seguro? Esto eliminará toda la configuración guardada localmente.')) {
        localStorage.removeItem('comisionesConfig');
        localStorage.removeItem('draftCommission');
        localStorage.removeItem('tempConfig');
        showAdminMessage('✅ Configuración local eliminada', 'success');
        setTimeout(() => hideAdminMessage(), 3000);
    }
}

// ===== INICIALIZACIÓN DEL PANEL ADMIN =====

// Inicializar panel de administración cuando se abre
function initializeAdminPanel() {
    loadAdminData();
    setupLevelNameListeners();
    setupSystemNameListener();
    
    // Cargar datos iniciales si el panel está abierto
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && adminPanel.classList.contains('active')) {
        loadAdminData();
    }
}

// Modificar la función toggleAdminPanel existente para incluir inicialización
function toggleAdminPanel() {
    console.log('toggleAdminPanel ejecutado'); // Debug
    
    const adminModal = document.getElementById('adminModal');
    console.log('adminModal encontrado:', adminModal); // Debug
    
    if (!adminModal) {
        console.error('No se encontró el elemento adminModal');
        alert('Error: No se encontró el panel de administración');
        return;
    }
    
    if (adminPanelOpen) {
        console.log('Cerrando panel admin'); // Debug
        closeAdminPanel();
        return;
    }
    
    console.log('Abriendo panel admin'); // Debug
    
    // Solicitar contraseña de administrador
    const password = prompt('🔐 Ingrese la contraseña de administrador:');
    if (password === 'gtadmin') {
        openAdminPanel();
    } else if (password !== null) {
        alert('❌ Contraseña incorrecta');
    }
}

// ===================================
// === DASHBOARD EJECUTIVO ===
// ===================================

// Función principal para cargar el dashboard ejecutivo
function loadDashboardEjecutivo() {
    loadKPIs();
    loadStackedBarChart();
    loadPieChart();
    loadDetailedTable();
    loadAlerts();
}

// ===================================
// === FUNCIONES DEL DASHBOARD EJECUTIVO ===
// ===================================

// Cargar KPIs principales
function loadKPIs() {
    const currentConfig = getConfig();
    
    // Calcular métricas
    const ratios = [];
    const pagos = [];
    const metas = [];
    
    for (let i = 0; i < 6; i++) {
        const metaTotal = currentConfig.metas.montoInterno[i] + currentConfig.metas.montoExterno[i] + currentConfig.metas.montoRecuperado[i];
        const pagoTotal = currentConfig.pagos.montoInterno[i] + currentConfig.pagos.montoExterno[i] + currentConfig.pagos.montoRecuperado[i] + currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        
        ratios.push(metaTotal > 0 ? (pagoTotal / metaTotal * 100) : 0);
        pagos.push(pagoTotal);
        metas.push(metaTotal);
    }
    
    const cumplimientoPromedio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const maxPago = Math.max(...pagos);
    const minPago = Math.min(...pagos);
    const maxBrecha = Math.max(...ratios) - Math.min(...ratios);
    
    // Actualizar KPIs
    document.getElementById('kpi-cumplimiento-value').textContent = cumplimientoPromedio.toFixed(1) + '%';
    document.getElementById('kpi-max-pago-value').textContent = formatNumber(maxPago);
    document.getElementById('kpi-min-pago-value').textContent = formatNumber(minPago);
    document.getElementById('kpi-brecha-value').textContent = maxBrecha.toFixed(1) + '%';
}

// Cargar gráfico de barras apiladas
function loadStackedBarChart() {
    const currentConfig = getConfig();
    const container = document.getElementById('stacked-bar-chart');
    if (!container) return;
    
    let html = '';
    const maxValue = Math.max(...currentConfig.metas.montoInterno, ...currentConfig.pagos.montoInterno) * 1.2;
    
    for (let i = 0; i < 6; i++) {
        const nivel = currentConfig.niveles[i];
        const metaTotal = currentConfig.metas.montoInterno[i] + currentConfig.metas.montoExterno[i] + currentConfig.metas.montoRecuperado[i];
        const pagoTotal = currentConfig.pagos.montoInterno[i] + currentConfig.pagos.montoExterno[i] + currentConfig.pagos.montoRecuperado[i] + currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        const bonos = currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        
        const metaHeight = (metaTotal / maxValue) * 300;
        const pagoHeight = (pagoTotal / maxValue) * 300;
        const bonosHeight = (bonos / maxValue) * 300;
        
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div style="display: flex; flex-direction: column; align-items: center; min-height: 320px;">
                    <div style="background: #007bff; width: 60px; height: ${metaHeight}px; border-radius: 5px 5px 0 0; margin-bottom: 2px;" title="Meta: ${formatNumber(metaTotal)}"></div>
                    <div style="background: #28a745; width: 60px; height: ${pagoHeight}px; border-radius: 5px; margin-bottom: 2px;" title="Pago: ${formatNumber(pagoTotal)}"></div>
                    <div style="background: #ffc107; width: 60px; height: ${bonosHeight}px; border-radius: 0 0 5px 5px;" title="Bonos: ${formatNumber(bonos)}"></div>
                </div>
                <div style="text-align: center; font-weight: bold; font-size: 12px; max-width: 80px;">${nivel}</div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Cargar gráfico de torta
function loadPieChart() {
    const currentConfig = getConfig();
    const container = document.getElementById('pie-chart');
    const legendContainer = document.getElementById('pie-chart-legend');
    if (!container || !legendContainer) return;
    
    // Calcular totales por tipo
    const tipos = ['Carrera', 'Interno', 'Externo', 'Recuperado', 'Cantidad', 'Equipo'];
    const totales = [0, 0, 0, 0, 0, 0];
    const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14'];
    
    for (let i = 0; i < 6; i++) {
        totales[0] += currentConfig.pagos.carrera[i];
        totales[1] += currentConfig.pagos.montoInterno[i];
        totales[2] += currentConfig.pagos.montoExterno[i];
        totales[3] += currentConfig.pagos.montoRecuperado[i];
        totales[4] += currentConfig.pagos.cantidad[i];
        totales[5] += currentConfig.pagos.equipo[i];
    }
    
    const totalGeneral = totales.reduce((a, b) => a + b, 0);
    
    // Crear SVG del gráfico de torta
    let svg = '<svg width="300" height="300" viewBox="0 0 300 300">';
    let currentAngle = 0;
    
    totales.forEach((valor, index) => {
        if (valor > 0) {
            const porcentaje = (valor / totalGeneral) * 100;
            const angle = (porcentaje / 100) * 360;
            const x1 = 150 + 120 * Math.cos(currentAngle * Math.PI / 180);
            const y1 = 150 + 120 * Math.sin(currentAngle * Math.PI / 180);
            const x2 = 150 + 120 * Math.cos((currentAngle + angle) * Math.PI / 180);
            const y2 = 150 + 120 * Math.sin((currentAngle + angle) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            svg += `<path d="M 150 150 L ${x1} ${y1} A 120 120 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[index]}" stroke="white" stroke-width="2"/>`;
            
            currentAngle += angle;
        }
    });
    
    svg += '<circle cx="150" cy="150" r="50" fill="white"/>';
    svg += '<text x="150" y="150" text-anchor="middle" dy=".3em" font-size="16" font-weight="bold">Total</text>';
    svg += '</svg>';
    
    container.innerHTML = svg;
    
    // Crear leyenda
    let legend = '';
    tipos.forEach((tipo, index) => {
        if (totales[index] > 0) {
            const porcentaje = (totales[index] / totalGeneral * 100).toFixed(1);
            legend += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8f9fa; border-radius: 8px;">
                    <div style="width: 20px; height: 20px; background: ${colors[index]}; border-radius: 4px;"></div>
                    <div>
                        <div style="font-weight: bold;">${tipo}</div>
                        <div style="font-size: 12px; color: #666;">${porcentaje}% - ${formatNumber(totales[index])}</div>
                    </div>
                </div>
            `;
        }
    });
    
    legendContainer.innerHTML = legend;
}

// Cargar tabla detallada
function loadDetailedTable() {
    const currentConfig = getConfig();
    const container = document.getElementById('detailed-table');
    if (!container) return;
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Nivel</th>
                    <th>Meta Total</th>
                    <th>Pago Total</th>
                    <th>Bonos</th>
                    <th>Ratio Pago/Meta</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let i = 0; i < 6; i++) {
        const nivel = currentConfig.niveles[i];
        const metaTotal = currentConfig.metas.montoInterno[i] + currentConfig.metas.montoExterno[i] + currentConfig.metas.montoRecuperado[i];
        const pagoTotal = currentConfig.pagos.montoInterno[i] + currentConfig.pagos.montoExterno[i] + currentConfig.pagos.montoRecuperado[i] + currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        const bonos = currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        const ratio = metaTotal > 0 ? (pagoTotal / metaTotal * 100) : 0;
        
        let estado = '';
        let estadoClass = '';
        if (ratio < 50) { estado = 'Muy Bajo'; estadoClass = 'danger'; }
        else if (ratio < 100) { estado = 'Bajo'; estadoClass = 'warning'; }
        else if (ratio < 200) { estado = 'Normal'; estadoClass = 'good'; }
        else { estado = 'Alto'; estadoClass = 'danger'; }
        
        html += `
            <tr>
                <td><strong>${nivel}</strong></td>
                <td>${formatNumber(metaTotal)}</td>
                <td>${formatNumber(pagoTotal)}</td>
                <td>${formatNumber(bonos)}</td>
                <td><strong>${ratio.toFixed(1)}%</strong></td>
                <td><span class="status-indicator ${estadoClass}"></span>${estado}</td>
            </tr>
        `;
    }
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Cargar alertas y recomendaciones
function loadAlerts() {
    const currentConfig = getConfig();
    const container = document.getElementById('alerts-container');
    if (!container) return;
    
    const alerts = [];
    
    // Analizar cada nivel
    for (let i = 0; i < 6; i++) {
        const nivel = currentConfig.niveles[i];
        const metaTotal = currentConfig.metas.montoInterno[i] + currentConfig.metas.montoExterno[i] + currentConfig.metas.montoRecuperado[i];
        const pagoTotal = currentConfig.pagos.montoInterno[i] + currentConfig.pagos.montoExterno[i] + currentConfig.pagos.montoRecuperado[i] + currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        const ratio = metaTotal > 0 ? (pagoTotal / metaTotal * 100) : 0;
        
        if (ratio < 50) {
            alerts.push({
                type: 'danger',
                icon: '⚠️',
                title: `${nivel}: Ratio muy bajo`,
                description: `El pago representa solo ${ratio.toFixed(1)}% de la meta. Considerar aumentar pagos o reducir metas.`
            });
        } else if (ratio > 200) {
            alerts.push({
                type: 'warning',
                icon: '💰',
                title: `${nivel}: Ratio muy alto`,
                description: `El pago representa ${ratio.toFixed(1)}% de la meta. Considerar reducir pagos o aumentar metas.`
            });
        }
    }
    
    // Verificar balance general
    const ratios = [];
    for (let i = 0; i < 6; i++) {
        const metaTotal = currentConfig.metas.montoInterno[i] + currentConfig.metas.montoExterno[i] + currentConfig.metas.montoRecuperado[i];
        const pagoTotal = currentConfig.pagos.montoInterno[i] + currentConfig.pagos.montoExterno[i] + currentConfig.pagos.montoRecuperado[i] + currentConfig.pagos.carrera[i] + currentConfig.pagos.cantidad[i] + currentConfig.pagos.equipo[i];
        const ratio = metaTotal > 0 ? (pagoTotal / metaTotal * 100) : 0;
        ratios.push(ratio);
    }
    
    const promedio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    
    if (promedio < 50) {
        alerts.push({
            type: 'danger',
            icon: '📉',
            title: 'Balance general desfavorable',
            description: `El promedio de cumplimiento es ${promedio.toFixed(1)}%. Los pagos están muy por debajo de las metas.`
        });
    } else if (promedio > 200) {
        alerts.push({
            type: 'warning',
            icon: '📈',
            title: 'Balance general alto',
            description: `El promedio de cumplimiento es ${promedio.toFixed(1)}%. Los pagos están muy por encima de las metas.`
        });
    } else {
        alerts.push({
            type: 'success',
            icon: '✅',
            title: 'Balance general adecuado',
            description: `El promedio de cumplimiento es ${promedio.toFixed(1)}%. El balance entre metas y pagos es apropiado.`
        });
    }
    
    // Generar HTML de alertas
    let html = '';
    alerts.forEach(alert => {
        html += `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ========================================
// DASHBOARD DE VALIDACIÓN EN TIEMPO REAL
// ========================================

// Función principal para actualizar el dashboard de validación
function updateValidationDashboard() {
    if (document.getElementById('tab-dashboard') && document.getElementById('tab-dashboard').classList.contains('active')) {
        loadValidationAnalysis();
        loadValidationAlerts();
        updateValidationStatus();
    }
}

// Cargar análisis de validación principal
function loadValidationAnalysis() {
    const currentConfig = getCurrentConfig();
    
    // Analizar Monto Interno
    updateValidationTable('interno', currentConfig.metas.montoInterno, currentConfig.pagos.montoInterno, currentConfig.niveles);
    
    // Analizar Monto Externo
    updateValidationTable('externo', currentConfig.metas.montoExterno, currentConfig.pagos.montoExterno, currentConfig.niveles);
    
    // Analizar Cantidad
    updateValidationTableCantidad(currentConfig.metas.cantidad, currentConfig.pagos.cantidad, currentConfig.niveles);
}

// Actualizar tabla de validación
function updateValidationTable(tipo, metas, premios, niveles) {
    const tbody = document.getElementById(`validation-tbody-${tipo}`);
    if (!tbody) return;
    
    let html = '';
    
    for (let i = 0; i < 6; i++) {
        const meta = metas[i];
        const premio = premios[i];
        const rendimiento = meta > 0 ? (premio / meta * 100) : 0;
        
        // Determinar estado
        let estado = '';
        let estadoClass = '';
        
        if (rendimiento < 0.3) {
            estado = '🚨 Muy Bajo';
            estadoClass = 'status-danger';
        } else if (rendimiento < 0.6) {
            estado = '⚠️ Bajo';
            estadoClass = 'status-warning';
        } else if (rendimiento < 1.2) {
            estado = '✅ Bueno';
            estadoClass = 'status-good';
        } else if (rendimiento < 2.0) {
            estado = '⭐ Excelente';
            estadoClass = 'status-excellent';
        } else {
            estado = '🚨 Muy Alto';
            estadoClass = 'status-danger';
        }
        
        html += `
            <tr>
                <td><strong>${niveles[i]}</strong></td>
                <td>${formatNumber(meta)}</td>
                <td>${formatNumber(premio)}</td>
                <td><strong>${rendimiento.toFixed(2)}%</strong></td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

// Actualizar tabla de validación para cantidad
function updateValidationTableCantidad(metas, premios, niveles) {
    const tbody = document.getElementById('validation-tbody-cantidad');
    if (!tbody) return;
    
    let html = '';
    
    for (let i = 0; i < 6; i++) {
        const meta = metas[i];
        const premio = premios[i];
        const premioDesemb = meta > 0 ? (premio / meta) : 0;
        
        // Determinar estado
        let estado = '';
        let estadoClass = '';
        
        if (premioDesemb < 100000) {
            estado = '🚨 Muy Bajo';
            estadoClass = 'status-danger';
        } else if (premioDesemb < 300000) {
            estado = '⚠️ Bajo';
            estadoClass = 'status-warning';
        } else if (premioDesemb < 600000) {
            estado = '✅ Bueno';
            estadoClass = 'status-good';
        } else if (premioDesemb < 1000000) {
            estado = '⭐ Excelente';
            estadoClass = 'status-excellent';
        } else {
            estado = '🚨 Muy Alto';
            estadoClass = 'status-danger';
        }
        
        html += `
            <tr>
                <td><strong>${niveles[i]}</strong></td>
                <td>${meta}</td>
                <td>${formatNumber(premio)}</td>
                <td><strong>${formatNumber(premioDesemb)}</strong></td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

// Cargar sugerencias de validación
function loadValidationAlerts() {
    const currentConfig = getCurrentConfig();
    const suggestionsContainer = document.getElementById('validation-suggestions-container');
    
    if (!suggestionsContainer) return;
    
    const suggestions = [];
    
    // Analizar rendimientos y generar sugerencias
    for (let i = 0; i < 6; i++) {
        const rendInterno = currentConfig.metas.montoInterno[i] > 0 ? 
            (currentConfig.pagos.montoInterno[i] / currentConfig.metas.montoInterno[i] * 100) : 0;
        
        // Sugerir mejoras para rendimientos muy bajos
        if (rendInterno < 0.5) {
            suggestions.push({
                message: `Considerar aumentar premio interno de ${currentConfig.niveles[i]} para mejor motivación`
            });
        }
        
        // Sugerir optimizaciones para rendimientos muy altos
        if (rendInterno > 2.0) {
            suggestions.push({
                message: `${currentConfig.niveles[i]} tiene rendimiento alto (${rendInterno.toFixed(2)}%) - revisar si es sostenible`
            });
        }
    }
    
    // Detectar saltos muy grandes entre niveles
    for (let i = 1; i < 6; i++) {
        const saltoMeta = currentConfig.metas.montoInterno[i] / currentConfig.metas.montoInterno[i-1];
        if (saltoMeta > 3) {
            suggestions.push({
                message: `Considerar agregar nivel intermedio entre ${currentConfig.niveles[i-1]} y ${currentConfig.niveles[i]}`
            });
        }
    }
    
    // Verificar progresión lógica de rendimientos
    const rendimientos = [];
    for (let i = 0; i < 6; i++) {
        const rend = currentConfig.metas.montoInterno[i] > 0 ? 
            (currentConfig.pagos.montoInterno[i] / currentConfig.metas.montoInterno[i] * 100) : 0;
        rendimientos.push(rend);
    }
    
    const promedioRendimiento = rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length;
    if (promedioRendimiento < 0.6) {
        suggestions.push({
            message: `Rendimiento promedio bajo (${promedioRendimiento.toFixed(2)}%) - considerar incrementar premios`
        });
    } else if (promedioRendimiento > 1.5) {
        suggestions.push({
            message: `Rendimiento promedio alto (${promedioRendimiento.toFixed(2)}%) - revisar sostenibilidad financiera`
        });
    }
    
    // Generar HTML de sugerencias
    let suggestionsHtml = '';
    if (suggestions.length === 0) {
        suggestionsHtml = '<div class="suggestion-item">💡 La configuración actual parece estar bien balanceada</div>';
    } else {
        suggestions.forEach(suggestion => {
            suggestionsHtml += `
                <div class="suggestion-item">
                    <span>💡</span>
                    <span>${suggestion.message}</span>
                </div>
            `;
        });
    }
    
    suggestionsContainer.innerHTML = suggestionsHtml;
}



// Actualizar estado de validación
function updateValidationStatus() {
    const statusIcon = document.querySelector('.status-icon');
    const statusText = document.querySelector('.status-text');
    
    if (!statusIcon || !statusText) return;
    
    // Simular análisis
    setTimeout(() => {
        statusIcon.style.animation = 'none';
        statusIcon.textContent = '✅';
        statusText.textContent = 'Análisis completado';
        statusText.style.color = '#2E7D32';
    }, 1500);
}



function refreshValidation() {
    updateValidationDashboard();
    showAdminMessage('🔄 Análisis actualizado', 'success');
    setTimeout(() => hideAdminMessage(), 2000);
}

