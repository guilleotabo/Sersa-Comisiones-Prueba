// FUNCIONES DEL PANEL DE ADMINISTRACIÓN

// Contraseña del admin (en producción esto debería estar en el servidor)
const ADMIN_PASSWORD = 'gtadmin';

// Verificar contraseña admin
function verificarPasswordAdmin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-admin').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        cargarDatosAdmin();
    } else {
        alert('❌ Contraseña incorrecta');
    }
}

// Cargar datos del admin
async function cargarDatosAdmin() {
    await cargarAsesoresAdmin();
    await cargarConfiguracionGeneral();
}

// Cargar lista de asesores en admin
async function cargarAsesoresAdmin() {
    try {
        const { data: usuarios, error } = await supabase
            .from('users')
            .select('*')
            .eq('rol', 'asesor')
            .order('nombre');
        
        if (error) throw error;
        
        const tbody = document.getElementById('asesores-tbody');
        tbody.innerHTML = '';
        
        usuarios.forEach(usuario => {
            const fechaCreacion = new Date(usuario.created_at).toLocaleDateString('es-ES');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${usuario.id.substring(0, 8)}...</code></td>
                <td><strong>${usuario.nombre}</strong></td>
                <td>${usuario.email || '-'}</td>
                <td><span class="role-badge">${usuario.rol}</span></td>
                <td>${fechaCreacion}</td>
                <td>
                    <span class="status-badge ${usuario.activo ? 'active' : 'inactive'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn-edit" onclick="editarAsesor('${usuario.id}')" title="Editar">✏️</button>
                    <button class="btn-toggle btn-secondary" onclick="toggleAsesor('${usuario.id}', ${!usuario.activo})" title="${usuario.activo ? 'Desactivar' : 'Activar'}">
                        ${usuario.activo ? '❌' : '✅'}
                    </button>
                    <button class="btn-delete btn-danger" onclick="borrarAsesor('${usuario.id}', '${usuario.nombre}')" title="Borrar definitivamente">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // También cargar en el selector de configuración individual
        cargarSelectorAsesores();
        
    } catch (error) {
        console.error('Error cargando asesores:', error);
        alert('Error cargando asesores');
    }
}

// Agregar nuevo asesor
async function agregarAsesor() {
    const nombre = prompt('Nombre del asesor:');
    if (!nombre) return;
    
    const email = prompt('Email (opcional - puedes dejarlo vacío):');
    const password = prompt('Contraseña para el asesor:');
    if (!password) return;
    
    try {
        // Crear usuario (combina asesor + login)
        const { error } = await supabase
            .from('users')
            .insert({
                nombre: nombre,
                email: email && email.trim() !== '' ? email : null,
                password_hash: password, // En producción esto debería ser un hash
                activo: true,
                rol: 'asesor'
            });
        
        if (error) throw error;
        
        alert('✅ Asesor agregado exitosamente');
        await cargarAsesoresAdmin();
        
    } catch (error) {
        console.error('Error agregando asesor:', error);
        alert('Error agregando asesor');
    }
}

// Toggle asesor activo/inactivo
async function toggleAsesor(id, activo) {
    try {
        const { error } = await supabase
            .from('users')
            .update({ activo: activo })
            .eq('id', id);
        
        if (error) throw error;
        
        await cargarAsesoresAdmin();
        
    } catch (error) {
        console.error('Error actualizando asesor:', error);
        alert('Error actualizando asesor');
    }
}

// Cargar configuración general
async function cargarConfiguracionGeneral() {
    try {
        const { data: configData, error } = await supabase
            .from('settings')
            .select('config')
            .eq('tipo', 'global')
            .is('user_id', null)
            .eq('activo', true)
            .single();
        
        if (error || !configData || !configData.config) {
            // Usar configuración por defecto
            aplicarConfiguracionAdmin(CONFIG_DEFAULT);
            return;
        }
        
        aplicarConfiguracionAdmin(configData.config);
        
    } catch (error) {
        console.error('Error cargando configuración:', error);
        aplicarConfiguracionAdmin(CONFIG_DEFAULT);
    }
}

// Aplicar configuración al panel admin
function aplicarConfiguracionAdmin(config) {
    // Base fija
    document.getElementById('config-base').value = formatNumber(config.base);
    
    // Niveles
    config.niveles.forEach((nivel, i) => {
        const input = document.getElementById(`config-nivel-${i}`);
        if (input) input.value = nivel;
    });
    
    // Metas
    ['montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad'].forEach(tipo => {
        config.metas[tipo].forEach((meta, i) => {
            const input = document.getElementById(`config-meta-${tipo}-${i}`);
            if (input) {
                if (tipo === 'cantidad') {
                    input.value = meta;
                } else {
                    input.value = formatNumber(meta);
                }
            }
        });
    });
    
    // Bonos/Pagos
    ['carrera', 'montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad', 'equipo'].forEach(tipo => {
        config.pagos[tipo].forEach((pago, i) => {
            const input = document.getElementById(`config-pago-${tipo}-${i}`);
            if (input) input.value = formatNumber(pago);
        });
    });
    
    // Nombres de bonos
    if (config.nombres_bonos) {
        Object.keys(config.nombres_bonos).forEach(tipo => {
            const input = document.getElementById(`config-nombre-${tipo}`);
            if (input) input.value = config.nombres_bonos[tipo];
        });
    }
}

// Guardar configuración
async function guardarConfiguracion() {
    if (!confirm('¿Estás seguro de guardar estos cambios? Afectará a todos los asesores')) return;
    
    try {
        // Recopilar todos los valores
        const config = {
            base: parseInt(document.getElementById('config-base').value.replace(/\./g, '')) || 3000000,
            niveles: [],
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
            nombres_bonos: {},
            multiplicadores: CONFIG_DEFAULT.multiplicadores // Por ahora usar los por defecto
        };
        
        // Niveles
        for (let i = 0; i < 6; i++) {
            const nivel = document.getElementById(`config-nivel-${i}`).value || CONFIG_DEFAULT.niveles[i];
            config.niveles.push(nivel);
        }
        
        // Metas y pagos
        for (let i = 0; i < 6; i++) {
            // Metas
            config.metas.montoInterno[i] = parseInt(document.getElementById(`config-meta-montoInterno-${i}`).value.replace(/\./g, '')) || 0;
            config.metas.montoExterno[i] = parseInt(document.getElementById(`config-meta-montoExterno-${i}`).value.replace(/\./g, '')) || 0;
            config.metas.montoRecuperado[i] = parseInt(document.getElementById(`config-meta-montoRecuperado-${i}`).value.replace(/\./g, '')) || 0;
            config.metas.cantidad[i] = parseInt(document.getElementById(`config-meta-cantidad-${i}`).value) || 0;
            
            // Pagos
            config.pagos.carrera[i] = parseInt(document.getElementById(`config-pago-carrera-${i}`).value.replace(/\./g, '')) || 0;
            config.pagos.montoInterno[i] = parseInt(document.getElementById(`config-pago-montoInterno-${i}`).value.replace(/\./g, '')) || 0;
            config.pagos.montoExterno[i] = parseInt(document.getElementById(`config-pago-montoExterno-${i}`).value.replace(/\./g, '')) || 0;
            config.pagos.montoRecuperado[i] = parseInt(document.getElementById(`config-pago-montoRecuperado-${i}`).value.replace(/\./g, '')) || 0;
            config.pagos.cantidad[i] = parseInt(document.getElementById(`config-pago-cantidad-${i}`).value.replace(/\./g, '')) || 0;
            config.pagos.equipo[i] = parseInt(document.getElementById(`config-pago-equipo-${i}`).value.replace(/\./g, '')) || 0;
        }
        
        // Nombres de bonos
        ['interno', 'externo', 'cantidad', 'recuperados', 'carrera', 'equipo'].forEach(tipo => {
            const input = document.getElementById(`config-nombre-${tipo}`);
            if (input) config.nombres_bonos[tipo] = input.value;
        });
        
        // Guardar en Supabase (upsert configuración global)
        const { error } = await supabase
            .from('settings')
            .upsert({ 
                tipo: 'global',
                user_id: null,
                config: config,
                activo: true 
            })
            .eq('tipo', 'global')
            .is('user_id', null);
        
        if (error) throw error;
        
        alert('✅ Configuración guardada exitosamente');
        
    } catch (error) {
        console.error('Error guardando configuración:', error);
        alert('❌ Error guardando configuración');
    }
}

// Funciones de utilidad para el admin
function formatearInputAdmin(input) {
    const value = input.value.replace(/\./g, '');
    if (value) {
        input.value = formatNumber(parseInt(value));
    }
}

// Cambiar tab activa
function cambiarTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar tab seleccionada
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.target.classList.add('active');
    
    // Cargar datos según el tab
    if (tabName === 'asesores') {
        cargarAsesoresAdmin();
    } else if (tabName === 'config-individual') {
        cargarSelectorAsesores();
    } else if (tabName === 'config') {
        cargarConfiguracionGeneral();
    }
}

// Editar asesor
async function editarAsesor(id) {
    try {
        const { data: usuario, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const nuevoNombre = prompt('Nuevo nombre:', usuario.nombre);
        if (!nuevoNombre) return;
        
        const nuevoEmail = prompt('Nuevo email (opcional - dejar vacío para quitar):', usuario.email || '');
        const nuevaPassword = prompt('Nueva contraseña (dejar vacío para mantener actual):', '');
        
        // Actualizar usuario (incluye todo en una tabla)
        const updateData = {
            nombre: nuevoNombre,
            email: nuevoEmail && nuevoEmail.trim() !== '' ? nuevoEmail : null
        };
        
        if (nuevaPassword && nuevaPassword.trim() !== '') {
            updateData.password_hash = nuevaPassword;
        }
        
        const { error: errorUpdate } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id);
        
        if (errorUpdate) throw errorUpdate;
        
        alert('✅ Asesor actualizado exitosamente');
        await cargarAsesoresAdmin();
        
    } catch (error) {
        console.error('Error editando asesor:', error);
        alert('❌ Error editando asesor');
    }
}

// Borrar asesor definitivamente
async function borrarAsesor(id, nombre) {
    // Confirmación doble para evitar borrados accidentales
    const confirmacion1 = confirm(`⚠️ ¿Estás seguro de que quieres BORRAR definitivamente al asesor "${nombre}"?`);
    if (!confirmacion1) return;
    
    const confirmacion2 = confirm(`🚨 ÚLTIMA CONFIRMACIÓN: Esto eliminará PERMANENTEMENTE al asesor "${nombre}" y NO se puede deshacer. ¿Continuar?`);
    if (!confirmacion2) return;
    
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        alert(`✅ Asesor "${nombre}" eliminado definitivamente`);
        await cargarAsesoresAdmin();
        
    } catch (error) {
        console.error('Error borrando asesor:', error);
        alert('❌ Error eliminando asesor');
    }
}

// Cargar selector de asesores para configuración individual
async function cargarSelectorAsesores() {
    try {
        const { data: usuarios, error } = await supabase
            .from('users')
            .select('id, nombre')
            .eq('rol', 'asesor')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        const select = document.getElementById('asesor-selector');
        select.innerHTML = '<option value="">-- Selecciona un asesor --</option>';
        
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = usuario.nombre;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando selector de asesores:', error);
    }
}

// Cargar configuración específica de un asesor
async function cargarConfiguracionAsesor() {
    const asesorId = document.getElementById('asesor-selector').value;
    const contenido = document.getElementById('config-asesor-content');
    
    if (!asesorId) {
        contenido.style.display = 'none';
        return;
    }
    
    try {
        // Buscar configuración específica del asesor
        const { data: configAsesor, error } = await supabase
            .from('settings')
            .select('config')
            .eq('tipo', 'user_specific')
            .eq('user_id', asesorId)
            .eq('activo', true)
            .single();
        
        let config;
        if (configAsesor && configAsesor.config) {
            config = configAsesor.config;
        } else {
            // Si no tiene configuración específica, usar la global como base
            const { data: configGlobal, error: errorGlobal } = await supabase
                .from('settings')
                .select('config')
                .eq('tipo', 'global')
                .is('user_id', null)
                .eq('activo', true)
                .single();
            
            config = configGlobal?.config || CONFIG_DEFAULT;
        }
        
        // Aplicar configuración a los campos
        aplicarConfiguracionAsesor(config);
        contenido.style.display = 'block';
        
    } catch (error) {
        console.error('Error cargando configuración del asesor:', error);
        // Usar configuración por defecto
        aplicarConfiguracionAsesor(CONFIG_DEFAULT);
        contenido.style.display = 'block';
    }
}

// Aplicar configuración a los campos del formulario de asesor
function aplicarConfiguracionAsesor(config) {
    // Base fija
    document.getElementById('config-asesor-base').value = formatNumber(config.base || 3000000);
    
    // Niveles
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-nivel-${i}`).value = config.niveles?.[i] || CONFIG_DEFAULT.niveles[i];
    }
    
    // Metas
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-meta-montoInterno-${i}`).value = formatNumber(config.metas?.montoInterno?.[i] || CONFIG_DEFAULT.metas.montoInterno[i]);
        document.getElementById(`config-asesor-meta-montoExterno-${i}`).value = formatNumber(config.metas?.montoExterno?.[i] || CONFIG_DEFAULT.metas.montoExterno[i]);
        document.getElementById(`config-asesor-meta-montoRecuperado-${i}`).value = formatNumber(config.metas?.montoRecuperado?.[i] || CONFIG_DEFAULT.metas.montoRecuperado[i]);
        document.getElementById(`config-asesor-meta-cantidad-${i}`).value = config.metas?.cantidad?.[i] || CONFIG_DEFAULT.metas.cantidad[i];
    }
    
    // Pagos
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-pago-carrera-${i}`).value = formatNumber(config.pagos?.carrera?.[i] || CONFIG_DEFAULT.pagos.carrera[i]);
        document.getElementById(`config-asesor-pago-montoInterno-${i}`).value = formatNumber(config.pagos?.montoInterno?.[i] || CONFIG_DEFAULT.pagos.montoInterno[i]);
        document.getElementById(`config-asesor-pago-montoExterno-${i}`).value = formatNumber(config.pagos?.montoExterno?.[i] || CONFIG_DEFAULT.pagos.montoExterno[i]);
        document.getElementById(`config-asesor-pago-montoRecuperado-${i}`).value = formatNumber(config.pagos?.montoRecuperado?.[i] || CONFIG_DEFAULT.pagos.montoRecuperado[i]);
        document.getElementById(`config-asesor-pago-cantidad-${i}`).value = formatNumber(config.pagos?.cantidad?.[i] || CONFIG_DEFAULT.pagos.cantidad[i]);
        document.getElementById(`config-asesor-pago-equipo-${i}`).value = formatNumber(config.pagos?.equipo?.[i] || CONFIG_DEFAULT.pagos.equipo[i]);
    }
    
    // Nombres de bonos
    document.getElementById('config-asesor-nombre-interno').value = config.nombres_bonos?.interno || '📊 MONTO INTERNO - Meta desembolso | Bono';
    document.getElementById('config-asesor-nombre-externo').value = config.nombres_bonos?.externo || '💎 MONTO EXTERNO/REFERENCIADO - Meta | Bono';
    document.getElementById('config-asesor-nombre-cantidad').value = config.nombres_bonos?.cantidad || '🎯 CANTIDAD DESEMBOLSOS - Meta | Bono | Llave';
    document.getElementById('config-asesor-nombre-recuperados').value = config.nombres_bonos?.recuperados || '🔄 RECUPERADOS +3 MESES - Meta | Bono';
    document.getElementById('config-asesor-nombre-carrera').value = config.nombres_bonos?.carrera || '📈 BONO CARRERA - Según menor nivel entre mes actual y anterior';
    document.getElementById('config-asesor-nombre-equipo').value = config.nombres_bonos?.equipo || '👥 BONO EQUIPO - Según menor nivel del equipo';
}

// Guardar configuración específica del asesor
async function guardarConfiguracionAsesor() {
    const asesorId = document.getElementById('asesor-selector').value;
    
    if (!asesorId) {
        alert('Por favor selecciona un asesor');
        return;
    }
    
    if (!confirm('¿Estás seguro de guardar esta configuración específica para este asesor?')) return;
    
    try {
        // Recopilar todos los valores
        const config = {
            base: parseInt(document.getElementById('config-asesor-base').value.replace(/\./g, '')) || 3000000,
            niveles: [],
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
            nombres_bonos: {},
            multiplicadores: CONFIG_DEFAULT.multiplicadores // Por ahora usar los por defecto
        };
        
        // Niveles
        for (let i = 0; i < 6; i++) {
            const nivel = document.getElementById(`config-asesor-nivel-${i}`).value || CONFIG_DEFAULT.niveles[i];
            config.niveles.push(nivel);
        }
        
        // Metas
        for (let i = 0; i < 6; i++) {
            config.metas.montoInterno.push(parseInt(document.getElementById(`config-asesor-meta-montoInterno-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.metas.montoInterno[i]);
            config.metas.montoExterno.push(parseInt(document.getElementById(`config-asesor-meta-montoExterno-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.metas.montoExterno[i]);
            config.metas.montoRecuperado.push(parseInt(document.getElementById(`config-asesor-meta-montoRecuperado-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.metas.montoRecuperado[i]);
            config.metas.cantidad.push(parseInt(document.getElementById(`config-asesor-meta-cantidad-${i}`).value) || CONFIG_DEFAULT.metas.cantidad[i]);
        }
        
        // Pagos
        for (let i = 0; i < 6; i++) {
            config.pagos.carrera.push(parseInt(document.getElementById(`config-asesor-pago-carrera-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.carrera[i]);
            config.pagos.montoInterno.push(parseInt(document.getElementById(`config-asesor-pago-montoInterno-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.montoInterno[i]);
            config.pagos.montoExterno.push(parseInt(document.getElementById(`config-asesor-pago-montoExterno-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.montoExterno[i]);
            config.pagos.montoRecuperado.push(parseInt(document.getElementById(`config-asesor-pago-montoRecuperado-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.montoRecuperado[i]);
            config.pagos.cantidad.push(parseInt(document.getElementById(`config-asesor-pago-cantidad-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.cantidad[i]);
            config.pagos.equipo.push(parseInt(document.getElementById(`config-asesor-pago-equipo-${i}`).value.replace(/\./g, '')) || CONFIG_DEFAULT.pagos.equipo[i]);
        }
        
        // Nombres de bonos
        config.nombres_bonos = {
            interno: document.getElementById('config-asesor-nombre-interno').value || '📊 MONTO INTERNO - Meta desembolso | Bono',
            externo: document.getElementById('config-asesor-nombre-externo').value || '💎 MONTO EXTERNO/REFERENCIADO - Meta | Bono',
            cantidad: document.getElementById('config-asesor-nombre-cantidad').value || '🎯 CANTIDAD DESEMBOLSOS - Meta | Bono | Llave',
            recuperados: document.getElementById('config-asesor-nombre-recuperados').value || '🔄 RECUPERADOS +3 MESES - Meta | Bono',
            carrera: document.getElementById('config-asesor-nombre-carrera').value || '📈 BONO CARRERA - Según menor nivel entre mes actual y anterior',
            equipo: document.getElementById('config-asesor-nombre-equipo').value || '👥 BONO EQUIPO - Según menor nivel del equipo'
        };
        
        // Guardar en Supabase (upsert configuración específica del asesor)
        const { error } = await supabase
            .from('settings')
            .upsert({ 
                tipo: 'user_specific',
                user_id: asesorId,
                config: config,
                activo: true 
            })
            .eq('tipo', 'user_specific')
            .eq('user_id', asesorId);
        
        if (error) throw error;
        
        alert('✅ Configuración del asesor guardada exitosamente');
        
    } catch (error) {
        console.error('Error guardando configuración del asesor:', error);
        alert('❌ Error guardando configuración del asesor');
    }
}

// Copiar configuración desde otro asesor
async function copiarConfiguracion() {
    const asesorDestinoId = document.getElementById('asesor-selector').value;
    
    if (!asesorDestinoId) {
        alert('Primero selecciona el asesor destino');
        return;
    }
    
    try {
        // Obtener lista de asesores para seleccionar origen
        const { data: usuarios, error } = await supabase
            .from('users')
            .select('id, nombre')
            .eq('rol', 'asesor')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        // Crear opciones para el prompt
        let opciones = 'Selecciona el asesor desde el cual copiar la configuración:\n\n';
        opciones += '0. Configuración Global (por defecto)\n';
        usuarios.forEach((usuario, index) => {
            if (usuario.id !== asesorDestinoId) {
                opciones += `${index + 1}. ${usuario.nombre}\n`;
            }
        });
        
        const seleccion = prompt(opciones + '\nIngresa el número:');
        if (!seleccion) return;
        
        const indice = parseInt(seleccion) - 1;
        let configOrigen;
        
        if (seleccion === '0') {
            // Usar configuración global
            const { data: configGlobal, error: errorGlobal } = await supabase
                .from('settings')
                .select('config')
                .eq('tipo', 'global')
                .is('user_id', null)
                .eq('activo', true)
                .single();
            
            configOrigen = configGlobal?.config || CONFIG_DEFAULT;
        } else {
            // Usar configuración de otro asesor
            const asesorOrigenId = usuarios.filter(u => u.id !== asesorDestinoId)[indice]?.id;
            
            if (!asesorOrigenId) {
                alert('Selección inválida');
                return;
            }
            
            const { data: configAsesor, error } = await supabase
                .from('settings')
                .select('config')
                .eq('tipo', 'user_specific')
                .eq('user_id', asesorOrigenId)
                .eq('activo', true)
                .single();
            
            configOrigen = configAsesor?.config || CONFIG_DEFAULT;
        }
        
        // Aplicar configuración copiada
        aplicarConfiguracionAsesor(configOrigen);
        alert('✅ Configuración copiada exitosamente. No olvides guardar los cambios.');
        
    } catch (error) {
        console.error('Error copiando configuración:', error);
        alert('❌ Error copiando configuración');
    }
}

// Volver al sistema principal
function volverAlSistema() {
    window.location.href = 'index.html';
} 