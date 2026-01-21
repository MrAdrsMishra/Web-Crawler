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
