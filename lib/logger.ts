/**
 * Logger Utility - Sistema di logging centralizzato
 * 
 * In development: Stampa tutti i log in console
 * In production: Disabilita i log (o può inviare a servizio esterno)
 * 
 * Vantaggi:
 * - Controllo centralizzato del logging
 * - Facile switch dev/prod
 * - Possibilità di estendere con logging service (Sentry, LogRocket, etc.)
 * - Type-safe e autocomplete
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development'

    /**
     * Log informativo (operazioni standard)
     */
    info(message: string, ...args: unknown[]) {
        if (this.isDevelopment) {
            console.log(`ℹ️ [INFO] ${message}`, ...args)
        }
    }

    /**
     * Log di warning (situazioni anomale ma gestibili)
     */
    warn(message: string, ...args: unknown[]) {
        if (this.isDevelopment) {
            console.warn(`⚠️ [WARN] ${message}`, ...args)
        }
    }

    /**
     * Log di errore (sempre visibile anche in production)
     */
    error(message: string, ...args: unknown[]) {
        // Gli errori li vogliamo sempre vedere
        console.error(`❌ [ERROR] ${message}`, ...args)

        // TODO: In production, invia a servizio di monitoring (Sentry, etc.)
        // if (!this.isDevelopment) {
        //     sendToSentry(message, ...args)
        // }
    }

    /**
     * Log di debug (dettagli tecnici, solo in dev)
     */
    debug(message: string, ...args: unknown[]) {
        if (this.isDevelopment) {
            console.debug(`🔍 [DEBUG] ${message}`, ...args)
        }
    }

    /**
     * Log personalizzato con livello specificato
     */
    log(level: LogLevel, message: string, ...args: unknown[]) {
        switch (level) {
            case 'info':
                this.info(message, ...args)
                break
            case 'warn':
                this.warn(message, ...args)
                break
            case 'error':
                this.error(message, ...args)
                break
            case 'debug':
                this.debug(message, ...args)
                break
        }
    }
}

// Export singleton
export const logger = new Logger()