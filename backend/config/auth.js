// Secure Authentication Configuration
// Replaces hardcoded passwords with environment-based security

const crypto = require('crypto');

class AuthConfig {
    constructor() {
        // Load from environment variables with secure defaults
        this.config = {
            // System password - should be set via environment
            systemPassword: process.env.SISTEMA_PASSWORD || this.generateSecurePassword(),
            
            // Admin password - should be set via environment  
            adminPassword: process.env.ADMIN_PASSWORD || this.generateSecurePassword(),
            
            // Session timeout (in minutes)
            sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30,
            
            // Maximum login attempts before lockout
            maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
            
            // Lockout duration (in minutes)
            lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15,
            
            // Enable password hashing
            enableHashing: process.env.ENABLE_HASHING !== 'false'
        };

        // Warn if using default passwords
        if (!process.env.SISTEMA_PASSWORD || !process.env.ADMIN_PASSWORD) {
            console.warn('⚠️  WARNING: Using default generated passwords. Set SISTEMA_PASSWORD and ADMIN_PASSWORD environment variables for production.');
            console.warn(`📝 Generated System Password: ${this.config.systemPassword}`);
            console.warn(`📝 Generated Admin Password: ${this.config.adminPassword}`);
        }
    }

    generateSecurePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }
        
        return password;
    }

    hashPassword(password) {
        if (!this.config.enableHashing) {
            return password;
        }
        
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    validateSystemPassword(inputPassword) {
        const hashedInput = this.hashPassword(inputPassword);
        const hashedSystem = this.hashPassword(this.config.systemPassword);
        
        return crypto.timingSafeEqual(
            Buffer.from(hashedInput),
            Buffer.from(hashedSystem)
        );
    }

    validateAdminPassword(inputPassword) {
        const hashedInput = this.hashPassword(inputPassword);
        const hashedAdmin = this.hashPassword(this.config.adminPassword);
        
        return crypto.timingSafeEqual(
            Buffer.from(hashedInput),
            Buffer.from(hashedAdmin)
        );
    }

    getClientConfig() {
        // Return safe configuration for client-side use
        return {
            sessionTimeout: this.config.sessionTimeout,
            maxLoginAttempts: this.config.maxLoginAttempts,
            lockoutDuration: this.config.lockoutDuration
        };
    }
}

// Singleton instance
const authConfig = new AuthConfig();

module.exports = authConfig;