import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const DESKTOP_BREAKPOINT = 768;

function getIsDesktopWeb() {
  if (Platform.OS !== 'web') {
    return false;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export default function useIsDesktopWeb() {
  const [isDesktop, setIsDesktop] = useState(getIsDesktopWeb);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const handleResize = () => {
      setIsDesktop(getIsDesktopWeb());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isDesktop;
}
