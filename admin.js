// FUNCIONES DEL PANEL DE ADMINISTRACIÓN

// Verificar autenticación al cargar la página
window.addEventListener('DOMContentLoaded', function() {
    // SEGURIDAD: Verificar que viene autenticado desde el login
    if (window.location.hash.includes('admin-authenticated')) {
        // Usuario autenticado correctamente, mostrar panel admin
        document.getElementById('admin-content').style.display = 'block';
        
        // Cargar datos del admin
        cargarDatosAdmin();
        
        // Limpiar el hash por seguridad
        window.location.hash = '';
    } else {
        // SEGURIDAD: Redirigir al login principal si no está autenticado
        window.location.href = 'index.html';
    }
});

// Función legacy para compatibilidad
function verificarPasswordAdmin() {
    // Redirigir al login principal
    window.location.href = 'index.html';
}

// Cargar datos del admin
async function cargarDatosAdmin() {
    console.log('🔄 Cargando datos del admin...');
    try {
        await cargarAsesoresAdmin();
        await cargarConfiguracionGeneral();
        console.log('✅ Datos del admin cargados');
    } catch (error) {
        console.error('❌ Error cargando datos del admin:', error);
    }
}

// Cargar lista de asesores en admin
async function cargarAsesoresAdmin() {
    try {
        const { data: usuarios, error } = await supabase
            .from('users')
            .select('*, id_simple, codigo')
            .in('rol', ['asesor', 'admin'])
            .order('rol', { ascending: false }) // Admin primero
            .order('nombre');
        
        if (error) throw error;
        
        const tbody = document.getElementById('asesores-tbody');
        tbody.innerHTML = '';
        
        usuarios.forEach(usuario => {
            const fechaCreacion = new Date(usuario.created_at).toLocaleDateString('es-ES');
            const tr = document.createElement('tr');
            
            // Generar código apropiado según el rol
            let codigo = '';
            if (usuario.rol === 'admin') {
                codigo = usuario.codigo || 'ADM' + String(usuario.id_simple).padStart(3, '0');
            } else {
                codigo = usuario.codigo || 'ASR' + String(usuario.id_simple).padStart(3, '0');
            }
            
            tr.innerHTML = `
                <td><code>${codigo}</code></td>
                <td><strong>${usuario.nombre}</strong></td>
                <td>${usuario.email || '-'}</td>
                <td><span class="role-badge ${usuario.rol === 'admin' ? 'admin' : ''}">${usuario.rol === 'admin' ? '🛠️ Admin' : '👤 Asesor'}</span></td>
                <td>${fechaCreacion}</td>
                <td>
                    <span class="status-badge ${usuario.activo ? 'active' : 'inactive'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn-edit" onclick="abrirModalAsesor('editar', '${usuario.id}')" title="Editar">✏️</button>
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

// Variables globales para el modal
let modalAsesorId = null;
let modalTipo = null;

// Abrir modal para editar/agregar asesor
async function abrirModalAsesor(tipo, asesorId = null) {
    modalTipo = tipo;
    modalAsesorId = asesorId;
    
    const modal = document.getElementById('modal-asesor');
    const titulo = document.getElementById('modal-title');
    const passwordHelp = document.getElementById('password-help');
    
    // Limpiar formulario
    document.getElementById('form-asesor').reset();
    
    if (tipo === 'nuevo') {
        titulo.textContent = '➕ Agregar Nuevo Usuario';
        passwordHelp.textContent = 'Contraseña requerida para nuevo usuario';
        document.getElementById('modal-password').required = true;
    } else {
        titulo.textContent = '✏️ Editar Usuario';
        passwordHelp.textContent = 'Dejar vacío para mantener la contraseña actual';
        document.getElementById('modal-password').required = false;
        
        // Cargar datos del asesor
        try {
            const { data: usuario, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', asesorId)
                .maybeSingle();
            
            if (error) throw error;
            
            if (!usuario) {
                alert('Usuario no encontrado');
                return;
            }
            
            document.getElementById('modal-nombre').value = usuario.nombre;
            document.getElementById('modal-email').value = usuario.email || '';
            document.getElementById('modal-rol').value = usuario.rol;
            document.getElementById('modal-activo').value = usuario.activo.toString();
            
        } catch (error) {
            console.error('Error cargando asesor:', error);
            alert('Error cargando datos del asesor');
            return;
        }
    }
    
    // Mostrar modal
    modal.classList.add('active');
}

// Cerrar modal
function cerrarModalAsesor() {
    const modal = document.getElementById('modal-asesor');
    modal.classList.remove('active');
    modalAsesorId = null;
    modalTipo = null;
}

// Guardar asesor (nuevo o editado)
async function guardarAsesor() {
    const nombre = document.getElementById('modal-nombre').value.trim();
    const email = document.getElementById('modal-email').value.trim();
    const rol = document.getElementById('modal-rol').value;
    const password = document.getElementById('modal-password').value;
    const activo = document.getElementById('modal-activo').value === 'true';
    
    if (!nombre) {
        alert('El nombre es requerido');
        return;
    }
    
    if (modalTipo === 'nuevo' && !password) {
        alert('La contraseña es requerida para nuevos usuarios');
        return;
    }
    
    const saveBtn = document.querySelector('.btn-modal-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';
    
    try {
        const userData = {
            nombre: nombre,
            email: email || null,
            rol: rol,
            activo: activo
        };
        
        if (password) {
            userData.password_hash = password;
        }
        
        if (modalTipo === 'nuevo') {
            const { error } = await supabase
                .from('users')
                .insert(userData);
            
            if (error) throw error;
            
            alert('✅ Usuario agregado exitosamente');
        } else {
            const { error } = await supabase
                .from('users')
                .update(userData)
                .eq('id', modalAsesorId);
            
            if (error) throw error;
            
            alert('✅ Usuario actualizado exitosamente');
        }
        
        await cargarAsesoresAdmin();
        cerrarModalAsesor();
        
    } catch (error) {
        console.error('Error guardando asesor:', error);
        alert('❌ Error guardando asesor');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Guardar';
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
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
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

// Guardar configuración (plantilla base)
async function guardarConfiguracion() {
    if (!confirm('¿Estás seguro de guardar esta plantilla base? Se usará para nuevos asesores')) return;
    
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

// Cerrar modal con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('modal-asesor').classList.contains('active')) {
        cerrarModalAsesor();
    }
});

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-asesor');
    if (e.target === modal && modal.classList.contains('active')) {
        cerrarModalAsesor();
    }
});

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
            .select('id, nombre, codigo, id_simple')
            .eq('rol', 'asesor')
            .eq('activo', true)
            .order('nombre');
        
        if (error) throw error;
        
        const select = document.getElementById('asesor-selector');
        select.innerHTML = '<option value="">-- Selecciona un asesor --</option>';
        
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.codigo || 'ASR' + String(usuario.id_simple).padStart(3, '0')} - ${usuario.nombre}`;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando selector de asesores:', error);
    }
}

// CARGAR CONFIGURACIÓN - REPLICANDO PATRÓN DE USUARIOS QUE FUNCIONA
async function cargarConfiguracionAsesor() {
    const asesorId = document.getElementById('asesor-selector').value;
    const contenido = document.getElementById('config-asesor-content');
    const navegacion = document.getElementById('config-nav');
    const btnDescargar = document.getElementById('btn-descargar-config');
    
    if (!asesorId) {
        contenido.style.display = 'none';
        navegacion.style.display = 'none';
        if (btnDescargar) btnDescargar.disabled = true;
        return;
    }
    
    try {
        // CORREGIDO: Buscar configuración específica tomando la más reciente
        const { data: configData, error } = await supabase
            .from('settings')
            .select('*')
            .eq('tipo', 'user_specific')
            .eq('user_id', asesorId)
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (error) {
            console.error('Error en consulta:', error);
            throw error;
        }
        
        let config;
        if (configData && configData.config) {
            // Existe configuración - usar esa
            config = configData.config;
            console.log('✅ Configuración cargada desde BD para asesor:', asesorId);
        } else {
            // No existe - crear nueva con defaults
            config = CONFIG_DEFAULT;
            // Crear registro en BD
            const { error: insertError } = await supabase
                .from('settings')
                .insert({
                    tipo: 'user_specific',
                    user_id: asesorId,
                    config: config,
                    activo: true
                });
            
            if (insertError) {
                console.error('Error creando configuración:', insertError);
                throw insertError;
            }
            console.log('🆕 Configuración inicial creada para asesor:', asesorId);
        }
        
        // EXACTAMENTE IGUAL QUE USUARIOS: Aplicar datos a formulario
        aplicarConfiguracionAFormulario(config);
        
        // Mostrar interfaz
        contenido.style.display = 'block';
        navegacion.style.display = 'flex';
        if (btnDescargar) btnDescargar.disabled = false;
        inicializarNavegacionInterna();
        
    } catch (error) {
        console.error('❌ Error cargando configuración:', error);
        alert('❌ Error cargando configuración del asesor');
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

// Variable para rastrear el asesor actual
let asesorActualEnEdicion = null;

// Función simplificada para cambiar de asesor - SIN auto-guardado
async function cambiarAsesor() {
    const nuevoAsesorId = document.getElementById('asesor-selector').value;
    
    // Si no hay asesor seleccionado, limpiar la interfaz
    if (!nuevoAsesorId) {
        limpiarInterfazAsesor();
        asesorActualEnEdicion = null;
        return;
    }
    
    // Si había un asesor anterior, preguntar si quiere cambiar
    if (asesorActualEnEdicion && asesorActualEnEdicion !== nuevoAsesorId) {
        const confirmar = confirm('¿Deseas cambiar de asesor?\n\n⚠️ IMPORTANTE: Si tienes cambios sin guardar, se perderán.\n\nUsa el botón "Guardar Todo" antes de cambiar si necesitas conservar los cambios.');
        
        if (!confirmar) {
            // Restaurar el selector al asesor anterior
            document.getElementById('asesor-selector').value = asesorActualEnEdicion;
            return;
        }
    }
    
    // Actualizar el asesor actual y cargar su configuración
    asesorActualEnEdicion = nuevoAsesorId;
    await cargarConfiguracionAsesor();
}

// Función para limpiar la interfaz cuando no hay asesor seleccionado
function limpiarInterfazAsesor() {
    const contenido = document.getElementById('config-asesor-content');
    const navegacion = document.getElementById('config-nav');
    const btnDescargar = document.getElementById('btn-descargar-config');
    
    if (contenido) contenido.style.display = 'none';
    if (navegacion) navegacion.style.display = 'none';
    if (btnDescargar) btnDescargar.disabled = true;
    
    // Limpiar multiplicadores actuales
    window.multiplicadoresActuales = null;
}

// Función para descargar configuración del asesor actual
async function descargarConfiguracion() {
    const asesorId = document.getElementById('asesor-selector').value;
    
    if (!asesorId) {
        alert('Selecciona un asesor primero');
        return;
    }
    
    try {
        // Obtener configuración del asesor
        const { data: configAsesor, error } = await supabase
            .from('settings')
            .select('config')
            .eq('tipo', 'user_specific')
            .eq('user_id', asesorId)
            .eq('activo', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        let config;
        if (configAsesor && configAsesor.config) {
            config = configAsesor.config;
        } else {
            // Si no tiene configuración específica, usar la global
            const { data: configGlobal, error: errorGlobal } = await supabase
                .from('settings')
                .select('config')
                .eq('tipo', 'global')
                .is('user_id', null)
                .eq('activo', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            config = configGlobal?.config || CONFIG_DEFAULT;
        }
        
        // Obtener información del asesor
        const { data: asesor, error: errorAsesor } = await supabase
            .from('users')
            .select('nombre, codigo')
            .eq('id', asesorId)
            .maybeSingle();
        
        const nombreAsesor = asesor?.nombre || 'Asesor';
        const codigoAsesor = asesor?.codigo || `ASR${asesorId}`;
        
        // Crear archivo JSON
        const configCompleta = {
            asesor: {
                id: asesorId,
                nombre: nombreAsesor,
                codigo: codigoAsesor
            },
            configuracion: config,
            fechaExportacion: new Date().toISOString(),
            version: "1.0"
        };
        
        // Descargar archivo
        const blob = new Blob([JSON.stringify(configCompleta, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `config_${codigoAsesor}_${nombreAsesor.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Configuración descargada exitosamente');
        
    } catch (error) {
        console.error('Error descargando configuración:', error);
        alert('❌ Error descargando configuración');
    }
}

// Volver al sistema principal
function volverAlSistema() {
    window.location.href = 'index.html';
}

// ========================================
// NUEVAS FUNCIONES PARA SISTEMA UNIFICADO
// ========================================

// FUNCIÓN DUPLICADA ELIMINADA - usar la función principal cargarConfiguracionAsesor()

// Aplicar configuración al formulario unificado
function aplicarConfiguracionAsesorUnificado(config) {
    // Base fija
    document.getElementById('config-asesor-base').value = formatNumber(config.base);
    
    // Niveles
    config.niveles.forEach((nivel, i) => {
        const input = document.getElementById(`config-asesor-nivel-${i}`);
        if (input) input.value = nivel;
    });
    
    // Metas
    ['montoInterno', 'montoExterno', 'montoRecuperado', 'cantidad'].forEach(tipo => {
        config.metas[tipo].forEach((meta, i) => {
            const input = document.getElementById(`config-asesor-meta-${tipo}-${i}`);
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
            const input = document.getElementById(`config-asesor-pago-${tipo}-${i}`);
            if (input) input.value = formatNumber(pago);
        });
    });
    
    // Nombres de bonos
    if (config.nombres_bonos) {
        Object.keys(config.nombres_bonos).forEach(tipo => {
            const input = document.getElementById(`config-asesor-nombre-${tipo}`);
            if (input) input.value = config.nombres_bonos[tipo];
        });
    }
}

// Cargar multiplicadores para el asesor específico - INTERFAZ NUEVA
async function cargarMultiplicadoresAsesorUnificado(asesorId, config) {
    const container = document.getElementById('multiplicadores-list-asesor');
    
    if (!container) {
        return;
    }
    
    // Usar multiplicadores de la configuración (nueva estructura)
    const multiplicadores = config.multiplicadores || CONFIG_DEFAULT.multiplicadores;
    
    console.log('🔍 Debug - multiplicadores cargados:', multiplicadores);
    
    // Asegurar que window.multiplicadoresActuales se actualice
    window.multiplicadoresActuales = multiplicadores;
    
    let html = `
        <div class="multiplicadores-header">
            <h4>📊 Configuración de Multiplicadores</h4>
            <p class="help-text">Los multiplicadores se aplican en cadena: Conversión × Empatía × Proceso × Mora</p>
        </div>
    `;
    
    // Mapeo de nombres y colores
    const multInfo = {
        conversion: { nombre: 'Conversión', color: '#4CAF50', icono: '📈', desc: 'Porcentaje de conversión de leads' },
        empatia: { nombre: 'Empatía', color: '#2196F3', icono: '💝', desc: 'Nivel de satisfacción del cliente' },
        proceso: { nombre: 'Proceso', color: '#FF9800', icono: '⚙️', desc: 'Cumplimiento de procesos' },
        mora: { nombre: 'Mora', color: '#F44336', icono: '⏰', desc: 'Porcentaje de mora en cartera' }
    };
    
    Object.keys(multiplicadores).forEach(key => {
        const rangos = multiplicadores[key];
        const info = multInfo[key] || { nombre: key, color: '#666', icono: '📊', desc: 'Multiplicador personalizado' };
        
        html += `
            <div class="multiplicador-card-nueva" data-mult="${key}">
                <div class="multiplicador-header-nueva">
                    <div class="multiplicador-title-section">
                        <h5 class="multiplicador-title-nueva">${info.icono} ${info.nombre}</h5>
                        <p class="multiplicador-desc">${info.desc}</p>
                    </div>
                    <div class="multiplicador-actions">
                        <button class="btn-action btn-add" onclick="agregarRangoNuevo('${key}')" title="Agregar rango">
                            ➕ Agregar
                        </button>
                    </div>
                </div>
                
                <div class="multiplicador-rangos-nueva" id="rangos-${key}">
        `;
        
        rangos.forEach((rango, index) => {
            html += crearRangoHTML(key, rango, index);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Guardar referencia para uso posterior (confirmación)
    window.multiplicadoresActuales = multiplicadores;
    
    console.log('🎯 Multiplicadores cargados en interfaz y guardados en window.multiplicadoresActuales');
}

// Crear HTML para un rango individual
function crearRangoHTML(multKey, rango, index) {
    return `
        <div class="rango-item-nueva" data-mult="${multKey}" data-index="${index}">
            <div class="rango-controls">
                <div class="rango-field">
                    <label>Valor mínimo</label>
                    <input type="number" 
                           value="${rango.min}" 
                           min="0" 
                           max="100"
                           data-field="min"
                           class="rango-input"
                           onchange="actualizarRango('${multKey}', ${index}, 'min', this.value)">
                </div>
                
                <div class="rango-field">
                    <label>Texto</label>
                    <input type="text" 
                           value="${rango.text}" 
                           data-field="text"
                           class="rango-input"
                           onchange="actualizarRango('${multKey}', ${index}, 'text', this.value)">
                </div>
                
                <div class="rango-field">
                    <label>Multiplicador</label>
                    <input type="number" 
                           value="${rango.mult}" 
                           step="0.01" 
                           min="0" 
                           max="2"
                           data-field="mult"
                           class="rango-input"
                           onchange="actualizarRango('${multKey}', ${index}, 'mult', this.value)">
                </div>
                
                <div class="rango-field">
                    <label>Acciones</label>
                    <button class="btn-action btn-delete" 
                            onclick="eliminarRangoNuevo('${multKey}', ${index})" 
                            title="Eliminar rango">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Inicializar navegación interna
function inicializarNavegacionInterna() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase active de todos los links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Hacer scroll a la sección correspondiente
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Función eliminada - ya no se necesita auto-guardado

// GUARDAR CONFIGURACIÓN - VERSIÓN SIMPLIFICADA
async function guardarConfiguracionCompleta() {
    const asesorId = document.getElementById('asesor-selector').value;
    
    if (!asesorId) {
        alert('Selecciona un asesor primero');
        return;
    }
    
    if (!confirm('¿Estás seguro de guardar toda la configuración de este asesor?')) return;
    
    const btnGuardarFloating = document.querySelector('.btn-floating');
    
    // Deshabilitar botón
    if (btnGuardarFloating) {
        btnGuardarFloating.disabled = true;
        btnGuardarFloating.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Guardando...</span>';
    }
    
    try {
        // Recopilar datos del formulario
        const configData = {
            config: recopilarConfiguracionDelFormulario()
        };
        
        // Actualizar en BD usando upsert para evitar duplicados
        const { error } = await supabase
            .from('settings')
            .upsert({ 
                tipo: 'user_specific',
                user_id: asesorId,
                config: configData.config,
                activo: true 
            });
        
        if (error) throw error;
        
        console.log('✅ Configuración actualizada exitosamente para asesor:', asesorId);
        alert('✅ Configuración guardada exitosamente en base de datos');
        
    } catch (error) {
        console.error('❌ Error guardando configuración:', error);
        alert('❌ Error guardando configuración');
        throw error;
    } finally {
        // Rehabilitar botón
        if (btnGuardarFloating) {
            btnGuardarFloating.disabled = false;
            btnGuardarFloating.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Guardar Todo</span>';
        }
    }
}

// APLICAR CONFIGURACIÓN A FORMULARIO - EXACTAMENTE IGUAL QUE USUARIOS
function aplicarConfiguracionAFormulario(config) {
    // Base
    document.getElementById('config-asesor-base').value = formatNumber(config.base);
    
    // Niveles
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-nivel-${i}`).value = config.niveles[i];
    }
    
    // Metas
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-meta-montoInterno-${i}`).value = formatNumber(config.metas.montoInterno[i]);
        document.getElementById(`config-asesor-meta-montoExterno-${i}`).value = formatNumber(config.metas.montoExterno[i]);
        document.getElementById(`config-asesor-meta-montoRecuperado-${i}`).value = formatNumber(config.metas.montoRecuperado[i]);
        document.getElementById(`config-asesor-meta-cantidad-${i}`).value = config.metas.cantidad[i];
    }
    
    // Pagos
    for (let i = 0; i < 6; i++) {
        document.getElementById(`config-asesor-pago-carrera-${i}`).value = formatNumber(config.pagos.carrera[i]);
        document.getElementById(`config-asesor-pago-montoInterno-${i}`).value = formatNumber(config.pagos.montoInterno[i]);
        document.getElementById(`config-asesor-pago-montoExterno-${i}`).value = formatNumber(config.pagos.montoExterno[i]);
        document.getElementById(`config-asesor-pago-montoRecuperado-${i}`).value = formatNumber(config.pagos.montoRecuperado[i]);
        document.getElementById(`config-asesor-pago-cantidad-${i}`).value = formatNumber(config.pagos.cantidad[i]);
        document.getElementById(`config-asesor-pago-equipo-${i}`).value = formatNumber(config.pagos.equipo[i]);
    }
    
    // Nombres de bonos
    document.getElementById('config-asesor-nombre-interno').value = config.nombres_bonos.interno;
    document.getElementById('config-asesor-nombre-externo').value = config.nombres_bonos.externo;
    document.getElementById('config-asesor-nombre-cantidad').value = config.nombres_bonos.cantidad;
    document.getElementById('config-asesor-nombre-recuperados').value = config.nombres_bonos.recuperados;
    document.getElementById('config-asesor-nombre-carrera').value = config.nombres_bonos.carrera;
    document.getElementById('config-asesor-nombre-equipo').value = config.nombres_bonos.equipo;
    
    // Multiplicadores - CORREGIDO
    cargarMultiplicadoresAsesorUnificado(null, config);
    
    console.log('✅ Configuración aplicada completamente, incluyendo multiplicadores');
}

// RECOPILAR CONFIGURACIÓN DEL FORMULARIO - INCLUYENDO MULTIPLICADORES
function recopilarConfiguracionDelFormulario() {
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
        multiplicadores: recopilarMultiplicadores()
    };
    
    // Niveles
    for (let i = 0; i < 6; i++) {
        config.niveles.push(document.getElementById(`config-asesor-nivel-${i}`).value);
    }
    
    // Metas
    for (let i = 0; i < 6; i++) {
        config.metas.montoInterno.push(parseInt(document.getElementById(`config-asesor-meta-montoInterno-${i}`).value.replace(/\./g, '')) || 0);
        config.metas.montoExterno.push(parseInt(document.getElementById(`config-asesor-meta-montoExterno-${i}`).value.replace(/\./g, '')) || 0);
        config.metas.montoRecuperado.push(parseInt(document.getElementById(`config-asesor-meta-montoRecuperado-${i}`).value.replace(/\./g, '')) || 0);
        config.metas.cantidad.push(parseInt(document.getElementById(`config-asesor-meta-cantidad-${i}`).value) || 0);
    }
    
    // Pagos
    for (let i = 0; i < 6; i++) {
        config.pagos.carrera.push(parseInt(document.getElementById(`config-asesor-pago-carrera-${i}`).value.replace(/\./g, '')) || 0);
        config.pagos.montoInterno.push(parseInt(document.getElementById(`config-asesor-pago-montoInterno-${i}`).value.replace(/\./g, '')) || 0);
        config.pagos.montoExterno.push(parseInt(document.getElementById(`config-asesor-pago-montoExterno-${i}`).value.replace(/\./g, '')) || 0);
        config.pagos.montoRecuperado.push(parseInt(document.getElementById(`config-asesor-pago-montoRecuperado-${i}`).value.replace(/\./g, '')) || 0);
        config.pagos.cantidad.push(parseInt(document.getElementById(`config-asesor-pago-cantidad-${i}`).value.replace(/\./g, '')) || 0);
        config.pagos.equipo.push(parseInt(document.getElementById(`config-asesor-pago-equipo-${i}`).value.replace(/\./g, '')) || 0);
    }
    
    // Nombres de bonos
    config.nombres_bonos.interno = document.getElementById('config-asesor-nombre-interno').value;
    config.nombres_bonos.externo = document.getElementById('config-asesor-nombre-externo').value;
    config.nombres_bonos.cantidad = document.getElementById('config-asesor-nombre-cantidad').value;
    config.nombres_bonos.recuperados = document.getElementById('config-asesor-nombre-recuperados').value;
    config.nombres_bonos.carrera = document.getElementById('config-asesor-nombre-carrera').value;
    config.nombres_bonos.equipo = document.getElementById('config-asesor-nombre-equipo').value;
    
    return config;
}

// Función duplicada eliminada - usar la versión que viene después

// Recopilar multiplicadores del formulario - IMPLEMENTACIÓN CORREGIDA
function recopilarMultiplicadores() {
    // Primero intentar recopilar desde la interfaz HTML
    const multiplicadoresRecopilados = {
        conversion: [],
        empatia: [],
        proceso: [],
        mora: []
    };
    
    // Recopilar desde los inputs HTML de cada multiplicador
    Object.keys(multiplicadoresRecopilados).forEach(multKey => {
        const container = document.getElementById(`rangos-${multKey}`);
        if (container) {
            const rangoItems = container.querySelectorAll('.rango-item-nueva');
            rangoItems.forEach(item => {
                const minInput = item.querySelector('[data-field="min"]');
                const textInput = item.querySelector('[data-field="text"]');
                const multInput = item.querySelector('[data-field="mult"]');
                
                if (minInput && textInput && multInput) {
                    multiplicadoresRecopilados[multKey].push({
                        min: parseInt(minInput.value) || 0,
                        text: textInput.value || '',
                        mult: parseFloat(multInput.value) || 1.0
                    });
                }
            });
            
            // Ordenar de mayor a menor valor mínimo para lógica correcta
            multiplicadoresRecopilados[multKey].sort((a, b) => b.min - a.min);
        }
    });
    
    // Si no hay datos en HTML, usar window.multiplicadoresActuales
    const hayDatos = Object.values(multiplicadoresRecopilados).some(arr => arr.length > 0);
    
    if (hayDatos) {
        console.log('🔍 Multiplicadores recopilados desde HTML:', multiplicadoresRecopilados);
        return multiplicadoresRecopilados;
    } else if (window.multiplicadoresActuales) {
        console.log('🔍 Multiplicadores desde window.multiplicadoresActuales:', window.multiplicadoresActuales);
        return window.multiplicadoresActuales;
    } else {
        console.log('🔍 Multiplicadores desde CONFIG_DEFAULT');
        return CONFIG_DEFAULT.multiplicadores;
    }
}

// Agregar rango a multiplicador - NUEVA IMPLEMENTACIÓN
function agregarRangoNuevo(multKey) {
    if (!window.multiplicadoresActuales) {
        alert('Error: No se han cargado los multiplicadores');
        return;
    }
    
    const container = document.getElementById(`rangos-${multKey}`);
    if (!container) {
        alert('Error: No se encontró el contenedor de rangos');
        return;
    }
    
    // Crear nuevo rango con valores por defecto
    const nuevoRango = {
        min: 0,
        mult: 1.0,
        text: "Nuevo rango"
    };
    
    // Agregar al array de multiplicadores
    window.multiplicadoresActuales[multKey].push(nuevoRango);
    
    // Obtener el nuevo índice
    const nuevoIndex = window.multiplicadoresActuales[multKey].length - 1;
    
    // Crear HTML y agregar al contenedor
    const rangoHTML = crearRangoHTML(multKey, nuevoRango, nuevoIndex);
    container.insertAdjacentHTML('beforeend', rangoHTML);
    
    console.log(`✅ Rango agregado a ${multKey}:`, nuevoRango);
}

// Eliminar rango de multiplicador - NUEVA IMPLEMENTACIÓN
function eliminarRangoNuevo(multKey, rangoIndex) {
    if (!window.multiplicadoresActuales) {
        alert('Error: No se han cargado los multiplicadores');
        return;
    }
    
    const rangos = window.multiplicadoresActuales[multKey];
    
    if (rangos.length <= 1) {
        alert('Debe haber al menos un rango por multiplicador');
        return;
    }
    
    if (!confirm('¿Estás seguro de eliminar este rango?')) {
        return;
    }
    
    // Eliminar del array
    rangos.splice(rangoIndex, 1);
    
    // Recargar toda la interfaz de este multiplicador
    recargarMultiplicador(multKey);
    
    console.log(`✅ Rango eliminado de ${multKey}, índice ${rangoIndex}`);
}

// Actualizar rango cuando cambia un valor
function actualizarRango(multKey, rangoIndex, campo, valor) {
    if (!window.multiplicadoresActuales) {
        console.error('Error: No se han cargado los multiplicadores');
        return;
    }
    
    const rangos = window.multiplicadoresActuales[multKey];
    
    if (!rangos || !rangos[rangoIndex]) {
        console.error('Error: Rango no encontrado');
        return;
    }
    
    // Convertir valor según el campo
    if (campo === 'min') {
        valor = parseInt(valor) || 0;
    } else if (campo === 'mult') {
        valor = parseFloat(valor) || 1.0;
    }
    
    // Actualizar el valor
    rangos[rangoIndex][campo] = valor;
    
    console.log(`✅ Rango actualizado en ${multKey}[${rangoIndex}].${campo} = ${valor}`);
}

// Recargar la interfaz de un multiplicador específico
function recargarMultiplicador(multKey) {
    const container = document.getElementById(`rangos-${multKey}`);
    if (!container) return;
    
    const rangos = window.multiplicadoresActuales[multKey];
    let html = '';
    
    rangos.forEach((rango, index) => {
        html += crearRangoHTML(multKey, rango, index);
    });
    
    container.innerHTML = html;
}



// ===========================================
// FUNCIONES DE UTILIDAD PARA MULTIPLICADORES
// ===========================================

// Funciones de diagnóstico eliminadas - interfaz simplificada para usuarios finales