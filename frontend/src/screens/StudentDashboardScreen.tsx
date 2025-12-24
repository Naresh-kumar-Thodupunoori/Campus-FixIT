import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssues } from '../context/IssueContext';
import IssueCard from '../components/IssueCard';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors, spacing, shadows, borderRadius } from '../utils/theme';

type DashboardStackParamList = {
  Dashboard: undefined;
  IssueDetail: { issueId: string };
};

type StudentDashboardScreenProps = {
  navigation: NativeStackNavigationProp<DashboardStackParamList, 'Dashboard'>;
};

const StudentDashboardScreen = ({ navigation }: StudentDashboardScreenProps) => {
  const { myIssues, loading, fetchMyIssues } = useIssues();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyIssues();
    setRefreshing(false);
  };

  const getStatusCounts = () => {
    const counts = { open: 0, 'in-progress': 0, resolved: 0 };
    myIssues.forEach((issue) => {
      const status = issue.status?.toLowerCase();
      if (status === 'open') {
        counts.open++;
      } else if (status === 'in-progress' || status === 'in progress') {
        counts['in-progress']++;
      } else if (status === 'resolved') {
        counts.resolved++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const recentIssues = myIssues.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.title}>Your Dashboard</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardOpen]}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="assignment" size={28} color={colors.statusOpen} />
            </View>
            <Text style={styles.statNumber}>{statusCounts.open}</Text>
            <Text style={styles.statLabel}>Open Issues</Text>
          </View>
          <View style={[styles.statCard, styles.statCardProgress]}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="build" size={28} color={colors.statusInProgress} />
            </View>
            <Text style={styles.statNumber}>{statusCounts['in-progress']}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, styles.statCardResolved]}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="check-circle" size={28} color={colors.statusResolved} />
            </View>
            <Text style={styles.statNumber}>{statusCounts.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Issues</Text>
          {recentIssues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No issues yet</Text>
              <Text style={styles.emptySubtext}>Create your first issue to get started</Text>
            </View>
          ) : (
            recentIssues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                onPress={() => navigation.navigate('IssueDetail', { issueId: issue._id })}
              />
            ))
          )}
        </View>
      </ScrollView>
      <LoadingOverlay visible={loading && !refreshing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: shadows.medium.shadowColor,
    shadowOffset: shadows.medium.shadowOffset,
    shadowOpacity: shadows.medium.shadowOpacity,
    shadowRadius: shadows.medium.shadowRadius,
    elevation: shadows.medium.elevation,
  },
  statCardOpen: {
    borderLeftWidth: 3,
    borderLeftColor: colors.statusOpen,
  },
  statCardProgress: {
    borderLeftWidth: 3,
    borderLeftColor: colors.statusInProgress,
  },
  statCardResolved: {
    borderLeftWidth: 3,
    borderLeftColor: colors.statusResolved,
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    shadowColor: shadows.small.shadowColor,
    shadowOffset: shadows.small.shadowOffset,
    shadowOpacity: shadows.small.shadowOpacity,
    shadowRadius: shadows.small.shadowRadius,
    elevation: shadows.small.elevation,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
  },
});

export default StudentDashboardScreen;

