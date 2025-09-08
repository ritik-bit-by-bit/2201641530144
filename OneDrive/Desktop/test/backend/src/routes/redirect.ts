import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import InMemoryStorage from '../services/storage';
import Logger from '../middleware/logger';
import { ApiError } from '../models/types';

const router = Router();
const storage = InMemoryStorage.getInstance();
const logger = Logger.getInstance();

// GET /:shortcode - Redirect to original URL
router.get('/:shortcode', (req: Request, res: Response) => {
  try {
    const { shortcode } = req.params;

    const shortUrl = storage.getShortUrlByShortcode(shortcode);
    if (!shortUrl) {
      const error: ApiError = {
        error: 'NotFoundError',
        message: 'Short URL not found or expired',
        statusCode: 404
      };
      logger.warn('Redirect failed - shortcode not found', { shortcode });
      return res.status(404).json(error);
    }

    // Record click with better IP detection
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
               (Array.isArray(realIp) ? realIp[0] : realIp) ||
               '127.0.0.1';

    const clickData = {
      id: uuidv4(),
      shortcode: shortcode,
      timestamp: new Date().toISOString(),
      referrer: req.get('Referer') || req.get('Referrer') || 'Direct',
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: ip,
      country: 'Local', // For localhost testing
      city: 'Local'
    };

    storage.addClick(shortcode, clickData);

    logger.info('Redirect successful', {
      shortcode,
      originalUrl: shortUrl.originalUrl,
      referrer: clickData.referrer,
      ip: clickData.ip,
      userAgent: clickData.userAgent,
      clickId: clickData.id
    });

    // Debug: Log all headers to see what we're receiving
    logger.info('Request headers', {
      headers: req.headers,
      method: req.method,
      url: req.url
    });

    res.redirect(302, shortUrl.originalUrl);
  } catch (error) {
    logger.error('Unexpected error during redirect', { 
      shortcode: req.params.shortcode,
      error: (error as Error).message 
    });
    const apiError: ApiError = {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
});

export default router;
