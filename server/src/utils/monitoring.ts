import logger from './logger';

interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
}

class MonitoringService {
  private config: SentryConfig;

  constructor() {
    this.config = {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      enabled: Boolean(process.env.SENTRY_DSN),
    };
  }

  public init(): void {
    if (this.config.enabled) {
      logger.info('Sentry Error Tracking Initialized', {
        environment: this.config.environment,
      });
    } else {
      logger.info('Sentry DSN not provided, fallback to structured logger monitoring');
    }
  }

  public captureException(error: Error | any, context?: Record<string, any>): void {
    logger.error('Exception Captured', error, context);
    if (this.config.enabled) {
      // Sentry.captureException(error, { extra: context }) logic placeholder
    }
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (level === 'error') {
      logger.error(message);
    } else if (level === 'warning') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  }
}

export const monitoring = new MonitoringService();
export default monitoring;
