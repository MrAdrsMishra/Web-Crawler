# Scraping Engine – Architecture & Module Guide

This document explains **each module** in your NestJS scraping engine with **simple language**, **real-world examples**, and a **step-by-step flow** so you never need to search again.

---

## 🧠 Big Picture (Before Modules)

Think of your system like this:

> **Scrape Job** tells *what to scrape*
> **Crawler** finds *where to go*
> **Parser** decides *what kind of page it is*
> **Scraper** extracts *actual data*
> **Database** stores *state + results*

Real example:

> "Scrape all products from Mobile category on Amazon"

---

## 1️⃣ Scraper Module (`scraper`)

### Files

* `scrap-job.entity.ts`
* `scraper.module.ts`

### What this module does

This is the **starting point** of everything.

A **Scrape Job** represents a task like:

* scrape a category
* scrape a product
* track status & errors

### Real-life example

```json
{
  "id": 1,
  "targetUrl": "https://example.com/mobiles",
  "targetType": "category",
  "status": "pending"
}
```

### Why it exists

* Track job progress
* Retry failed jobs
* Run multiple jobs safely

Think of it as a **manager**.

---

## 2️⃣ Crawler Module (`crawler`)

### Files

* `crawler.entity.ts`
* `crawler.module.ts`

### What this module does

The crawler **does NOT extract data**.

It only:

* visits pages
* discovers new URLs
* pushes URLs into a queue

### Real-life example

If crawler visits:

```
https://example.com/mobiles
```

It discovers:

```
/mobiles/samsung
/mobiles/apple
```

It saves:

```json
{
  "jobId": 1,
  "url": "https://example.com/mobiles/samsung",
  "status": "pending",
  "depth": 1
}
```

### Why it exists

* Avoid duplicate crawling
* Resume after crash
* Enable retries & scaling

Crawler = **URL Finder** 🕷️

---

## 3️⃣ Navigation Module (`navigation`)

### Files

* `navigation.entity.ts`
* `view-history.entity.ts`
* `navigation.module.ts`

### What this module does

Keeps **track of how pages are connected**.

### Real-life example

```
Home → Category → Product
```

Navigation entity stores:

```json
{
  "fromUrl": "/mobiles",
  "toUrl": "/mobiles/iphone-15",
  "type": "product"
}
```

View History stores:

* which URLs were already seen
* prevents infinite loops

### Why it exists

* Prevent re-visits
* Understand site structure

---

## 4️⃣ Parser Module (`parser`)

### Files

* `parser.module.ts`

### What this module does

Parser **decides what kind of page this is**.

It answers:

* Is this a category page?
* Is this a product page?

### Real-life example

```ts
parse(url, html) → "product"
```

### Why it exists

* Same crawler can handle many page types
* Cleaner scraper logic

Parser = **Decision Maker** 🧠

---

## 5️⃣ Category Module (`category`)

### Files

* `category.entity.ts`
* `category.module.ts`

### What this module does

Stores **category data**.

### Example

```json
{
  "id": 10,
  "name": "Mobiles",
  "url": "/mobiles"
}
```

Used when:

* scraping category listing pages

---

## 6️⃣ Product Module (`product`)

### Files

* `product.entity.ts`
* `category-product.entity.ts`
* `product.module.ts`

### What this module does

Stores **final scraped product data**.

### Example

```json
{
  "name": "iPhone 15",
  "price": 79999,
  "category": "Mobiles"
}
```

`category-product.entity.ts` handles **many-to-many mapping**.

---

## 7️⃣ Review Module (`review`)

### Files

* `review.entity.ts`
* `review.module.ts`

### What this module does

Stores **product reviews**.

### Example

```json
{
  "productId": 1,
  "rating": 4.5,
  "comment": "Good battery"
}
```

---

## 8️⃣ Database Module (`database`)

### Files

* `database.module.ts`
* `database.service.ts`

### What this module does

Central DB connection + helpers.

Used by:

* crawler
* scraper
* parser

Single source of truth.

---

## 🔁 Full Example Flow (End-to-End)

### Step 1: Create Job

```json
POST /jobs
{
  "targetUrl": "https://example.com/mobiles",
  "targetType": "category"
}
```

### Step 2: Crawler starts

* visits category
* discovers product URLs
* saves to crawl queue

### Step 3: Parser classifies pages

* product page
* category page

### Step 4: Scraper extracts data

* product name
* price
* reviews

### Step 5: Data stored

* Product table
* Review table
* Job marked success

---

## 🧩 Final Architecture Summary

| Layer         | Responsibility      |
| ------------- | ------------------- |
| Scraper       | Job control         |
| Crawler       | URL discovery       |
| Parser        | Page classification |
| Scraper logic | Data extraction     |
| Database      | Persistence         |

---

## 🏁 Golden Rule (Remember this)

> **Crawler saves URLs**
> **Scraper saves data**
> **Job tracks everything**

---

If you want next:

* ER diagram
* API contract
* Retry strategy
* Queue-based scaling

Just tell me 👍
