# Toast Component

A reusable toast notification component with multiple variations and customization options.

## Features

- ✅ **6 Toast Types**: Info, Success, Warning, Error, Loading, Custom
- ✅ **Flexible Positioning**: Top or bottom of screen
- ✅ **Customizable**: Colors, icons, duration, visibility
- ✅ **Safe Area Aware**: Respects device notches and home indicators
- ✅ **Smooth Animations**: Slide in/out with opacity transitions
- ✅ **Auto-dismiss**: Configurable duration (except loading)
- ✅ **TypeScript Support**: Fully typed with interfaces

## Basic Usage

### Using the useToast Hook (Recommended)

```tsx
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

function MyComponent() {
  const { toast, config, showSuccess, showError, hideToast } = useToast();

  const handleAction = () => {
    showSuccess('Operation completed successfully!');
  };

  return (
    <View>
      <Button onPress={handleAction} title="Show Success" />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
    </View>
  );
}
```

### Direct Component Usage

```tsx
import Toast from '@/components/Toast';

function MyComponent() {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as const,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <View>
      <Button onPress={() => showToast('Hello!', 'success')} title="Show Toast" />

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </View>
  );
}
```

## Toast Types

### 1. Info Toast

Neutral blue color for informational messages.

```tsx
showInfo('This is an informational message.');
```

**Colors**: Blue (`#3B82F6`)
**Icon**: `info`

### 2. Success Toast

Green/blue color for successful operations.

```tsx
showSuccess('Operation completed successfully!');
```

**Colors**: Maza Blue (`#1fa2df`)
**Icon**: `check-circle`

### 3. Warning Toast

Yellow/orange color for warnings.

```tsx
showWarning('Please be careful with this action.');
```

**Colors**: Warning Yellow (`#F59E0B`)
**Icon**: `alert-triangle`

### 4. Error Toast

Red color for error messages.

```tsx
showError('Something went wrong. Please try again.');
```

**Colors**: Error Red (`#EF4444`)
**Icon**: `alert-circle`

### 5. Loading Toast

Purple color with spinner for ongoing processes.

```tsx
showLoading('Processing your request...');
```

**Colors**: Loading Purple (`#8B5CF6`)
**Icon**: `ActivityIndicator` (spinner)

### 6. Custom Toast

Fully customizable colors and icons.

```tsx
showCustom(
  '🎉 Special promotion!',
  {
    background: '#FF6B6B',
    border: '#FF6B6B',
    icon: '#FFF',
  },
  'gift',
  { duration: 4000 }
);
```

## Configuration Options

### Toast Configuration

```tsx
interface ToastConfig {
  duration?: number; // Auto-dismiss time (ms), default: 3000
  position?: 'top' | 'bottom'; // Position on screen, default: 'bottom'
  showIcon?: boolean; // Show/hide icon, default: true
  customIcon?: string; // Custom Feather icon name
  customColors?: {
    // Custom colors for 'custom' type
    background: string;
    border: string;
    icon: string;
  };
}
```

### Examples

```tsx
// Top position toast
showInfo('Message at top', { position: 'top' });

// Longer duration
showSuccess('Long message', { duration: 5000 });

// No icon
showWarning('No icon message', { showIcon: false });

// Custom configuration
showCustom('Custom message', { background: '#FF6B6B', border: '#FF6B6B', icon: '#FFF' }, 'star', {
  duration: 4000,
  position: 'top',
});
```

## useToast Hook Methods

```tsx
const {
  toast, // Current toast state
  config, // Current configuration
  showToast, // Generic show method
  hideToast, // Hide current toast
  showInfo, // Show info toast
  showSuccess, // Show success toast
  showWarning, // Show warning toast
  showError, // Show error toast
  showLoading, // Show loading toast
  showCustom, // Show custom toast
} = useToast();
```

## Styling

The Toast component uses the app's design system:

- **Background**: `#202024` (card background)
- **Text**: White with `ManropeMedium` font
- **Border**: 1px with accent color
- **Shadow**: Enhanced depth perception
- **Border Radius**: 12px
- **Padding**: 16px
- **Icon Container**: 32x32 circular background

## Best Practices

1. **Use appropriate types**: Choose the right toast type for your message
2. **Keep messages concise**: Toast messages should be short and clear
3. **Don't overuse**: Avoid showing too many toasts in quick succession
4. **Loading toasts**: Use loading toasts for operations that take time
5. **Custom toasts**: Use for brand-specific messages or special occasions
6. **Positioning**: Use top position for critical messages, bottom for confirmations

## Examples

See `ToastExamples.tsx` for a complete demonstration of all toast variations and configurations.
