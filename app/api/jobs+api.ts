const JOBS_API_BASE_URL = 'https://www.emprego.co.mz/wp-api';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return Response.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const upstreamUrl = new URL(`${JOBS_API_BASE_URL}/${path.replace(/^\/+/, '')}`);

  for (const [key, value] of url.searchParams.entries()) {
    if (key !== 'path') {
      upstreamUrl.searchParams.append(key, value);
    }
  }

  try {
    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'x-requested-with': 'XMLHttpRequest',
      },
    });

    const contentType = response.headers.get('content-type') ?? 'application/json; charset=utf-8';
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'content-type': contentType,
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: 'Failed to fetch jobs upstream',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}
