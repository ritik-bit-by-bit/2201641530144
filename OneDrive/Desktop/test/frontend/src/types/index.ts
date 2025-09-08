export interface CreateShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateShortUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ClickData {
  id: string;
  shortcode: string;
  timestamp: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
}

export interface ShortUrlStats {
  shortcode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string;
  totalClicks: number;
  clicks: ClickData[];
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface UrlFormData {
  url: string;
  validity: number;
  shortcode: string;
}

export interface ShortenedUrlResult {
  originalUrl: string;
  shortLink: string;
  expiry: string;
  shortcode: string;
}
