import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ParseResult {
  links: string[];
  products: any[];
}

/**
 * ParserService - Extracts data and links from HTML
 */
@Injectable()
export class ParserService {
  private logger = new Logger(ParserService.name);

  /**
   * Parse HTML and extract links and product data
   */
  parse(html: string, baseUrl: string): ParseResult {
    try {
      const $ = cheerio.load(html);
      const links: string[] = [];
      const products: any[] = [];

      // Extract all links
      $('a[href]').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = this.resolveUrl(baseUrl, href);
          if (absoluteUrl) {
            links.push(absoluteUrl);
          }
        }
      });

      // Remove duplicates
      const uniqueLinks = [...new Set(links)];

      // Extract product information (customize based on page structure)
      const productElements = $('[data-product], .product, .book-item');
      productElements.each((index, element) => {
        const product = {
          title: $(element).find('[data-title], .title, h2').text().trim(),
          url: baseUrl,
          price: $(element)
            .find('[data-price], .price')
            .text()
            .trim(),
          description: $(element)
            .find('[data-description], .description, p')
            .text()
            .trim()
            .substring(0, 500),
          image: $(element).find('img').attr('src'),
          extractedAt: new Date(),
        };

        if (product.title) {
          products.push(product);
        }
      });

      this.logger.debug(
        `Parsed: ${uniqueLinks.length} links, ${products.length} products`,
      );

      return {
        links: uniqueLinks,
        products,
      };
    } catch (error) {
      this.logger.error('Error parsing HTML:', error);
      return {
        links: [],
        products: [],
      };
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private resolveUrl(baseUrl: string, relativeUrl: string): string | null {
    try {
      // Skip fragments and javascript
      if (
        relativeUrl.startsWith('#') ||
        relativeUrl.startsWith('javascript:') ||
        relativeUrl.startsWith('mailto:')
      ) {
        return null;
      }

      // If already absolute, return it
      if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl;
      }

      // Resolve relative URLs
      const base = new URL(baseUrl);
      const resolved = new URL(relativeUrl, base);

      // Only return if same domain (prevent external crawling)
      if (resolved.hostname === base.hostname) {
        return resolved.href;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
