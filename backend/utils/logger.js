// Production-Ready Logging Utility
// Replaces console.log statements with proper logging

const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.logFile = process.env.LOG_FILE || path.join(__dirname, '../logs/server.log');
        
        // Ensure logs directory exists
        this.ensureLogDirectory();
        
        // Log levels hierarchy
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
        
        return {
            console: `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`,
            file: JSON.stringify({
                timestamp,
                level,
                message,
                meta,
                pid: process.pid
            })
        };
    }

    writeToFile(message) {
        try {
            fs.appendFileSync(this.logFile, message + '\n');
        } catch (error) {
            // Fallback to console if file writing fails
            console.error('Failed to write to log file:', error);
        }
    }

    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message, meta);

        // In development, log to console
        if (this.isDevelopment) {
            const consoleMethod = level === 'error' ? console.error : 
                                  level === 'warn' ? console.warn : console.log;
            consoleMethod(formatted.console);
        }

        // Always log to file in production
        if (!this.isDevelopment) {
            this.writeToFile(formatted.file);
        }
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    // HTTP request logging middleware
    httpLogger() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logData = {
                    method: req.method,
                    url: req.originalUrl,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                };

                if (res.statusCode >= 400) {
                    this.warn(`HTTP ${req.method} ${req.originalUrl}`, logData);
                } else {
                    this.info(`HTTP ${req.method} ${req.originalUrl}`, logData);
                }
            });

            next();
        };
    }

    // Database operation logging
    dbLog(operation, details = {}) {
        this.info(`Database ${operation}`, details);
    }

    // Security event logging
    securityLog(event, details = {}) {
        this.warn(`Security Event: ${event}`, {
            ...details,
            timestamp: new Date().toISOString()
        });
    }
}

// Singleton instance
const logger = new Logger();

module.exports = logger;