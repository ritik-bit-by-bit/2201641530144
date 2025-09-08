import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  body?: any;
  error?: string;
  stack?: string;
  shortcode?: string;
  originalUrl?: string;
  expiresAt?: string;
  validity?: number;
  port?: string | number;
  environment?: string;
  frontendUrl?: string;
  count?: number;
  totalClicks?: number;
  referrer?: string;
  length?: number;
  id?: string;
  protocol?: string;
  headers?: any;
  clickId?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogEntry['level'], message: string, data?: Partial<LogEntry>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    this.logs.push(logEntry);
    
    // Console output for development
    const logString = `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`;
    const additionalData = data ? ` | Data: ${JSON.stringify(data)}` : '';
    
    switch (level) {
      case 'ERROR':
        console.error(logString + additionalData);
        break;
      case 'WARN':
        console.warn(logString + additionalData);
        break;
      case 'DEBUG':
        console.debug(logString + additionalData);
        break;
      default:
        console.log(logString + additionalData);
    }
  }

  public info(message: string, data?: Partial<LogEntry>): void {
    this.log('INFO', message, data);
  }

  public warn(message: string, data?: Partial<LogEntry>): void {
    this.log('WARN', message, data);
  }

  public error(message: string, data?: Partial<LogEntry>): void {
    this.log('ERROR', message, data);
  }

  public debug(message: string, data?: Partial<LogEntry>): void {
    this.log('DEBUG', message, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Express middleware for request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const logger = Logger.getInstance();

  logger.info('Request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });

  next();
};

// Express middleware for error logging
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const logger = Logger.getInstance();
  
  logger.error('Request error occurred', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  next(error);
};

export default Logger;
