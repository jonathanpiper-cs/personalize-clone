export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  SUCCESS = 'SUCCESS',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}] ` : '';
    return `${timestamp} ${entry.level} ${context}${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date(),
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(`❌ ${formattedMessage}`);
        if (data) console.error(data);
        break;
      case LogLevel.WARN:
        console.warn(`⚠️  ${formattedMessage}`);
        if (data) console.warn(data);
        break;
      case LogLevel.SUCCESS:
        console.log(`✅ ${formattedMessage}`);
        if (data) console.log(data);
        break;
      case LogLevel.INFO:
        console.log(`ℹ️  ${formattedMessage}`);
        if (data) console.log(data);
        break;
      case LogLevel.DEBUG:
        console.debug(`🔍 ${formattedMessage}`);
        if (data) console.debug(data);
        break;
    }
  }

  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public success(message: string, context?: string, data?: any): void {
    this.log(LogLevel.SUCCESS, message, context, data);
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // Specialized methods for common patterns
  public apiCall(endpoint: string, method: string = 'GET'): void {
    this.info(`${method} ${endpoint}`, 'API');
  }

  public apiSuccess(endpoint: string, count?: number): void {
    const message = count !== undefined 
      ? `${endpoint} - ${count} items fetched` 
      : `${endpoint} - Success`;
    this.success(message, 'API');
  }

  public apiError(endpoint: string, error: any): void {
    this.error(`${endpoint} - ${error.message}`, 'API', error);
  }

  public migration(step: string, status: 'start' | 'success' | 'error', details?: any): void {
    const context = 'MIGRATION';
    switch (status) {
      case 'start':
        this.info(`Starting ${step}`, context);
        break;
      case 'success':
        this.success(`Completed ${step}`, context, details);
        break;
      case 'error':
        this.error(`Failed ${step}`, context, details);
        break;
    }
  }

  public section(title: string): void {
    console.log(`\n=== ${title} ===`);
  }
}

// Export singleton instance
export const logger = new Logger();
