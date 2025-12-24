import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssues } from '../context/IssueContext';
import IssueCard from '../components/IssueCard';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors, spacing, gradients, borderRadius, shadows, typography } from '../utils/theme';

type AdminDashboardStackParamList = {
  AdminDashboard: undefined;
  IssueDetail: { issueId: string };
};

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<AdminDashboardStackParamList, 'AdminDashboard'>;
};

const AdminDashboardScreen = ({ navigation }: AdminDashboardScreenProps) => {
  const { allIssues, loading, fetchAllIssues } = useIssues();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchAllIssues();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllIssues();
    setRefreshing(false);
  };

  const getStatusCounts = () => {
    const counts = { open: 0, 'in-progress': 0, resolved: 0 };
    allIssues.forEach((issue) => {
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
  const openIssues = allIssues.filter((issue) => {
    const status = issue.status?.toLowerCase();
    return status === 'open';
  }).slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.8}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>{statusCounts.open}</Text>
              <Text style={styles.statLabel}>Open</Text>
              <View style={styles.statIcon}>
                <MaterialIcons name="assignment" size={36} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.8}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>{statusCounts['in-progress']}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
              <View style={styles.statIcon}>
                <MaterialIcons name="build" size={36} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.8}>
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>{statusCounts.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
              <View style={styles.statIcon}>
                <MaterialIcons name="check-circle" size={36} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.statCardWrapper} activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.primary as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statNumber}>{allIssues.length}</Text>
              <Text style={styles.statLabel}>Total Issues</Text>
              <View style={styles.statIcon}>
                <MaterialIcons name="assessment" size={36} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Open Issues</Text>
            <TouchableOpacity 
              onPress={() => {
                // Navigate to the AdminIssues tab
                navigation.getParent()?.navigate('AdminIssuesTab');
              }}
              style={styles.viewAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {openIssues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No open issues</Text>
            </View>
          ) : (
            openIssues.map((issue) => (
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
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  statCardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  statCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'flex-start',
    minHeight: 120,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    ...shadows.medium,
  },
  statIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    opacity: 0.25,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.semibold,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedText,
  },
});

export default AdminDashboardScreen;

