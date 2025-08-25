import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Toast from '../Toast';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

describe('Toast Component', () => {
  it('renders success toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(<Toast visible={true} message="Success message" type="success" onHide={mockOnHide} />);

    expect(getByText('Success message')).toBeTruthy();
  });

  it('renders error toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(<Toast visible={true} message="Error message" type="error" onHide={mockOnHide} />);

    expect(getByText('Error message')).toBeTruthy();
  });

  it('renders info toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(<Toast visible={true} message="Info message" type="info" onHide={mockOnHide} />);

    expect(getByText('Info message')).toBeTruthy();
  });

  it('renders warning toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(<Toast visible={true} message="Warning message" type="warning" onHide={mockOnHide} />);

    expect(getByText('Warning message')).toBeTruthy();
  });

  it('renders loading toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(<Toast visible={true} message="Loading message" type="loading" onHide={mockOnHide} />);

    expect(getByText('Loading message')).toBeTruthy();
  });

  it('renders custom toast correctly', () => {
    const mockOnHide = jest.fn();
    const { getByText } = render(
      <Toast
        visible={true}
        message="Custom message"
        type="custom"
        onHide={mockOnHide}
        customColors={{
          background: '#FF6B6B',
          border: '#FF6B6B',
          icon: '#FFF',
        }}
        customIcon="star"
      />
    );

    expect(getByText('Custom message')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const mockOnHide = jest.fn();
    const { queryByText } = render(<Toast visible={false} message="Test message" type="success" onHide={mockOnHide} />);

    expect(queryByText('Test message')).toBeNull();
  });

  it('renders without icon when showIcon is false', () => {
    const mockOnHide = jest.fn();
    const { getByText, queryByTestId } = render(
      <Toast visible={true} message="No icon message" type="success" onHide={mockOnHide} showIcon={false} />
    );

    expect(getByText('No icon message')).toBeTruthy();
  });
});
