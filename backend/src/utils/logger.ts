import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    if (level === 'error') {
      console.error(formattedMessage, meta || '');
    } else if (level === 'warn') {
      console.warn(formattedMessage, meta || '');
    } else if (level === 'debug') {
      if (env.isDevelopment) {
        console.debug(formattedMessage, meta || '');
      }
    } else {
      console.log(formattedMessage, meta || '');
    }
  }

  info(message: string, meta?: unknown) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: unknown) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: unknown) {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
