import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface SitemapUrls {
  urls: string[];
  type: 'index' | 'urlset';
}

/**
 * SitemapParserService - Parses sitemap XML files
 */
@Injectable()
export class SitemapParserService {
  private logger = new Logger(SitemapParserService.name);

  /**
   * Parse sitemap index XML and extract sitemap URLs
   * Example: sitemap-index.xml → extracts collection.xml, product_1.xml, etc.
   */
  parseSitemapIndex(xml: string): SitemapUrls {
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      const urls: string[] = [];

      // Extract sitemap URLs from sitemap-index
      $('sitemap > loc').each((index, element) => {
        const url = $(element).text().trim();
        if (url) {
          urls.push(url);
        }
      });

      this.logger.debug(`Parsed sitemap index: found ${urls.length} sitemaps`);

      return {
        urls,
        type: 'index',
      };
    } catch (error) {
      this.logger.error('Error parsing sitemap index:', error);
      return { urls: [], type: 'index' };
    }
  }

  /**
   * Parse product sitemap XML and extract product URLs
   * Example: product_1.xml → extracts individual product URLs
   */
  parseSitemapUrlset(xml: string): SitemapUrls {
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      const urls: string[] = [];
      let url_count = 0;
      // Extract URLs from urlset
      $('url > loc').each((index, element) => {
        const url = $(element).text().trim();
        if (url) {
          urls.push(url);
          url_count++;
        }
      });
      this.logger.debug(`Parsed sitemap urlset: found ${urls.length} URLs`);
      return {
        urls,
        type: 'urlset',
      };
    } catch (error) {
      this.logger.error('Error parsing sitemap urlset:', error);
      return { urls: [], type: 'urlset' };
    }
  }

  /**
   * Determine if URL is a sitemap-index or specific sitemap
   */
  isSitemapIndex(url: string): boolean {
    return (
      url.toLowerCase().includes('sitemap-index') ||
      url.toLowerCase().includes('sitemap_index')
    );
  }

  /**
   * Determine if URL is a product sitemap (e.g., product_1.xml)
   */
  isProductSitemap(url: string): boolean {
    return url.toLowerCase().includes('product');
  }

  /**
   * Determine if URL is a collection/category sitemap
   */
  isCollectionSitemap(url: string): boolean {
    return (
      url.toLowerCase().includes('collection') ||
      url.toLowerCase().includes('category')
    );
  }

  /**
   * Extract product number from URL
   * e.g., "product_1.xml" → 1
   */
  extractProductNumber(url: string): number | null {
    const match = url.match(/product[_-]?(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }
}
