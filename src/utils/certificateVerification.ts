import qrcode from 'qrcode-generator';

export function safeVerificationUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    const host = url.hostname;
    const trusted = host === 'backend.mazas.org' || host === 'staging-api.146.190.134.62.sslip.io';
    if (!trusted || url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash
      || !/^\/api\/certificates\/verify\/[a-f0-9-]{36}\.[A-Za-z0-9_-]{43}$/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function certificateQr(value: unknown) {
  const url = safeVerificationUrl(value);
  if (!url) return null;
  const qr = qrcode(0, 'M');
  qr.addData(url, 'Byte');
  qr.make();
  return qr;
}
