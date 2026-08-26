const API_BASE = 'https://bizcardly-1.onrender.com/api';

module.exports = async (req, res) => {
  const { url } = req;
  const parts = url.split('/').filter(Boolean);

  let slug = null;
  if (parts[0] === 'listing' && parts.length >= 3) {
    slug = parts[2];
  }

  const fallbackHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta property="og:title" content="Bizcardly - Digital Business Card Platform" />
<meta property="og:description" content="Create your free digital business card and share it with a unique QR code and URL" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Bizcardly" />
<meta name="twitter:card" content="summary" />
<title>Bizcardly - Digital Business Card Platform</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

  if (!slug) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(fallbackHtml);
  }

  try {
    const fetchRes = await fetch(`${API_BASE}/business/slug/${encodeURIComponent(slug)}`);
    const data = await fetchRes.json();

    if (!data.success || !data.business) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(fallbackHtml);
    }

    const biz = data.business;
    const bizName = biz.name || biz.businessName || 'Digital Business Card';
    const ownerName = biz.tagline || '';
    const title = ownerName ? `${bizName} - ${ownerName}` : bizName;
    const description = biz.description || biz.about || `${bizName} - Digital Business Card powered by Bizcardly`;
    const canonicalUrl = `https://bizcardly.vercel.app${url}`;

    let ogImage = '';
    if (biz.logo && biz.logo.startsWith('http')) {
      ogImage = biz.logo;
    } else if (biz.logo && biz.logo.startsWith('/uploads/')) {
      ogImage = `https://bizcardly-1.onrender.com${biz.logo}`;
    } else if (biz.profileImage && biz.profileImage.startsWith('http')) {
      ogImage = biz.profileImage;
    } else if (biz.profileImage && biz.profileImage.startsWith('/uploads/')) {
      ogImage = `https://bizcardly-1.onrender.com${biz.profileImage}`;
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:title" content="${escapeHtml(bizName)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="Bizcardly" />
<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
<meta name="twitter:title" content="${escapeHtml(bizName)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error('OG meta error:', error);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(fallbackHtml);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
