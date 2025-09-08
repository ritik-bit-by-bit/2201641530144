import Logger from '../middleware/logger';

class UrlValidator {
  private static instance: UrlValidator;
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): UrlValidator {
    if (!UrlValidator.instance) {
      UrlValidator.instance = new UrlValidator();
    }
    return UrlValidator.instance;
  }

  public isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      
      if (!isValid) {
        this.logger.warn('Invalid URL protocol', { url, protocol: urlObj.protocol });
      }
      
      return isValid;
    } catch (error) {
      this.logger.warn('Invalid URL format', { url, error: (error as Error).message });
      return false;
    }
  }

  public validateValidity(validity?: number): boolean {
    if (validity === undefined) return true;
    
    const isValid = Number.isInteger(validity) && validity > 0 && validity <= 525600; // Max 1 year
    
    if (!isValid) {
      this.logger.warn('Invalid validity period', { validity });
    }
    
    return isValid;
  }
}

export default UrlValidator;
