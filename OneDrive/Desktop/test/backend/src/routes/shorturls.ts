import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateShortUrlRequest, CreateShortUrlResponse, ShortUrlStats, ApiError } from '../models/types';
import InMemoryStorage from '../services/storage';
import ShortcodeGenerator from '../services/shortcodeGenerator';
import UrlValidator from '../services/urlValidator';
import Logger from '../middleware/logger';

const router = Router();
const storage = InMemoryStorage.getInstance();
const shortcodeGenerator = ShortcodeGenerator.getInstance();
const urlValidator = UrlValidator.getInstance();
const logger = Logger.getInstance();

// POST /shorturls - Create short URL
router.post('/', (req: Request, res: Response) => {
  try {
    const { url, validity = 30, shortcode }: CreateShortUrlRequest = req.body;

    // Validate required fields
    if (!url) {
      const error: ApiError = {
        error: 'ValidationError',
        message: 'URL is required',
        statusCode: 400
      };
      logger.warn('Create short URL failed - missing URL');
      return res.status(400).json(error);
    }

    // Validate URL format
    if (!urlValidator.isValidUrl(url)) {
      const error: ApiError = {
        error: 'ValidationError',
        message: 'Invalid URL format',
        statusCode: 400
      };
      logger.warn('Create short URL failed - invalid URL format', { url });
      return res.status(400).json(error);
    }

    // Validate validity period
    if (!urlValidator.validateValidity(validity)) {
      const error: ApiError = {
        error: 'ValidationError',
        message: 'Validity must be a positive integer (max 525600 minutes)',
        statusCode: 400
      };
      logger.warn('Create short URL failed - invalid validity', { validity });
      return res.status(400).json(error);
    }

    // Handle custom shortcode
    let finalShortcode = shortcode;
    if (shortcode) {
      if (!shortcodeGenerator.validateShortcode(shortcode)) {
        const error: ApiError = {
          error: 'ValidationError',
          message: 'Shortcode must be 3-20 alphanumeric characters',
          statusCode: 400
        };
        logger.warn('Create short URL failed - invalid shortcode format', { shortcode });
        return res.status(400).json(error);
      }

      if (!storage.isShortcodeAvailable(shortcode)) {
        const error: ApiError = {
          error: 'ConflictError',
          message: 'Shortcode already exists',
          statusCode: 409
        };
        logger.warn('Create short URL failed - shortcode conflict', { shortcode });
        return res.status(409).json(error);
      }
    } else {
      // Generate unique shortcode
      do {
        finalShortcode = shortcodeGenerator.generateShortcode();
      } while (!storage.isShortcodeAvailable(finalShortcode));
    }

    // Create short URL record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60 * 1000);
    
    const shortUrl = {
      id: uuidv4(),
      originalUrl: url,
      shortcode: finalShortcode!,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true
    };

    storage.createShortUrl(shortUrl);

    const response: CreateShortUrlResponse = {
      shortLink: `${req.protocol}://${req.get('host')}/${finalShortcode}`,
      expiry: expiresAt.toISOString()
    };

    logger.info('Short URL created successfully', {
      shortcode: finalShortcode,
      originalUrl: url,
      validity
    });

    res.status(201).json(response);
  } catch (error) {
    logger.error('Unexpected error creating short URL', { error: (error as Error).message });
    const apiError: ApiError = {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
});

// GET /shorturls/:shortcode - Get statistics
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
      logger.warn('Statistics request failed - shortcode not found', { shortcode });
      return res.status(404).json(error);
    }

    const clicks = storage.getClicks(shortcode);
    
    const stats: ShortUrlStats = {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt,
      expiresAt: shortUrl.expiresAt,
      totalClicks: clicks.length,
      clicks: clicks
    };

    logger.info('Statistics retrieved successfully', {
      shortcode,
      totalClicks: clicks.length
    });

    res.json(stats);
  } catch (error) {
    logger.error('Unexpected error retrieving statistics', { 
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
