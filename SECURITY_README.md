# 🔐 SERSA Security System - Developer Guide

## 🚀 Quick Start

### New Login Credentials
```
System Password: SecureComercial2024!
Admin Password: SecureAdmin2024!
```

### Starting the System
1. **Start Backend**: `cd backend && npm start`
2. **Open Frontend**: Access any advisor directory (e.g., `Rodrigo/index.html`)
3. **Login**: Use the new secure credentials above

## 🛡️ Security Features

### ✅ What's New
- **No more hardcoded passwords** - All authentication is API-based
- **Rate limiting** - 5 failed attempts = 15-minute lockout
- **Session management** - 30-minute auto-expiry with activity extension
- **Password hashing** - Secure SHA-256 with timing-safe comparison
- **Comprehensive error handling** - No more silent failures

### 🔄 Backward Compatibility
Old functions still work for existing code:
```javascript
// These still work
validateSystemPassword(password)    // Returns boolean
validateAdminPassword(password)     // Returns boolean

// New enhanced functions with error details
secureValidateSystemPassword(password)  // Returns {success, message, lockoutTime}
secureValidateAdminPassword(password)   // Returns {success, message, lockoutTime}
```

## 🏗️ Architecture

### Authentication Flow
```
Frontend (auth.js) → Backend API → Rate Limiting → Password Hash → Session Creation
```

### Key Components
- **`Base/auth.js`**: Frontend authentication module
- **`backend/routes/auth.js`**: Secure API endpoints  
- **`backend/config/auth.js`**: Security configuration
- **`backend/utils/logger.js`**: Production logging

## 📡 API Endpoints

### System Authentication
```http
POST /api/auth/system
Content-Type: application/json

{
  "password": "SecureComercial2024!"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "sessionTimeout": 30
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Contraseña incorrecta"
}
```

**Response Rate Limited:**
```json
{
  "success": false,
  "message": "Demasiados intentos fallidos. Intente nuevamente más tarde.",
  "lockoutTime": 15
}
```

### Admin Authentication
```http
POST /api/auth/admin
Content-Type: application/json

{
  "password": "SecureAdmin2024!"
}
```

### Get Auth Configuration
```http
GET /api/auth/config
```

## 💻 Frontend Usage

### Basic Login (Existing Code)
```javascript
// This still works exactly as before
async function verificarContrasena() {
    const password = passwordInput.value.trim();
    const isValid = await validateSystemPassword(password);
    
    if (isValid) {
        mostrarSistema();
    } else {
        mostrarError("❌ Contraseña incorrecta");
    }
}
```

### Enhanced Login (New Features)
```javascript
// New enhanced version with detailed error handling
async function verificarContrasenaEnhanced() {
    const password = passwordInput.value.trim();
    const result = await secureValidateSystemPassword(password);
    
    if (result.success) {
        mostrarSistema();
    } else {
        mostrarError(result.message);
        
        // Handle lockout
        if (result.lockoutTime) {
            setTimeout(() => {
                mostrarError(`🔒 Cuenta bloqueada por ${result.lockoutTime} minutos`);
            }, 1000);
        }
    }
}
```

### Session Management
```javascript
// Check authentication status
const authStatus = window.secureAuth.getAuthStatus();
console.log(authStatus.authenticated); // true/false
console.log(authStatus.type);          // 'system' or 'admin'

// Manual logout
window.secureAuth.logout('Custom logout message');

// Check specific authentication type
if (window.secureAuth.isSystemAuthenticated()) {
    // User is logged in with system credentials
}

if (window.secureAuth.isAdminAuthenticated()) {
    // User is logged in with admin credentials
}
```

## ⚙️ Configuration

### Environment Variables (`backend/config.env`)
```env
# Authentication
SISTEMA_PASSWORD=SecureComercial2024!
ADMIN_PASSWORD=SecureAdmin2024!
SESSION_TIMEOUT=30
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15
ENABLE_HASHING=true

# Logging
LOG_LEVEL=info
LOG_FILE=backend/logs/server.log
```

### Customization
```javascript
// Change session timeout
// In backend/config.env: SESSION_TIMEOUT=60

// Change lockout settings
// In backend/config.env: MAX_LOGIN_ATTEMPTS=3
// In backend/config.env: LOCKOUT_DURATION=30

// Disable password hashing (development only)
// In backend/config.env: ENABLE_HASHING=false
```

## 🔧 Maintenance Commands

```bash
# Update security across all advisor directories
npm run security-update

# Check system health
curl http://localhost:3000/api/health

# View logs (if using file logging)
tail -f backend/logs/server.log

# Database operations
npm run migrate
npm run verify
```

## 🚨 Troubleshooting

### Common Issues

**1. "Error de conexión" on login**
- ✅ Ensure backend is running: `cd backend && npm start`
- ✅ Check if port 3000 is available
- ✅ Verify CORS settings in `backend/config.env`

**2. "Cuenta bloqueada" message**
- ✅ Wait 15 minutes for lockout to expire
- ✅ Or restart the backend server to reset rate limits
- ✅ Check `MAX_LOGIN_ATTEMPTS` and `LOCKOUT_DURATION` in config

**3. Session expires too quickly**
- ✅ Increase `SESSION_TIMEOUT` in `backend/config.env`
- ✅ Ensure activity is extending the session properly

**4. Admin panel not accessible**
- ✅ Use the new admin password: `SecureAdmin2024!`
- ✅ Ensure you're using the enhanced admin validation

### Debug Mode
```javascript
// Enable debug logging in browser console
localStorage.setItem('auth_debug', 'true');

// Disable debug logging
localStorage.removeItem('auth_debug');
```

## 🔍 Security Monitoring

### Health Checks
```bash
# Server health
curl http://localhost:3000/health

# API health with auth info
curl http://localhost:3000/api/health
```

### Rate Limit Status
```javascript
// Check current rate limit status (browser console)
console.log(window.secureAuth.getAuthStatus());
```

### Logging
- **Development**: Logs to console
- **Production**: Logs to `backend/logs/server.log`
- **Security Events**: Special security logging for failed attempts

## 📞 Support

If you encounter issues:

1. **Check the logs**: `backend/logs/server.log`
2. **Verify configuration**: `backend/config.env`
3. **Test API directly**: Use curl or Postman with the endpoints above
4. **Check browser console**: Look for authentication errors
5. **Review documentation**: `CODE_INTEGRITY_REPORT.md` for full details

---

## 🎉 Migration Complete!

Your SERSA system is now secured with enterprise-grade authentication. All existing functionality works as before, but now with:

- 🛡️ **Bank-level security**
- ⚡ **Rate limiting protection**  
- 🔐 **Secure password handling**
- ⏰ **Session management**
- 📝 **Production logging**

**Welcome to the new secure SERSA system!** 🚀