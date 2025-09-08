import { ShortUrl, ClickData } from '../models/types';
import Logger from '../middleware/logger';

class InMemoryStorage {
  private static instance: InMemoryStorage;
  private shortUrls: Map<string, ShortUrl> = new Map();
  private clicks: Map<string, ClickData[]> = new Map();
  private shortcodeToId: Map<string, string> = new Map();
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): InMemoryStorage {
    if (!InMemoryStorage.instance) {
      InMemoryStorage.instance = new InMemoryStorage();
    }
    return InMemoryStorage.instance;
  }

  public createShortUrl(shortUrl: ShortUrl): void {
    this.shortUrls.set(shortUrl.id, shortUrl);
    this.shortcodeToId.set(shortUrl.shortcode, shortUrl.id);
    this.clicks.set(shortUrl.id, []);
    
    this.logger.info('Short URL created', {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      expiresAt: shortUrl.expiresAt
    });
  }

  public getShortUrlByShortcode(shortcode: string): ShortUrl | null {
    const id = this.shortcodeToId.get(shortcode);
    if (!id) {
      this.logger.warn('Short URL not found', { shortcode });
      return null;
    }
    
    const shortUrl = this.shortUrls.get(id);
    if (!shortUrl) {
      this.logger.warn('Short URL data corrupted', { shortcode, id });
      return null;
    }

    // Check if expired
    if (new Date(shortUrl.expiresAt) < new Date()) {
      this.logger.warn('Short URL expired', { shortcode, expiresAt: shortUrl.expiresAt });
      return null;
    }

    return shortUrl;
  }

  public getAllShortUrls(): ShortUrl[] {
    return Array.from(this.shortUrls.values()).filter(url => url.isActive);
  }

  public addClick(shortcode: string, clickData: ClickData): void {
    const id = this.shortcodeToId.get(shortcode);
    if (!id) {
      this.logger.error('Cannot add click - shortcode not found', { shortcode });
      return;
    }

    const existingClicks = this.clicks.get(id) || [];
    existingClicks.push(clickData);
    this.clicks.set(id, existingClicks);

    this.logger.info('Click recorded', {
      shortcode,
      timestamp: clickData.timestamp,
      referrer: clickData.referrer,
      ip: clickData.ip
    });
  }

  public getClicks(shortcode: string): ClickData[] {
    const id = this.shortcodeToId.get(shortcode);
    if (!id) {
      return [];
    }
    return this.clicks.get(id) || [];
  }

  public isShortcodeAvailable(shortcode: string): boolean {
    return !this.shortcodeToId.has(shortcode);
  }

  public cleanup(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, shortUrl] of this.shortUrls.entries()) {
      if (new Date(shortUrl.expiresAt) < now) {
        this.shortUrls.delete(id);
        this.shortcodeToId.delete(shortUrl.shortcode);
        this.clicks.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Cleaned up expired URLs', { count: cleanedCount });
    }
  }
}

export default InMemoryStorage;
