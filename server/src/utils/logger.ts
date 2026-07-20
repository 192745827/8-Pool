export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
  stack?: string;
}

class Logger {
  private formatLog(level: LogLevel, message: string, meta?: Record<string, any>, error?: Error): string {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta && { meta }),
      ...(error && { stack: error.stack }),
    };
    return JSON.stringify(payload);
  }

  public info(message: string, meta?: Record<string, any>): void {
    console.log(this.formatLog('INFO', message, meta));
  }

  public warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.formatLog('WARN', message, meta));
  }

  public error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errObj = error instanceof Error ? error : undefined;
    const combinedMeta = error && !(error instanceof Error) ? { ...meta, error } : meta;
    console.error(this.formatLog('ERROR', message, combinedMeta, errObj));
  }

  public debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatLog('DEBUG', message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;
