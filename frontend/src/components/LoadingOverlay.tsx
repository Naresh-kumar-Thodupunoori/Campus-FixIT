import React from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { colors, borderRadius } from '../utils/theme';

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 32,
    // Platform-specific shadow styles
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
        }
      : Platform.OS === 'ios'
      ? {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        }
      : {
          elevation: 16,
        }),
  },
});

export default LoadingOverlay;

