/* ========================================
   APLICACIÓN PRINCIPAL - SISTEMA COMISIONES
   Integración de todos los módulos y inicialización
   ======================================== */

/**
 * Clase principal del Sistema de Comisiones
 */
class ComisionesApp {
    constructor() {
        this.initialized = false;
        this.config = null;
        this.modules = {
            api: null,
            utils: null,
            calculations: null,
            ui: null
        };
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        if (this.initialized) {
            console.log('⚠️ Aplicación ya está inicializada');
            return;
        }

        try {
            console.log('🚀 Iniciando Sistema de Comisiones...');
            
            // Verificar contraseña si es necesario
            await this.checkAuthentication();
            
            // Cargar configuración
            await this.loadConfiguration();
            
            // Configurar eventos y listeners
            this.setupEventListeners();
            
            // Realizar cálculo inicial
            this.performInitialCalculation();
            
            this.initialized = true;
            console.log('✅ Sistema de Comisiones iniciado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            mostrarError('Error al inicializar el sistema. Por favor, recarga la página.');
        }
    }

    /**
     * Verifica la autenticación del usuario
     */
    async checkAuthentication() {
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        // Si no hay pantalla de login, continuar
        if (!loginScreen) {
            if (mainApp) mainApp.style.display = 'block';
            return;
        }
        
        // Verificar si ya está autenticado
        const isAuthenticated = localStorage.getItem('comisiones_authenticated');
        if (isAuthenticated === 'true') {
            loginScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            return;
        }
        
        // Mostrar pantalla de login
        loginScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        
        // Configurar evento de login
        this.setupLoginHandler();
    }

    /**
     * Configura el manejador de login
     */
    setupLoginHandler() {
        const passwordInput = document.getElementById('password-input');
        const loginBtn = document.querySelector('.login-btn');
        
        const handleLogin = () => {
            this.verificarContrasena();
        };
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }
    }

    /**
     * Verifica la contraseña de acceso
     */
    verificarContrasena() {
        const passwordInput = document.getElementById('password-input');
        const loginError = document.getElementById('login-error');
        
        if (!passwordInput) return;
        
        const password = passwordInput.value.trim();
        const asesorName = getAsesorName();
        
        // Contraseñas por asesor (en producción esto debería estar en el backend)
        const passwords = {
            'Base': 'admin123',
            'Alejandra': 'ale2024',
            'Aletzia': 'alet2024',
            'Erika': 'erika2024',
            'Maximiliano': 'max2024',
            'Micaela': 'mica2024',
            'Rodrigo': 'rod2024'
        };
        
        const correctPassword = passwords[asesorName] || passwords['Base'];
        
        if (password === correctPassword) {
            // Contraseña correcta
            localStorage.setItem('comisiones_authenticated', 'true');
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            
            // Continuar con la inicialización
            this.loadConfiguration();
            this.setupEventListeners();
            this.performInitialCalculation();
            
        } else {
            // Contraseña incorrecta
            if (loginError) {
                loginError.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
                loginError.style.display = 'block';
                
                setTimeout(() => {
                    loginError.style.display = 'none';
                }, 3000);
            }
            
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    /**
     * Carga la configuración del sistema
     */
    async loadConfiguration() {
        try {
            this.config = await getConfig();
            window.systemConfig = this.config;
            
            // Mostrar mensaje de bienvenida
            mostrarMensajeBienvenida();
            
            console.log('✅ Configuración cargada exitosamente');
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            throw new Error('No se pudo cargar la configuración del sistema');
        }
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Event listeners para inputs
        this.setupInputListeners();
        
        // Event listeners para botones
        this.setupButtonListeners();
        
        // Event listeners para el panel de administración
        this.setupAdminListeners();
        
        // Configurar autosave
        this.setupAutosave();
        
        // Restaurar borrador si existe
        restoreDraft();
    }

    /**
     * Configura listeners para los inputs
     */
    setupInputListeners() {
        // Inputs de montos que necesitan formateo
        const moneyInputs = ['montoInterno', 'montoExterno', 'montoRecuperado'];
        moneyInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keyup', (e) => formatAndCalculate(e.target));
                input.addEventListener('focus', (e) => removeFormat(e.target));
                input.addEventListener('blur', (e) => applyFormat(e.target));
            }
        });
        
        // Inputs numéricos simples
        const numberInputs = ['cantidadDesembolsos', 'menorSemana', 'conversion', 'empatia', 'proceso', 'mora'];
        numberInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keyup', (e) => formatAndCalculate(e.target));
            }
        });
        
        // Selects
        const selects = ['nivelAnterior', 'nivelEquipo'];
        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => updateCalculations());
            }
        });
    }

    /**
     * Configura listeners para los botones
     */
    setupButtonListeners() {
        // Botón limpiar
        const limpiarBtn = document.querySelector('[onclick="limpiarTodo()"]');
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                limpiarTodo();
            });
        }
        
        // Botón PDF/Reporte
        const pdfBtn = document.querySelector('[onclick="descargarPDF()"]');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.descargarPDF();
            });
        }
        
        // Botón Admin
        const adminBtn = document.querySelector('[onclick="toggleAdminPanel()"]');
        if (adminBtn) {
            adminBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAdminPanel();
            });
        }
        
        // Botón toggle sidebar
        const sidebarBtn = document.querySelector('[onclick="toggleSidebar()"]');
        if (sidebarBtn) {
            sidebarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleSidebar();
            });
        }
    }

    /**
     * Configura listeners para el panel de administración
     */
    setupAdminListeners() {
        // Los listeners específicos del admin se configurarán cuando se implemente el módulo admin
        console.log('📋 Configurando listeners del panel de administración...');
    }

    /**
     * Configura el autosave
     */
    setupAutosave() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', autosave);
            input.addEventListener('change', autosave);
        });
    }

    /**
     * Realiza el cálculo inicial
     */
    performInitialCalculation() {
        // Establecer valores por defecto si no hay datos guardados
        const draft = localStorage.getItem('comisionesDraft');
        if (!draft) {
            establecerValoresOptimos();
        }
        
        // Realizar cálculo inicial
        updateCalculations();
        
        console.log('🔢 Cálculo inicial completado');
    }

    /**
     * Descarga reporte en PDF
     */
    descargarPDF() {
        // Esta función se implementará cuando se cree el módulo de reportes
        console.log('📊 Generando reporte PDF...');
        
        // Por ahora, mostrar mensaje
        alert('Función de reporte en desarrollo. Próximamente disponible.');
    }

    /**
     * Alterna el panel de administración
     */
    toggleAdminPanel() {
        // Esta función se implementará cuando se cree el módulo de admin
        console.log('⚙️ Alternando panel de administración...');
        
        // Por ahora, mostrar mensaje
        alert('Panel de administración en desarrollo. Próximamente disponible.');
    }

    /**
     * Destruye la aplicación y limpia recursos
     */
    destroy() {
        // Limpiar event listeners
        // Limpiar datos en memoria
        // Reset estado
        this.initialized = false;
        console.log('🧹 Aplicación destruida y recursos limpiados');
    }
}

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================

// Variable global para la instancia de la aplicación
let comisionesApp = null;

/**
 * Función de inicialización global
 */
function initializeApp() {
    // Verificar que el DOM esté cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    // Crear y inicializar la aplicación
    comisionesApp = new ComisionesApp();
    comisionesApp.init();
}

// Auto-inicializar cuando se carga el script
initializeApp();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ComisionesApp = ComisionesApp;
    window.comisionesApp = comisionesApp;
}

// Exportar para Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComisionesApp;
}