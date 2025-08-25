import { useState, useCallback } from 'react';
import { ToastType } from '@/components/Toast';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastConfig {
  duration?: number;
  customIcon?: string;
  customColors?: {
    background: string;
    border: string;
    icon: string;
  };
  position?: 'top' | 'bottom';
  showIcon?: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const [config, setConfig] = useState<ToastConfig>({
    duration: 3000,
    position: 'bottom',
    showIcon: true,
  });

  const showToast = useCallback((message: string, type: ToastType = 'info', toastConfig?: ToastConfig) => {
    setToast({
      visible: true,
      message,
      type,
    });

    if (toastConfig) {
      setConfig((prev) => ({ ...prev, ...toastConfig }));
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods for different toast types
  const showInfo = useCallback(
    (message: string, config?: ToastConfig) => {
      showToast(message, 'info', config);
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, config?: ToastConfig) => {
      showToast(message, 'success', config);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, config?: ToastConfig) => {
      showToast(message, 'warning', config);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, config?: ToastConfig) => {
      showToast(message, 'error', config);
    },
    [showToast]
  );

  const showLoading = useCallback(
    (message: string, config?: ToastConfig) => {
      showToast(message, 'loading', config);
    },
    [showToast]
  );

  const showCustom = useCallback(
    (message: string, customColors: ToastConfig['customColors'], customIcon?: string, config?: ToastConfig) => {
      showToast(message, 'custom', {
        ...config,
        customColors,
        customIcon,
      });
    },
    [showToast]
  );

  return {
    toast,
    config,
    showToast,
    hideToast,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showLoading,
    showCustom,
  };
}
