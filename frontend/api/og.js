const https = require('https');
const API_HOST = 'bizcardly-1.onrender.com';

module.exports = async (req, res) => {
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
    const description = escapeHtml(biz.description || biz.about || `${bizName} - Digital Business Card powered by Bizcardly`);
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
    const fallback = buildHtml('Bizcardly - Digital Business Card Platform', 'Create your free digital business card and share it with a unique QR code and URL', 'https://bizcardly.vercel.app' + path, '', '');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).send(fallback);
  }
};

function buildHtml(title, description, url, ogTitle, ogImage) {
  const imageMeta = ogImage
    ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />\n<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20100%20100%27%3E%3Ctext%20y%3D%27.9em%27%20font-size%3D%2790%27%3E%F0%9F%92%BC%3C%2Ftext%3E%3C%2Fsvg%3E" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
<meta name="twitter:description" content="${escapeHtml(description)}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet" />
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
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
