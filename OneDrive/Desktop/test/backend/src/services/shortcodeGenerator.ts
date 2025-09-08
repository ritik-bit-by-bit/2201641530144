import Logger from '../middleware/logger';

class ShortcodeGenerator {
  private static instance: ShortcodeGenerator;
  private logger = Logger.getInstance();

  private constructor() {}

  public static getInstance(): ShortcodeGenerator {
    if (!ShortcodeGenerator.instance) {
      ShortcodeGenerator.instance = new ShortcodeGenerator();
    }
    return ShortcodeGenerator.instance;
  }

  public generateShortcode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    this.logger.debug('Generated shortcode', { shortcode: result, length });
    return result;
  }

  public validateShortcode(shortcode: string): boolean {
    // Alphanumeric only, 3-20 characters
    const isValid = /^[a-zA-Z0-9]{3,20}$/.test(shortcode);
    
    if (!isValid) {
      this.logger.warn('Invalid shortcode format', { shortcode });
    }
    
    return isValid;
  }
}

export default ShortcodeGenerator;
