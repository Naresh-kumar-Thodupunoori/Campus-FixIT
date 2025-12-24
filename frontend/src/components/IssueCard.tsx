import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StatusBadge from './StatusBadge';
import { colors, spacing, borderRadius, typography, gradients } from '../utils/theme';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category?: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface IssueCardProps {
  issue: Issue;
  onPress: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getCategoryLabel = (category: string | undefined): string => {
    return category || 'Uncategorized';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.statusOpen;
      case 'in-progress':
        return colors.statusInProgress;
      case 'resolved':
        return colors.statusResolved;
      default:
        return colors.primary;
    }
  };

  const getGradientColors = (status: string): [string, string, ...string[]] => {
    switch (status) {
      case 'open':
        return [colors.statusOpen, colors.statusOpenLight];
      case 'in-progress':
        return [colors.statusInProgress, colors.statusInProgressLight];
      case 'resolved':
        return [colors.statusResolved, colors.statusResolvedLight];
      default:
        return gradients.primary as [string, string, ...string[]];
    }
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={getGradientColors(issue.status)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <View style={[styles.card, { borderLeftColor: getStatusColor(issue.status) }]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {issue.title}
            </Text>
            <StatusBadge status={issue.status} />
          </View>

          <Text style={styles.category}>{getCategoryLabel(issue.category)}</Text>

          <Text style={styles.description} numberOfLines={3}>
            {issue.description}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.date}>{formatDate(issue.createdAt)}</Text>
            <Text style={styles.author}>
              by {issue.createdBy?.name || issue.createdBy?.email || 'Unknown'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: borderRadius.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    // Platform-specific shadow styles
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 8px rgba(99, 102, 241, 0.15)',
        }
      : Platform.OS === 'ios'
      ? {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }
      : {
          elevation: 8,
        }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
    lineHeight: 24,
  },
  category: {
    fontSize: typography.fontSize.xs,
    color: colors.categoryText,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedText,
    fontWeight: typography.fontWeight.medium,
  },
  author: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.normal,
  },
});

export default IssueCard;

