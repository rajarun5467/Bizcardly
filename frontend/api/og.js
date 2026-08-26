import https from 'https';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const API_HOST = 'bizcardly-1.onrender.com';

function loadBaseHtml() {
  const candidates = [
    join(__dirname, 'dist', 'index.html'),
    join(__dirname, '..', 'dist', 'index.html'),
    join(__dirname, '..', '..', 'dist', 'index.html'),
    'dist/index.html',
    '../dist/index.html',
    '../../dist/index.html',
  ];
  for (const p of candidates) {
    try {
      if (existsSync(p)) return readFileSync(p, 'utf8');
    } catch (e) {}
  }
  return null;
}

const BASE_HTML = loadBaseHtml();

const FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Bizcardly - Digital Business Card Platform</title>
<meta name="description" content="Create your free digital business card and share it with a unique QR code and URL" />
<meta property="og:title" content="Bizcardly - Digital Business Card Platform" />
<meta property="og:description" content="Create your free digital business card and share it with a unique QR code and URL" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Bizcardly" />
<meta name="twitter:card" content="summary" />
</head>
<body>
<div id="root"></div>
</body>
</html>`;

export default async (req, res) => {
  let path = '/';
  try {
    const rawUrl = req.url || '/';
    path = rawUrl.split('?')[0];
    const parts = path.split('/').filter(Boolean);

    let slug = null;
    if (parts[0] === 'listing' && parts.length >= 3) {
      slug = parts[2];
    }

    const fallback = buildHtml('Bizcardly - Digital Business Card Platform', 'Create your free digital business card and share it with a unique QR code and URL', 'https://bizcardly.vercel.app' + path, '', '');

    if (!slug) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).send(fallback);
    }

    const data = await Promise.race([
      fetchJson(API_HOST, '/api/business/slug/' + encodeURIComponent(slug)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Hard timeout')), 5000)),
    ]);

    if (!data || !data.success || !data.business) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 's-maxage=3600');
      return res.status(200).send(fallback);
    }

    const biz = data.business;
    const bizName = escapeHtml(biz.name || biz.businessName || 'Digital Business Card');
    const tagline = escapeHtml(biz.tagline || '');
    const title = tagline ? `${bizName} - ${tagline}` : bizName;
    const description = escapeHtml(biz.about || biz.description || `${bizName} - Digital Business Card powered by Bizcardly`);
    const canonicalUrl = 'https://bizcardly.vercel.app' + path;

    let ogImage = '';
    const imagePath = biz.logo || biz.profileImage || '';
    if (imagePath.startsWith('http')) {
      ogImage = imagePath;
    } else if (imagePath.startsWith('/uploads/')) {
      ogImage = 'https://bizcardly-1.onrender.com' + imagePath;
    }

    const html = buildHtml(title, description, canonicalUrl, bizName, ogImage);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error('OG handler error:', path, error.message);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).send(BASE_HTML ? buildHtml('Bizcardly - Digital Business Card Platform', 'Create your free digital business card and share it with a unique QR code and URL', 'https://bizcardly.vercel.app' + path, '', '') : FALLBACK_HTML);
  }
};

function buildHtml(title, description, url, ogTitle, ogImage) {
  const imageMeta = ogImage
    ? `  <meta property="og:image" content="${escapeHtml(ogImage)}" />\n  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
    : '';
  const metaTags = `
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle || title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="Bizcardly" />
  <meta property="og:url" content="${escapeHtml(url)}" />
${imageMeta}
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle || title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />`;

  if (!BASE_HTML) {
    return FALLBACK_HTML;
  }

  let html = BASE_HTML;
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<\/head>/i, `${metaTags}\n</head>`);

  return html;
}

function fetchJson(hostname, apipath) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname,
      path: apipath,
      method: 'GET',
      headers: { Accept: 'application/json' },
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          resolve(null);
        }
      });
    });

    request.on('error', (err) => reject(err));
    request.setTimeout(4000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    request.end();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
