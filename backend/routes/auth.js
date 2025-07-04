// Authentication API Routes
// Secure password validation endpoints

const express = require('express');
const router = express.Router();
const authConfig = require('../config/auth');

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map();

// Helper function to check rate limiting
function checkRateLimit(identifier) {
    const now = Date.now();
    const windowStart = now - (authConfig.config.lockoutDuration * 60 * 1000);
    
    if (!rateLimitStore.has(identifier)) {
        rateLimitStore.set(identifier, []);
    }
    
    const attempts = rateLimitStore.get(identifier);
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    rateLimitStore.set(identifier, recentAttempts);
    
    return recentAttempts.length < authConfig.config.maxLoginAttempts;
}

// Helper function to record failed attempt
function recordFailedAttempt(identifier) {
    if (!rateLimitStore.has(identifier)) {
        rateLimitStore.set(identifier, []);
    }
    
    const attempts = rateLimitStore.get(identifier);
    attempts.push(Date.now());
    rateLimitStore.set(identifier, attempts);
}

// POST /api/auth/system - Validate system password
router.post('/system', (req, res) => {
    try {
        const { password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Check rate limiting
        if (!checkRateLimit(`system_${clientIP}`)) {
            return res.status(429).json({
                success: false,
                message: 'Demasiados intentos fallidos. Intente nuevamente más tarde.',
                lockoutTime: authConfig.config.lockoutDuration
            });
        }
        
        // Validate input
        if (!password) {
            recordFailedAttempt(`system_${clientIP}`);
            return res.status(400).json({
                success: false,
                message: 'Contraseña requerida'
            });
        }
        
        // Validate password
        const isValid = authConfig.validateSystemPassword(password);
        
        if (isValid) {
            res.json({
                success: true,
                message: 'Autenticación exitosa',
                sessionTimeout: authConfig.config.sessionTimeout
            });
        } else {
            recordFailedAttempt(`system_${clientIP}`);
            res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }
    } catch (error) {
        console.error('Error en autenticación del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/auth/admin - Validate admin password
router.post('/admin', (req, res) => {
    try {
        const { password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Check rate limiting
        if (!checkRateLimit(`admin_${clientIP}`)) {
            return res.status(429).json({
                success: false,
                message: 'Demasiados intentos fallidos. Intente nuevamente más tarde.',
                lockoutTime: authConfig.config.lockoutDuration
            });
        }
        
        // Validate input
        if (!password) {
            recordFailedAttempt(`admin_${clientIP}`);
            return res.status(400).json({
                success: false,
                message: 'Contraseña requerida'
            });
        }
        
        // Validate password
        const isValid = authConfig.validateAdminPassword(password);
        
        if (isValid) {
            res.json({
                success: true,
                message: 'Autenticación de administrador exitosa',
                sessionTimeout: authConfig.config.sessionTimeout
            });
        } else {
            recordFailedAttempt(`admin_${clientIP}`);
            res.status(401).json({
                success: false,
                message: 'Contraseña de administrador incorrecta'
            });
        }
    } catch (error) {
        console.error('Error en autenticación de administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/auth/config - Get client-safe authentication configuration
router.get('/config', (req, res) => {
    try {
        res.json({
            success: true,
            config: authConfig.getClientConfig()
        });
    } catch (error) {
        console.error('Error obteniendo configuración de auth:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;