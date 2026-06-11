const BACKEND_API_BASE = 'https://backend.mazas.org/api';

export default async function middleware(request) {
  const incomingUrl = new URL(request.url);
  const backendPath = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const targetUrl = new URL(`${BACKEND_API_BASE}/${backendPath}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set('cache-control', 'no-store');

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return Response.json({ error: 'Nao foi possivel contactar o servidor MAZA.' }, { status: 502 });
  }
}

export const config = {
  matcher: '/api/:path*',
};
