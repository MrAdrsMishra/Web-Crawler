/**
 * Initial Database Seed Script
 * 
 * Seeds the frontier_queue with the sitemap-index.xml URL
 * This should be run once to initialize the scraper
 * 
 * Usage: npx ts-node seed-sitemap.ts
 */

import { DataSource } from 'typeorm';
import { FrontierQueue } from './src/frontier-queue/frontier.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'book_scraper',
  entities: [FrontierQueue],
  synchronize: true,
});

async function seedSitemap() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const frontierRepository = AppDataSource.getRepository(FrontierQueue);

    // Check if sitemap-index already exists
    const existing = await frontierRepository.findOne({
      where: { url: 'https://www.worldofbooks.com/sitemaps/sitemap-index.xml' }, // Update with your domain
    });

    if (existing) {
      console.log('⚠️  Sitemap index already exists in queue');
      await AppDataSource.destroy();
      return;
    }

    // Seed the sitemap-index.xml URL
    const sitemapIndex = frontierRepository.create({
      url: 'https://www.worldofbooks.com/sitemaps/sitemap-index.xml', // Update with your domain
      status: 'new',
      depth: 0,
      last_seen: new Date(),
      priority: 1000, // Highest priority - process first
      retry_time: 86400, // 24 hours
      retry_count: 0,
    });

    const saved = await frontierRepository.save(sitemapIndex);
    console.log('✅ Seeded sitemap index URL:');
    console.log(`   URL: ${saved.url}`);
    console.log(`   Status: ${saved.status}`);
    console.log(`   Priority: ${saved.priority}`);
    console.log(`   ID: ${saved.id}`);
    console.log('');
    console.log('🚀 Ready to start scraper!');
    console.log('   Run: npm run start:dev');
    console.log('   Then: POST /scraper/start');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedSitemap();
