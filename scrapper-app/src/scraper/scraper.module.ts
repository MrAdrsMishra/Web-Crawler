import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { FrontierService } from 'src/frontier-queue/frontier.service';
import { FrontierModule } from 'src/frontier-queue/frontier-queue.module';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { ParserModule } from 'src/parser/parser.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [FrontierModule, CrawlerModule, ParserModule, DatabaseModule],
  providers: [ScraperService],
  exports: [ScraperService],
})
export class ScraperModule {}
