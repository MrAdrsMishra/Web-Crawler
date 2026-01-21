import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { SitemapParserService } from 'src/scraper/sitemap-parser.service';
 

@Module({
  providers: [ParserService, SitemapParserService],
  exports: [ParserService, SitemapParserService],
})
export class ParserModule {}
