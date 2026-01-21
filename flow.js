module.exports = {
  START_URLS: [
    'https://www.worldofbooks.com/products_1.xml'
  ],
  MAX_PAGES: 500,
  CONCURRENCY: 1,
  USER_AGENT: 'Mozilla/5.0'
};
//-------------------
class Frontier {
  constructor() {
    this.queue = [];
  }

  push(url) {
    this.queue.push(url);
  }

  pop() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

module.exports = new Frontier();
// -------------------------
class Dedupe {
  constructor() {
    this.seen = new Set();
  }

  has(url) {
    return this.seen.has(url);
  }

  add(url) {
    this.seen.add(url);
  }
}

module.exports = new Dedupe();
// ------------------------------
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { USER_AGENT } = require('./config');

async function crawl(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': '*/*'
    }
  });

  return await res.text();
}

module.exports = crawl;
// ------------------------------------
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

const xmlParser = new XMLParser();

function parse(url, content) {
  // XML sitemap
  if (url.endsWith('.xml')) {
    const data = xmlParser.parse(content);

    const links = data.urlset?.url?.map(u => u.loc) || [];

    return {
      textData: null,
      links
    };
  }

  // HTML page
  const $ = cheerio.load(content);

  const title = $('title').text();

  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http')) {
      links.push(href);
    }
  });

  return {
    textData: { title },
    links
  };
}

module.exports = parse;
// --------------------------------
const fs = require('fs/promises');

async function save(data) {
  if (!data) return;

  await fs.appendFile(
    'pages.jsonl',
    JSON.stringify(data) + '\n'
  );
}

module.exports = save;
// -----------------------------
const frontier = require('./frontier');
const dedupe = require('./dedupe');
const crawl = require('./crawler');
const parse = require('./parser');
const save = require('./storage');
const { START_URLS, MAX_PAGES } = require('./config');

let processed = 0;

// seed frontier
START_URLS.forEach(url => frontier.push(url));

async function run() {
  while (!frontier.isEmpty() && processed < MAX_PAGES) {
    const url = frontier.pop();

    if (dedupe.has(url)) continue;
    dedupe.add(url);

    console.log('→ Crawling:', url);

    const content = await crawl(url);
    const { textData, links } = parse(url, content);

    await save(textData);

    for (const link of links) {
      if (!dedupe.has(link)) {
        frontier.push(link);
      }
    }

    processed++;
  }

  console.log('DONE');
}

run().catch(console.error);

// ------------------------------