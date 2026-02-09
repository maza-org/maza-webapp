import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWindowDimensions, Keyboard, Platform } from 'react-native';

interface CompactModeContextValue {
  isCompact: boolean;
}

const CompactModeContext = createContext<CompactModeContextValue>({ isCompact: false });

export function CompactModeProvider({ children }: { children: React.ReactNode }) {
  const { height } = useWindowDimensions();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const isCompact = height < 500 || isKeyboardVisible;

  return <CompactModeContext.Provider value={{ isCompact }}>{children}</CompactModeContext.Provider>;
}

export function useCompactMode() {
  return useContext(CompactModeContext);
}
