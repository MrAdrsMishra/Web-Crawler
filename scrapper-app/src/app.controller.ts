import { Controller, Get, Post, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { ScraperService } from './scraper/scraper.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scraperService: ScraperService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  checkHealth(): string {
    return this.appService.checkHealth();
  }

  /**
   * Start the scraper control loop
   */
  @Post('/scraper/start')
  async startScraper(): Promise<{ message: string; status: string }> {
    await this.scraperService.startScraping();
    return { message: 'Scraper started', status: 'running' };
  }

  /**
   * Stop the scraper control loop
   */
  @Post('/scraper/stop')
  stopScraper(): { message: string; status: string } {
    this.scraperService.stopScraping();
    return { message: 'Scraper stopped', status: 'stopped' };
  }

  /**
   * Get scraper status
   */
  @Get('/scraper/status')
  getScraperStatus(): { isRunning: boolean; status: string } {
    return this.scraperService.getStatus();
  }
}
