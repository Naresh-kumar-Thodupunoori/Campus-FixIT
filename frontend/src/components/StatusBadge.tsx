import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../utils/theme';

interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'resolved' | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return {
          backgroundColor: colors.statusOpen,
          text: 'Open',
          textColor: colors.statusOpenText,
        };
      case 'in-progress':
        return {
          backgroundColor: colors.statusInProgress,
          text: 'In Progress',
          textColor: colors.statusInProgressText,
        };
      case 'resolved':
        return {
          backgroundColor: colors.statusResolved,
          text: 'Resolved',
          textColor: colors.statusResolvedText,
        };
      default:
        return {
          backgroundColor: colors.mutedText,
          text: status,
          textColor: colors.text,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: config.textColor }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    // Platform-specific shadow styles
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }
      : Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }
      : {
          elevation: 4,
        }),
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default StatusBadge;

