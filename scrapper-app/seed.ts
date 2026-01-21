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

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const frontierRepository = AppDataSource.getRepository(FrontierQueue);

    const newItem = frontierRepository.create({
      url: 'https://www.worldofbooks.com/tools/sitemap-builder/sitemap.xml',
      status: 'new',
      depth: 1,
      lastSeen: new Date(),
      prioirty: 1,
      retryCount: 4,
    });

    const saved = await frontierRepository.save(newItem);
    console.log('Seeded data:', saved);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
