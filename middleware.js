const BACKEND_API_BASE = 'https://backend.mazas.org/api';

export default async function middleware(request) {
  const incomingUrl = new URL(request.url);
  const backendPath = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const targetUrl = new URL(`${BACKEND_API_BASE}/${backendPath}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  const accept = request.headers.get('accept');
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  headers.set('accept', accept || 'application/json');
  if (contentType) headers.set('content-type', contentType);
  if (authorization) headers.set('authorization', authorization);

  try {
    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const body = hasBody ? await request.text() : undefined;
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
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
