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
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email || '-'}</td>
                <td>
                    <span class="status-badge ${usuario.activo ? 'active' : 'inactive'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn-edit" onclick="editarAsesor('${usuario.id}')">✏️</button>
                    <button class="btn-toggle" onclick="toggleAsesor('${usuario.id}', ${!usuario.activo})">
                        ${usuario.activo ? '❌' : '✅'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Error cargando asesores:', error);
        alert('Error cargando asesores');
    }
}

// Agregar nuevo asesor
async function agregarAsesor() {
    const nombre = prompt('Nombre del asesor:');
    if (!nombre) return;
    
    const email = prompt('Email (opcional):');
    const password = prompt('Contraseña para el asesor:');
    if (!password) return;
    
    try {
        // Crear usuario (combina asesor + login)
        const { error } = await supabase
            .from('users')
            .insert({
                nombre: nombre,
                email: email || null,
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
        
        const nuevoEmail = prompt('Nuevo email:', usuario.email || '');
        const nuevaPassword = prompt('Nueva contraseña (dejar vacío para mantener actual):', '');
        
        // Actualizar usuario (incluye todo en una tabla)
        const updateData = {
            nombre: nuevoNombre,
            email: nuevoEmail || null
        };
        
        if (nuevaPassword) {
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

// Volver al sistema principal
function volverAlSistema() {
    window.location.href = 'index.html';
} 