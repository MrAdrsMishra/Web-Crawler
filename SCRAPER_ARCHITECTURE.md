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
