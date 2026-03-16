# Web-Crawler
Its a web crawler that is designe d for worldofbooks.com. The engine follows all the policies mentioned int robots.txt and copliance.

# Sitemap-Based Scraper with Memory Management

## 🎯 Problem Solved

- **Original Challenge**: Process 74 million products (200,000 entries × 400 product XMLs)
- **Memory Constraint**: Cannot process and store all sitemaps simultaneously
- **Solution**: Smart sitemap processing that:
  1. Processes sitemap-index.xml first to discover all sitemaps
  2. Adds ALL collection/category sitemaps to queue
  3. **Adds ONLY product_1.xml** to queue (tracks latest changes only)
  4. Skips remaining 399 product sitemaps (memory management)

## 🏗️ Architecture Flow

```
Initial Frontier Queue (empty except for sitemap-index.xml URL)
     ↓
App Starts → startScraping()
     ↓
processSitemapIndex() [Step 0]
     ↓
Fetch sitemap-index.xml
     ↓
Parse sitemap-index.xml
     ↓
Extract URLs:
├── Collection Sitemaps (e.g., collection.xml, category.xml)
├── Product Sitemaps (e.g., product_1.xml, product_2.xml, ..., product_400.xml)
└── Other Sitemaps
     ↓
Add to Frontier Queue:
├── ALL collection sitemaps → Priority: 100 (high)
├── ONLY product_1.xml → Priority: 99 (slightly lower)
└── Skip other product XMLs (401-400) [Memory saved!]
     ↓
Main Control Loop Continues
(Processes URLs from queue normally)
     ↓
For each URL:
├── If collection XML → Parse and add product URLs to queue
├── If product_1.xml → Parse and add 200,000 product URLs to queue
└── If product URL → Scrape details and save to DB
```

## 📋 Sitemap Processing Details

### Step 1: Parse Sitemap Index
```xml
<!-- sitemap-index.xml -->
<sitemapindex>
  <sitemap>
    <loc>https://www.worldofbooks.com/sitemaps/collection.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://www.worldofbooks.com/sitemaps/product_1.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://www.worldofbooks.com/sitemaps/product_2.xml</loc>
  </sitemap>
  <!-- ... product_3.xml to product_400.xml ... -->
</sitemapindex>
```

### Step 2: Classify Sitemaps
- **Collection Sitemaps**: URLs containing "collection" or "category" → Added to queue
- **Product Sitemaps**: URLs containing "product" → Only product_1.xml added

### Step 3: Add to Queue
```
Collection Sitemaps (ALL added):
  - collection.xml (priority: 100)
  - category.xml (priority: 100)
  - subcategory.xml (priority: 100)
  - etc.

Product Sitemaps:
  - product_1.xml (priority: 99) ✅ ADDED
  - product_2.xml ❌ SKIPPED (memory management)
  - product_3.xml ❌ SKIPPED (memory management)
  - ... 
  - product_400.xml ❌ SKIPPED (memory management)
```

## 🔧 Key Components

### SitemapParserService
```typescript
// Methods:
- parseSitemapIndex(xml) → Extract sitemap URLs from sitemap-index
- parseSitemapUrlset(xml) → Extract product URLs from specific sitemap
- isSitemapIndex(url) → Detect if URL is a sitemap-index
- isProductSitemap(url) → Detect if URL is product_X.xml
- isCollectionSitemap(url) → Detect if URL is collection/category XML
- extractProductNumber(url) → Extract product number (e.g., 1 from product_1.xml)
```

### ScraperService Enhancement
```typescript
// New flag:
private sitemapProcessed = false; // Ensures one-time sitemap processing

// New method:
processSitemapIndex() → Handles entire sitemap discovery and queue population
```

## 📊 Memory Usage Optimization

### Before (Processing All)
- Load 400 product XMLs in memory = ~800 MB+
- Parse 74 million product URLs = Memory overload ❌

### After (Product_1 Only)
- Load only product_1.xml = ~2 MB
- Parse 200,000 product URLs = Manageable ✅
- Track latest changes efficiently ✅

## 🚀 Startup Sequence

1. **Initialize App**: `npm run start:dev`
2. **Frontier Queue**: Contains only `https://...sitemap-index.xml`
3. **Start Scraper**: `POST /scraper/start`
4. **Automatic Sitemap Processing**:
   - Fetches sitemap-index.xml
   - Discovers all sitemaps
   - Adds collections + product_1.xml to queue
   - Proceeds with normal scraping loop

## 📝 Retry Configuration

Each added URL has:
- **Collection sitemaps**: `retry_time: 86400` (24 hours) - slow-changing
- **Product_1.xml**: `retry_time: 86400` (24 hours) - tracks latest changes
- **Product URLs**: `retry_time: 3600` (1 hour) - frequently updated

## 🎯 Data Flow for Product_1.xml

```
product_1.xml (200,000 entries)
     ↓
Parse XML → Extract 200,000 product URLs
     ↓
Add to Frontier Queue (priority: varies by depth)
     ↓
Main Loop:
For each product URL:
├── Fetch product page
├── Extract details (title, price, description, image)
├── Save to database
└── Mark as processed
     ↓
Latest Product Data Updated Daily
```

## 📡 API Endpoints

All existing endpoints work the same:
- `POST /scraper/start` - Starts scraper (triggers sitemap processing)
- `POST /scraper/stop` - Stops scraper
- `GET /scraper/status` - Check status

## ⚙️ Configuration

To enable other product XMLs in future:
```typescript
// In processSitemapIndex():
// Change from extracting only product_1.xml to product_1.xml and product_2.xml
const productURLsToAdd = productSitemaps.filter((url) => {
  const num = this.sitemapParserService.extractProductNumber(url);
  return num === 1 || num === 2; // Add product_1 and product_2
});
```

## ✅ Benefits

- ✅ **Memory Efficient**: Loads one product XML at a time
- ✅ **Automated**: Sitemap discovery runs automatically on startup
- ✅ **Latest Data**: Tracks changes in product_1.xml (200K entries)
- ✅ **Scalable**: Can be extended to process more sitemaps later
- ✅ **Smart**: Classifies and prioritizes different sitemap types
- ✅ **Robust**: Handles errors gracefully, continues scraping

## 🔍 Monitoring

Watch logs for:
```
📋 Processing sitemap index first...
📡 Fetching sitemap index: https://...sitemap-index.xml
📍 Found 401 sitemaps
🛍️ Found 400 product sitemaps
📂 Found 1 collection sitemaps
✅ Added 1 collection sitemaps to queue
✅ Added product_1.xml to queue: https://...product_1.xml
⚠️  Skipping other 399 product sitemaps (memory management)
✔️ Sitemap index processing complete
```

This ensures memory-efficient, targeted scraping of your latest product data! 🎉

# Scraper Control Loop Architecture

## 🏗️ System Architecture

```
App Initialization
     ↓
ScraperService.onModuleInit()
     ↓
while (isRunning)
     ↓
┌────────────────────────────────────────────┐
│        1. FRONTIER QUEUE                    │
│  - Decide which URL to crawl               │
│  - Priority-based selection                │
│  - Retry interval handling                 │
└────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────┐
│        2. CRAWLER SERVICE                   │
│  - HTTP fetch with axios                   │
│  - User-agent headers                      │
│  - 30-second timeout                       │
│  - Error handling                          │
└────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────┐
│        3. PARSER SERVICE                    │
│  - Extract links (cheerio)                 │
│  - Extract products/data                   │
│  - Resolve relative URLs                   │
│  - Same-domain filtering                   │
└────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────┐
│        4. DATABASE SERVICE                  │
│  - Save products/details                   │
│  - Save navigation data                    │
│  - Persist extracted info                  │
└────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────┐
│        5. FRONTIER QUEUE (Update)           │
│  - Mark current URL as 'success'           │
│  - Add discovered links back to queue      │
│  - Set retry_time for failures             │
└────────────────────────────────────────────┘
     ↓
     Repeat (go to step 1)
```

## 📦 Module Structure

### FrontierService
- **takeUrl()** - Get next URL based on:
  - Status: 'new', 'success', or 'failed' (with retry_time check)
  - Priority-ordered selection
  - 2-day recrawl interval for 'success'
  - Retry interval check for 'failed'

- **addUrlToQueue()** - Add URLs to queue
- **markProcessed()** - Mark URL as 'success'
- **markFailed()** - Mark URL as 'failed' and increment retry_count
- **fetchBatch()** - Fetch up to 20 URLs at once
- **startContinuousProcessing()** - Batch processing loop

### CrawlerService
- **fetch(url)** - HTTP GET request
  - Returns: `{ success, html, statusCode, error }`
  - Handles redirects, timeouts, errors
  - User-agent headers for web scraping

### ParserService
- **parse(html, baseUrl)** - Extract from HTML
  - Returns: `{ links: string[], products: any[] }`
  - Uses cheerio for DOM parsing
  - Resolves relative URLs to absolute
  - Filters to same-domain only
  - Extracts products, titles, prices, images

### DatabaseService
- **saveProducts(products)** - Persist product data
- **saveProduct(product)** - Save individual product

### ScraperService
- **startScraping()** - Start the control loop
  - Orchestrates: Frontier → Crawler → Parser → DB
  - Handles errors gracefully
  - Logs all steps
  
- **stopScraping()** - Stop the loop
- **getStatus()** - Return current state

## 🔄 Data Flow

1. **URL Selection**: `FrontierService.takeUrl()`
   - Returns URL item marked as 'processing'

2. **HTTP Fetch**: `CrawlerService.fetch(url)`
   - Returns HTML content

3. **Parsing**: `ParserService.parse(html, baseUrl)`
   - Returns links and products

4. **Persistence**: `DatabaseService.saveProducts(products)`
   - Saves extracted data

5. **Queue Update**:
   - Mark processed URL as 'success'
   - Add discovered links as 'new' URLs
   - Set priority and retry_time

## 🌐 API Endpoints

- `POST /scraper/start` - Start scraper control loop
- `POST /scraper/stop` - Stop scraper
- `GET /scraper/status` - Check if running

## ⚙️ Configuration

### Frontier Queue Entity
```
- id (UUID)
- url (string)
- status ('new' | 'processing' | 'success' | 'failed')
- depth (number)
- last_seen (Date)
- priority (number)
- retry_time (seconds)
- retry_count (number)
```

### Processing Rules
- Fetch up to 20 URLs at a time
- Process each URL sequentially (10s per URL in simulation)
- Refetch batch when depleted
- Wait 5s if no URLs available
- For 'success' status: Re-crawl if last_seen > 2 days
- For 'failed' status: Only retry if current_time >= last_seen + retry_time

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm run start:dev

# Start scraper (via API)
curl -X POST http://localhost:3000/scraper/start

# Check status
curl http://localhost:3000/scraper/status

# Stop scraper
curl -X POST http://localhost:3000/scraper/stop
```

## 📝 Key Features

✅ Priority-based URL selection
✅ Automatic retry with configurable intervals
✅ Batch processing (20 URLs/batch)
✅ Graceful error handling
✅ URL deduplication
✅ Same-domain filtering
✅ Comprehensive logging
✅ Database persistence
✅ RESTful API controls
