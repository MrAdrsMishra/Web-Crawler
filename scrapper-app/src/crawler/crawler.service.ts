import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export interface CrawlResult {
  success: boolean;
  html?: string;
  error?: string;
  statusCode?: number;
}

/**
 * CrawlerService - Handles HTTP fetching of URLs
 */
@Injectable()
export class CrawlerService {
  private logger = new Logger(CrawlerService.name);
  private readonly timeout = 30000; // 30 seconds

  /**
   * Fetch URL and return HTML content
   */
  async fetch(url: string): Promise<CrawlResult> {
    try {
      this.logger.debug(`Fetching: ${url}`);

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 5,
      });

      return {
        success: true,
        html: response.data,
        statusCode: response.status,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to fetch ${url}: ${axiosError.message}`,
        axiosError.stack,
      );

      return {
        success: false,
        error: axiosError.message || 'Unknown error',
        statusCode: axiosError.response?.status,
      };
    }
  }
}
