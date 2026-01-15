const { XMLParser } = require('fast-xml-parser');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const parser = new XMLParser();

const MAX_URLS = 500;
let count = 0;
const urls = [];

async function fetchXml(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/xml,text/xml'
        }
    });
    return await res.text();
}

async function extractProductUrls(productSitemapUrl) {
    if (count >= MAX_URLS) return;

    console.log('→ Visiting product sitemap:', productSitemapUrl);

    const xml = await fetchXml(productSitemapUrl);
    const data = parser.parse(xml);

    if (!data.urlset?.url) return;

    const list = [].concat(data.urlset.url);

    for (const u of list) {
        if (count >= MAX_URLS) break;
        urls.push(u.loc);
        count++;
    }
}

async function run() {
    console.log('Visiting index sitemap...');

    const indexXml = await fetchXml(
        'https://www.worldofbooks.com/tools/sitemap-builder/sitemap.xml'
    );

    const indexData = parser.parse(indexXml);

    const productSitemaps = [].concat(indexData.sitemapindex.sitemap);

    for (const sm of productSitemaps) {
        if (count >= MAX_URLS) break;
        await extractProductUrls(sm.loc);
    }

    console.log('\nDONE');
    console.log('Total URLs:', urls.length);
    console.log('First 10 URLs:', urls.slice(0, 500));
}

run();
