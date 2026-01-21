import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FrontierService } from 'src/frontier-queue/frontier.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { ParserService } from 'src/parser/parser.service';
import { DatabaseService } from 'src/database/database.service';
import { SitemapParserService } from './sitemap-parser.service';

/**
 * ScraperService - Main control loop for the web scraper
 * Orchestrates: Frontier → Crawler → Parser → Database
 * Special handling: Processes sitemap-index first to discover product sitemaps
 */
@Injectable()
export class ScraperService implements OnModuleInit {
  private logger = new Logger(ScraperService.name);
  private isRunning = false;
  private sitemapProcessed = false; // Track if initial sitemap processing is done

  constructor(
    private frontierService: FrontierService,
    private crawlerService: CrawlerService,
    private parserService: ParserService,
    private sitemapParserService: SitemapParserService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * NestJS lifecycle hook - starts the scraper loop when module initializes
   */
  async onModuleInit() {
    this.logger.log('Scraper module initialized. Starting control loop...');
    // Optionally start automatically
    // await this.startScraping();
  }

  /**
   * Start the main control loop
   */
  async startScraping(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Scraper already running');
      return;
    }

    this.isRunning = true;
    this.logger.log('🚀 Starting scraper control loop');

    // Step 0: Process sitemap-index if not already done
    if (!this.sitemapProcessed) {
      this.logger.log('📋 Processing sitemap index first...');
      await this.processSitemapIndex();
      this.sitemapProcessed = true;
    }

    while (this.isRunning) {
      try {
        // Step 1: Get next URL from frontier queue
        const urlItem = await this.frontierService.takeUrl();

        if (!urlItem) {
          this.logger.log('⏳ No URLs available. Waiting...');
          await this.sleep(5000);
          continue;
        }

        this.logger.log(`📥 Fetched URL from frontier: ${urlItem.url}`);

        // Step 2: Crawl the URL (HTTP fetch)
        const crawlResult = await this.crawlerService.fetch(urlItem.url);

        if (!crawlResult.success) {
          this.logger.warn(`❌ Failed to crawl ${urlItem.url}: ${crawlResult.error}`);
          try {
            await this.frontierService.markFailed(urlItem.id);
          } catch (error) {
            this.logger.error(`Error marking URL as failed:`, error);
          }
          continue;
        }

        this.logger.log(`✅ Successfully crawled: ${urlItem.url}`);

        // Step 3: Parse the HTML (extract data + links)
        const parseResult = this.parserService.parse(
          crawlResult.html || "",
          urlItem.url,
        );

        this.logger.log(
          `📊 Parsed ${parseResult.links.length} links and ${parseResult.products.length} products`,
        );

        // Step 4: Save extracted data
        if (parseResult.products.length > 0) {
          await this.databaseService.saveProducts(parseResult.products);
          this.logger.log(`💾 Saved ${parseResult.products.length} products to DB`);
        }

        // Step 5: Add discovered links back to frontier queue
        if (parseResult.links.length > 0) {
          for (const link of parseResult.links) {
            try {
              await this.frontierService.addUrlToQueue({
                url: link,
                status: 'new',
                depth: urlItem.depth + 1,
                last_seen: new Date(),
                priority: Math.max(0, urlItem.priority - 1), // Lower priority for deeper links, but not negative
                retry_time: 3600, // 1 hour retry
                retry_count: 0,
              } as any);
            } catch (linkError) {
              this.logger.warn(`Failed to add link ${link}:`, linkError);
            }
          }
          this.logger.log(`➕ Added ${parseResult.links.length} new URLs to frontier`);
        }

        // Step 6: Mark current URL as successfully processed
        try {
          await this.frontierService.markProcessed(urlItem.id);
          this.logger.log(`✔️ Marked ${urlItem.url} as processed`);
        } catch (error) {
          this.logger.error(`Error marking URL as processed:`, error);
        }
      } catch (error) {
        this.logger.error('💥 Error in scraper control loop:', error);
        await this.sleep(1000);
      }
    }
  }

  /**
   * Stop the scraper loop
   */
  stopScraping(): void {
    this.isRunning = false;
    this.logger.log('🛑 Stopped scraper control loop');
  }

  /**
   * Get scraper status
   */
  getStatus(): { isRunning: boolean; status: string } {
    return {
      isRunning: this.isRunning,
      status: this.isRunning ? 'RUNNING' : 'STOPPED',
    };
  }

  /**
   * Process sitemap-index.xml to extract product sitemaps
   * Only adds product_1.xml to queue (to manage memory)
   */
  private async processSitemapIndex(): Promise<void> {
    try {
      // Get sitemap-index URL from frontier queue
      const sitemapIndexUrl = await this.frontierService.takeUrl();

      if (!sitemapIndexUrl) {
        this.logger.warn('No sitemap index URL found in queue');
        return;
      }

      this.logger.log(`📡 Fetching sitemap index: ${sitemapIndexUrl.url}`);

      // Crawl sitemap-index
      const crawlResult = await this.crawlerService.fetch(sitemapIndexUrl.url);

      if (!crawlResult.success) {
        this.logger.error(
          `❌ Failed to crawl sitemap index: ${crawlResult.error}`,
        );
        await this.frontierService.markFailed(sitemapIndexUrl.id);
        return;
      }

      // Parse sitemap-index to get all sitemaps
      const sitemapUrls = this.sitemapParserService.parseSitemapIndex(
        crawlResult.html || '',
      );

      this.logger.log(`📍 Found ${sitemapUrls.urls.length} sitemaps`);

      // Separate collection and product sitemaps
      const productSitemaps: string[] = [];
      const collectionSitemaps: string[] = [];

      for (const url of sitemapUrls.urls) {
        if (this.sitemapParserService.isProductSitemap(url)) {
          productSitemaps.push(url);
        } else if (this.sitemapParserService.isCollectionSitemap(url)) {
          collectionSitemaps.push(url);
        }
      }

      this.logger.log(`🛍️ Found ${productSitemaps.length} product sitemaps`);
      this.logger.log(`📂 Found ${collectionSitemaps.length} collection sitemaps`);

      // Add collection sitemaps to queue (all of them)
      for (const collectionUrl of collectionSitemaps) {
        try {
          await this.frontierService.addUrlToQueue({
            url: collectionUrl,
            status: 'new',
            depth: 1,
            last_seen: new Date(),
            priority: 100, // High priority for collections
            retry_time: 86400, // 24 hours retry
            retry_count: 0,
          } as any);
        } catch (error) {
          this.logger.warn(`Failed to add collection sitemap ${collectionUrl}:`, error);
        }
      }
      this.logger.log(`✅ Added ${collectionSitemaps.length} collection sitemaps to queue`);

      // Add ONLY product_1.xml to queue (to avoid memory overload)
      const product1Url = productSitemaps.find((url) => {
        const productNum = this.sitemapParserService.extractProductNumber(url);
        return productNum === 1;
      });

      if (product1Url) {
        try {
          await this.frontierService.addUrlToQueue({
            url: product1Url,
            status: 'new',
            depth: 1,
            last_seen: new Date(),
            priority: 99, // Slightly lower than collections
            retry_time: 86400, // 24 hours retry
            retry_count: 0,
          } as any);
          this.logger.log(`✅ Added product_1.xml to queue: ${product1Url}`);
          this.logger.log(
            `⚠️  Skipping other ${productSitemaps.length - 1} product sitemaps (memory management)`,
          );
        } catch (error) {
          this.logger.error(`Failed to add product_1.xml:`, error);
        }
      } else {
        this.logger.warn('product_1.xml not found in sitemap index');
      }

      // Mark sitemap-index as processed
      await this.frontierService.markProcessed(sitemapIndexUrl.id);
      this.logger.log('✔️ Sitemap index processing complete');
    } catch (error) {
      this.logger.error('Error processing sitemap index:', error);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
