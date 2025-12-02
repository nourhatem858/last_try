/**
 * Logger Utility - Production Grade
 * Centralized logging with different levels and formatting
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: '📘',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍',
    };

    let formatted = `${emoji[level]} [${timestamp}] ${message}`;
    
    if (data) {
      formatted += `\n${JSON.stringify(data, null, 2)}`;
    }

    return formatted;
  }

  info(message: string, data?: any) {
    console.log(this.formatMessage('info', message, data));
  }

  success(message: string, data?: any) {
    console.log(this.formatMessage('success', message, data));
  }

  warning(message: string, data?: any) {
    console.warn(this.formatMessage('warning', message, data));
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    console.error(this.formatMessage('error', message, errorData));
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // API-specific logging
  apiRequest(method: string, path: string, userId?: string) {
    this.info(`API ${method} ${path}`, userId ? { userId } : undefined);
  }

  apiSuccess(method: string, path: string, statusCode: number) {
    this.success(`API ${method} ${path} - ${statusCode}`);
  }

  apiError(method: string, path: string, error: any) {
    this.error(`API ${method} ${path} failed`, error);
  }

  // Database-specific logging
  dbQuery(operation: string, collection: string, query?: any) {
    this.debug(`DB ${operation} on ${collection}`, query);
  }

  dbSuccess(operation: string, collection: string, count?: number) {
    this.success(`DB ${operation} on ${collection}${count !== undefined ? ` (${count} docs)` : ''}`);
  }

  dbError(operation: string, collection: string, error: any) {
    this.error(`DB ${operation} on ${collection} failed`, error);
  }
}

export const logger = new Logger();
