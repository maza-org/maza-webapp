import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

function readBrowserViewportWidth() {
  if (Platform.OS !== 'web') return 0;
  const win = (globalThis as any).window;
  const doc = (globalThis as any).document;
  const widths = [
    win?.visualViewport?.width,
    win?.innerWidth,
    win?.outerWidth,
    win?.screen?.width,
    doc?.documentElement?.clientWidth,
    doc?.body?.getBoundingClientRect?.().width,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  return widths.length > 0 ? Math.min(...widths) : 0;
}

export function useIsWideWeb(minWidth = 900) {
  const [viewportWidth, setViewportWidth] = useState(readBrowserViewportWidth);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const win = (globalThis as any).window;
    const update = () => setViewportWidth(readBrowserViewportWidth());

    update();
    win?.addEventListener?.('resize', update);
    win?.visualViewport?.addEventListener?.('resize', update);

    return () => {
      win?.removeEventListener?.('resize', update);
      win?.visualViewport?.removeEventListener?.('resize', update);
    };
  }, []);

  return Platform.OS === 'web' && viewportWidth >= minWidth;
}
