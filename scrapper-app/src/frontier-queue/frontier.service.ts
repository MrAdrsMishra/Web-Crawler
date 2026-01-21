import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { FrontierQueue } from './frontier.entity';
import { FrontierQueueDto } from './frontier.dto';

// create a queue
// seed the urls from sitemap
// process only one product xml
// push all links to the
@Injectable()
export class FrontierService {
  private logger = new Logger(FrontierService.name);
  private currentBatch: FrontierQueue[] = [];
  private isProcessing = false;
  private readonly BATCH_SIZE = 20;
  private readonly URL_PROCESS_TIME = 10000; // 10 seconds in ms

  constructor(
    @InjectRepository(FrontierQueue)
    private frontierRepository: Repository<FrontierQueue>,
  ) {}

  /**
   * Add a URL to the frontier queue
   */
  async addUrlToQueue(urlDataDto: Partial<FrontierQueueDto>): Promise<FrontierQueue> {
    const readyUrlData = this.frontierRepository.create(urlDataDto as any);
    return this.frontierRepository.save(readyUrlData as any) as Promise<FrontierQueue>;
  }

  /**
   * Get next URL from queue with highest priority
   * Fetches URLs with:
   * - Status 'new' or 'success' where last_seen > 2 days ago (ready for re-processing)
   * - Status 'failed' where retry_time interval has passed since last_seen
   */
  async takeUrl(): Promise<FrontierQueue | null> {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const now = new Date();

    // Fetch all failed URLs to check retry_time manually (since raw SQL comparison is complex in TypeORM)
    const items = await this.frontierRepository.find({
      where: [
        // New or previously successful URLs that haven't been seen in 2+ days
        { status: In(['new', 'success']), last_seen: LessThan(twoDaysAgo) },
        // Failed URLs (we'll check retry_time logic below)
        { status: 'failed' },
      ],
      order: { priority: 'DESC' },
      take: 1,
    });

    let selectedItem: FrontierQueue | null = null;

    for (const item of items) {
      if (item.status === 'failed') {
        // Check if retry interval has passed
        const lastSeenTime = new Date(item.last_seen).getTime();
        const retryIntervalMs = item.retry_time * 1000; // Convert seconds to milliseconds
        const retryAvailableAt = lastSeenTime + retryIntervalMs;

        if (now.getTime() >= retryAvailableAt) {
          selectedItem = item;
          break;
        }
      } else {
        // For 'new' or 'success' status, they're already filtered
        selectedItem = item;
        break;
      }
    }

    if (selectedItem) {
      selectedItem.status = 'processing';
      await this.frontierRepository.save(selectedItem);
    }
    return selectedItem || null;
  }

  /**
   * Fetch a batch of URLs (20 at a time)
   */
  async fetchBatch(): Promise<FrontierQueue[]> {
    const batch = await this.frontierRepository.find({
      where: { status: 'new' },
      order: { priority: 'DESC' },
      take: this.BATCH_SIZE,
    });

    // Mark all items in batch as processing
    batch.forEach((item) => {
      item.status = 'processing';
    });
    await this.frontierRepository.save(batch as any);

    this.currentBatch = batch;
    this.logger.log(`Fetched batch of ${batch.length} URLs`);
    return batch;
  }

  /**
   * Process a single URL
   */
  async processUrl(url: FrontierQueue): Promise<void> {
    try {
      this.logger.log(`Processing URL: ${url.url}`);

      // Simulate URL processing (replace with actual crawler logic)
      await new Promise((resolve) =>
        setTimeout(resolve, this.URL_PROCESS_TIME),
      );

      // Mark as processed
      url.status = 'processed';
      url.last_seen = new Date();
      await this.frontierRepository.save(url);

      this.logger.log(`Successfully processed: ${url.url}`);
    } catch (error) {
      this.logger.error(`Error processing ${url.url}:`, error);

      // Mark as failed and increment retry count
      url.status = 'failed';
      url.retry_count++;
      url.last_seen = new Date();
      await this.frontierRepository.save(url);
    }
  }

  /**
   * Process entire batch sequentially (one by one)
   */
  async processBatch(batch: FrontierQueue[]): Promise<void> {
    this.logger.log(`Starting batch processing for ${batch.length} URLs`);

    for (const url of batch) {
      await this.processUrl(url);
    }

    this.logger.log('Batch processing completed');
  }

  /**
   * Start continuous processing - fetches 20 URLs at a time and processes them
   * After batch completes, automatically refetches next batch
   */
  async startContinuousProcessing(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Processing already in progress');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Started continuous URL processing');

    while (this.isProcessing) {
      try {
        const batch = await this.fetchBatch();

        if (batch.length === 0) {
          this.logger.log('No more URLs to process. Waiting...');
          // Wait 5 seconds before checking again
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        // Process all URLs in batch sequentially
        await this.processBatch(batch);

        this.logger.log('Refetching next batch...');
      } catch (error) {
        this.logger.error('Error in continuous processing:', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Stop continuous processing
   */
  stopContinuousProcessing(): void {
    this.isProcessing = false;
    this.logger.log('Stopped continuous processing');
  }

  /**
   * Mark a URL as successfully processed
   */
  async markProcessed(id: string): Promise<FrontierQueue | null> {
    const item = await this.frontierRepository.findOneBy({ id });
    if (!item) {
      this.logger.warn(`URL with id ${id} not found`);
      return null;
    }
    item.status = 'success';
    item.last_seen = new Date();
    return this.frontierRepository.save(item as any) as Promise<FrontierQueue>;
  }

  /**
   * Mark a URL as failed and increment retry count
   */
  async markFailed(id: string): Promise<FrontierQueue | null> {
    const item = await this.frontierRepository.findOneBy({ id });
    if (!item) {
      this.logger.warn(`URL with id ${id} not found`);
      return null;
    }
    item.status = 'failed';
    item.retry_count++;
    item.last_seen = new Date();
    return this.frontierRepository.save(item as any) as Promise<FrontierQueue>;
  }

  /**
   * Get all items in queue
   */
  async getAllQueue(): Promise<FrontierQueue[]> {
    return this.frontierRepository.find({ order: { priority: 'DESC' } });
  }

  /**
   * Get current batch being processed
   */
  getCurrentBatch(): FrontierQueue[] {
    return this.currentBatch;
  }

  /**
   * Check if processing is active
   */
  isProcessingActive(): boolean {
    return this.isProcessing;
  }

  /**
   * Clear queue by removing all items
   */
  async clearQueue(): Promise<void> {
    await this.frontierRepository.delete({});
  }
}
 