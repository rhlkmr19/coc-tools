// ============================================
// Vercel Serverless CORS Proxy for CoC API
// ============================================
// Proxies requests from frontend to official CoC API.
// Same-origin = no CORS issues.
// Uses VITE_COC_API_TOKEN from Vercel env vars.
// ============================================

const COC_API_BASE = 'https://api.clashofclans.com/v1';

export default async function handler(req, res) {
  // Set CORS headers (for local dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the path after /api/coc/
    const { path } = req.query;
    const cocPath = Array.isArray(path) ? path.join('/') : path;

    if (!cocPath) {
      return res.status(400).json({ error: 'Missing API path' });
    }

    // Build the full CoC API URL (preserve query string)
    const url = new URL(`${COC_API_BASE}/${cocPath}`);

    // Forward query params (except 'path' which is our routing param)
    const queryParams = { ...req.query };
    delete queryParams.path;
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Get token from environment
    // Check both COC_API_TOKEN (preferred for server) and VITE_COC_API_TOKEN (Vercel env)
    const token = process.env.COC_API_TOKEN || process.env.VITE_COC_API_TOKEN;
    if (!token) {
      return res.status(500).json({
        error: 'CoC API token not configured. Add COC_API_TOKEN or VITE_COC_API_TOKEN in Vercel Environment Variables.',
      });
    }

    // Build headers for CoC API
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Build fetch options
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // Forward body for POST requests (e.g., verifytoken)
    if (req.method === 'POST' && req.body) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Call CoC API
    const cocResponse = await fetch(url.toString(), fetchOptions);
    const data = await cocResponse.json();

    // Forward status code and data
    return res.status(cocResponse.status).json(data);

  } catch (error) {
    console.error('[CoC Proxy Error]', error.message);
    return res.status(502).json({
      error: 'Failed to reach Clash of Clans API',
      message: error.message,
    });
  }
}
