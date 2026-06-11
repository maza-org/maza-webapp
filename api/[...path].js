const BACKEND_API_BASE = 'https://backend.mazas.org/api';

function appendQuery(targetUrl, query) {
  const url = new URL(targetUrl);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (key === 'path') return;

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      return;
    }

    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

module.exports = async function handler(req, res) {
  const rawPath = req.query.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath || '';
  const targetUrl = appendQuery(`${BACKEND_API_BASE}/${path}`, req.query);
  const headers = {
    accept: req.headers.accept || 'application/json',
    'content-type': req.headers['content-type'] || 'application/json',
  };

  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }

  const requestInit = {
    method: req.method,
    headers,
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    requestInit.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  }

  try {
    const upstream = await fetch(targetUrl, requestInit);
    const body = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';

    res.status(upstream.status);
    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store');
    res.send(body);
  } catch {
    res.status(502).json({ error: 'Nao foi possivel contactar o servidor MAZA.' });
  }
};
