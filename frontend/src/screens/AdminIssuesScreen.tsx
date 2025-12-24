import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIssues } from '../context/IssueContext';
import IssueCard from '../components/IssueCard';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors, spacing } from '../utils/theme';

const CATEGORIES = ['', 'Electrical', 'Water', 'Internet', 'Infrastructure'];
const STATUSES = ['', 'open', 'in-progress', 'resolved'] as const;
const STATUS_LABELS: { [key: string]: string } = { '': 'All', 'open': 'Open', 'in-progress': 'In Progress', 'resolved': 'Resolved' };

type AdminIssuesStackParamList = {
  AdminIssues: undefined;
  IssueDetail: { issueId: string };
};

type AdminIssuesScreenProps = {
  navigation: NativeStackNavigationProp<AdminIssuesStackParamList, 'AdminIssues'>;
};

const AdminIssuesScreen = ({ navigation }: AdminIssuesScreenProps) => {
  const { allIssues, loading, filters, setFilters, fetchAllIssues } = useIssues();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllIssues(filters.status, filters.category);
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllIssues(filters.status, filters.category);
    setRefreshing(false);
  };

  const handleFilterChange = (type: 'status' | 'category', value: string) => {
    setFilters({ ...filters, [type]: value });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>All Issues</Text>
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Category</Text>
          <View style={styles.filterButtons}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat || 'all'}
                style={[
                  styles.filterButton,
                  filters.category === cat && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange('category', cat)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.category === cat && styles.filterButtonTextActive,
                  ]}
                >
                  {cat || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterButtons}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status || 'all'}
                style={[
                  styles.filterButton,
                  filters.status === status && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange('status', status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.status === status && styles.filterButtonTextActive,
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allIssues}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issueId: item._id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No issues found</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <LoadingOverlay visible={loading && !refreshing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  filtersContainer: {
    backgroundColor: colors.card,
    marginHorizontal: -spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
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

export default AdminIssuesScreen;

