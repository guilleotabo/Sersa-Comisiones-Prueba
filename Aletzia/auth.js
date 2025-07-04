// Secure Authentication Module for Frontend
// Replaces hardcoded passwords with secure API-based authentication

class SecureAuth {
    constructor() {
        this.apiBase = this.getApiBase();
        this.authConfig = null;
        this.sessionTimeout = null;
        this.isAuthenticated = false;
        this.authType = null; // 'system' or 'admin'
        
        // Initialize authentication configuration
        this.initializeConfig();
        
        // Set up session management
        this.setupSessionManagement();
    }

    getApiBase() {
        // Determine API base URL from current environment
        const currentHost = window.location.host;
        if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
            return 'http://localhost:3000/api';
        }
        return '/api'; // For production deployments
    }

    async initializeConfig() {
        try {
            const response = await fetch(`${this.apiBase}/auth/config`);
            const data = await response.json();
            
            if (data.success) {
                this.authConfig = data.config;
            } else {
                console.warn('No se pudo cargar la configuración de autenticación');
            }
        } catch (error) {
            console.warn('Error cargando configuración de auth:', error);
            // Use fallback configuration
            this.authConfig = {
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                lockoutDuration: 15
            };
        }
    }

    setupSessionManagement() {
        // Check for existing session
        const session = localStorage.getItem('sersa_auth_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = Date.now();
                
                if (sessionData.expiresAt > now) {
                    this.isAuthenticated = true;
                    this.authType = sessionData.type;
                    this.scheduleSessionExpiry(sessionData.expiresAt - now);
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.warn('Error parsing session data:', error);
                this.clearSession();
            }
        }

        // Set up visibility change handler to extend session
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isAuthenticated) {
                this.extendSession();
            }
        });
    }

    async validateSystemPassword(password) {
        return this.validatePassword(password, 'system');
    }

    async validateAdminPassword(password) {
        return this.validatePassword(password, 'admin');
    }

    async validatePassword(password, type) {
        try {
            const response = await fetch(`${this.apiBase}/auth/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthenticated(type, data.sessionTimeout || 30);
                return {
                    success: true,
                    message: data.message
                };
            } else {
                return {
                    success: false,
                    message: data.message,
                    lockoutTime: data.lockoutTime
                };
            }
        } catch (error) {
            console.error('Error validating password:', error);
            return {
                success: false,
                message: 'Error de conexión. Por favor, intente nuevamente.'
            };
        }
    }

    setAuthenticated(type, sessionTimeoutMinutes) {
        this.isAuthenticated = true;
        this.authType = type;
        
        const expiresAt = Date.now() + (sessionTimeoutMinutes * 60 * 1000);
        
        // Store session in localStorage
        const sessionData = {
            type: type,
            expiresAt: expiresAt,
            createdAt: Date.now()
        };
        
        localStorage.setItem('sersa_auth_session', JSON.stringify(sessionData));
        
        // Schedule session expiry
        this.scheduleSessionExpiry(sessionTimeoutMinutes * 60 * 1000);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('authStateChange', {
            detail: { authenticated: true, type: type }
        }));
    }

    scheduleSessionExpiry(timeoutMs) {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.sessionTimeout = setTimeout(() => {
            this.logout('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }, timeoutMs);
    }

    extendSession() {
        if (!this.isAuthenticated) return;
        
        const session = localStorage.getItem('sersa_auth_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const extendedExpiresAt = Date.now() + (this.authConfig.sessionTimeout * 60 * 1000);
                
                sessionData.expiresAt = extendedExpiresAt;
                localStorage.setItem('sersa_auth_session', JSON.stringify(sessionData));
                
                // Reschedule expiry
                this.scheduleSessionExpiry(this.authConfig.sessionTimeout * 60 * 1000);
            } catch (error) {
                console.warn('Error extending session:', error);
            }
        }
    }

    logout(message = null) {
        this.isAuthenticated = false;
        this.authType = null;
        this.clearSession();
        
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('authStateChange', {
            detail: { authenticated: false, message: message }
        }));
        
        if (message) {
            alert(message);
        }
    }

    clearSession() {
        localStorage.removeItem('sersa_auth_session');
    }

    isSystemAuthenticated() {
        return this.isAuthenticated && this.authType === 'system';
    }

    isAdminAuthenticated() {
        return this.isAuthenticated && this.authType === 'admin';
    }

    getAuthStatus() {
        return {
            authenticated: this.isAuthenticated,
            type: this.authType,
            config: this.authConfig
        };
    }
}

// Global instance
window.secureAuth = new SecureAuth();

// Backward compatibility functions for existing code
window.validateSystemPassword = async function(password) {
    const result = await window.secureAuth.validateSystemPassword(password);
    return result.success;
};

window.validateAdminPassword = async function(password) {
    const result = await window.secureAuth.validateAdminPassword(password);
    return result.success;
};

// Enhanced functions with better error handling
window.secureValidateSystemPassword = async function(password) {
    return await window.secureAuth.validateSystemPassword(password);
};

window.secureValidateAdminPassword = async function(password) {
    return await window.secureAuth.validateAdminPassword(password);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureAuth;
}