import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import React from 'react';

interface ButtonProps {
  handle: () => void;
  text: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'secondary';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Button({ handle, text, disabled, loading, variant = 'primary', icon, style }: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      case 'secondary':
        return styles.secondaryButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      case 'secondary':
        return styles.secondaryButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'outline':
        return '#1fa2df';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getButtonStyle(),
        loading && styles.loadingButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={handle}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={getSpinnerColor()} style={styles.spinner} />
        ) : (
          icon && <View style={styles.iconContainer}>{icon}</View>
        )}
        <Text style={[styles.baseText, getTextStyle()]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#22ACE3',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1fa2df',
  },
  secondaryButton: {
    backgroundColor: '#202024',
  },
  loadingButton: {
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: '#202024',
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'ManropeBold',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#1fa2df',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  spinner: {
    marginRight: 8,
  },
});

export default Button;
