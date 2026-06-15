/**
 * Cloudflare Worker for Horns & Heritage
 * Routes:
 * - hornsandheritage.com → index.html
 * - dashboard.hornsandheritage.com → Sales Dashboard.html
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.hostname;

    try {
      // Route to Sales Dashboard
      if (host === 'dashboard.hornsandheritage.com' || host === 'www.dashboard.hornsandheritage.com') {
        return await getAsset('Sales Dashboard.html');
      }

      // Route to main index
      if (host === 'hornsandheritage.com' || host === 'www.hornsandheritage.com') {
        if (url.pathname === '/' || url.pathname === '') {
          return await getAsset('index.html');
        }
      }

      // Try to serve the requested file
      const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      return await getAsset(filePath);
    } catch (error) {
      return new Response('Not Found', { status: 404 });
    }
  }
};

/**
 * Fetch asset from R2 bucket or KV store
 */
async function getAsset(path) {
  // For local development, return mock response
  if (typeof ASSETS === 'undefined') {
    return new Response('Asset not found', { status: 404 });
  }

  const asset = ASSETS[path];
  if (!asset) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(asset, {
    headers: {
      'Content-Type': getContentType(path),
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

/**
 * Determine MIME type from file extension
 */
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf'
  };
  return types[ext] || 'application/octet-stream';
}
