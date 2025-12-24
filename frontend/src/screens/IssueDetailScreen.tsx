import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import LoadingOverlay from '../components/LoadingOverlay';
import ErrorMessage from '../components/ErrorMessage';
import { colors, spacing } from '../utils/theme';

const STATUSES = ['open', 'in-progress', 'resolved'] as const;
const STATUS_LABELS: { [key: string]: string } = { 'open': 'Open', 'in-progress': 'In Progress', 'resolved': 'Resolved' };

// Issue type matching IssueContext
type Issue = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
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
  imageUrl?: string;
  adminRemarks?: string;
  // Support both naming conventions
  id?: string;
  created_at?: string;
  updated_at?: string;
  admin_remarks?: string;
};

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  IssueDetail: { issueId: string };
  [key: string]: any;
};

type IssueDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'IssueDetail'>;

const IssueDetailScreen: React.FC<IssueDetailScreenProps> = ({ route, navigation }) => {
  const { issueId } = route.params;
  const { fetchIssueById, updateIssueStatus, updateIssueRemarks, loading } = useIssues();
  const { role } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadIssue();
  }, [issueId]);

  useEffect(() => {
    if (issue) {
      // Normalize status to frontend format (open, in-progress, resolved)
      const normalizedStatus = normalizeStatus(issue.status || 'open');
      setSelectedStatus(normalizedStatus);
      setAdminRemarks(issue.adminRemarks || issue.admin_remarks || '');
      setIsAdmin(role === 'admin');
    }
  }, [issue, role]);

  const loadIssue = async () => {
    const result = await fetchIssueById(issueId);
    if (result.success && result.issue) {
      setIssue(result.issue);
    } else {
      const errorMsg = result.error || 'Failed to load issue';
      setError(errorMsg);
      Alert.alert('Error', errorMsg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleUpdate = async () => {
    if (!issue) return;
    
    let statusUpdated = false;
    let remarksUpdated = false;
    const errors: string[] = [];

    // Normalize current issue status for comparison
    const currentStatus = normalizeStatus(issue.status || 'open');
    const statusChanged = selectedStatus && selectedStatus !== currentStatus;
    const remarksChanged = adminRemarks !== (issue.adminRemarks || issue.admin_remarks || '');

    // Update status if changed
    if (statusChanged) {
      const result = await updateIssueStatus(issueId, selectedStatus);
      if (result.success && result.issue) {
        setIssue(result.issue);
        statusUpdated = true;
      } else {
        errors.push(result.error || 'Failed to update status');
      }
    }

    // Update remarks if changed (optional - can be empty)
    if (remarksChanged) {
      const result = await updateIssueRemarks(issueId, adminRemarks);
      if (result.success && result.issue) {
        setIssue(result.issue);
        remarksUpdated = true;
      } else {
        errors.push(result.error || 'Failed to update remarks');
      }
    }

    // Show appropriate success/error messages
    if (errors.length > 0) {
      setError(errors.join(', '));
    } else if (statusUpdated || remarksUpdated) {
      const messages: string[] = [];
      if (statusUpdated) messages.push('Status updated');
      if (remarksUpdated) messages.push('Remarks saved');
      Alert.alert('Success', messages.join(' and ') + ' successfully');
      // Reload issue to get updated data
      await loadIssue();
    } else {
      // No changes made
      Alert.alert('Info', 'No changes to save');
    }
  };

  // Normalize status from backend format to frontend format
  const normalizeStatus = (status: string): string => {
    if (!status) return 'open';
    const lower = status.toLowerCase();
    if (lower === 'open') return 'open';
    if (lower === 'in progress' || lower === 'in-progress') return 'in-progress';
    if (lower === 'resolved') return 'resolved';
    return 'open';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const formatted = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return String(formatted || 'Unknown');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (!issue) {
    return (
      <View style={styles.container}>
        <LoadingOverlay visible={true} />
      </View>
    );
  }

  // Handle image URL - Supabase returns full public URLs
  const getImageUrl = (): string | null => {
    if (!issue) return null;
    
    const imgUrl = issue.imageUrl;
    if (!imgUrl) return null;
    
    // Supabase public URLs are already full URLs
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    
    // If it's a relative path, prepend the API base URL
    if (imgUrl.startsWith('/')) {
      return `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${imgUrl}`;
    }
    
    return imgUrl;
  };

  const imageUrl = getImageUrl();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{String(issue.title || 'Untitled Issue')}</Text>
          <StatusBadge status={normalizeStatus(issue.status || 'open')} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>Category: {String(issue.category || 'Unknown')}</Text>
          <Text style={styles.metaText}>Created: {formatDate(issue.createdAt || issue.created_at)}</Text>
          {((issue.updatedAt || issue.updated_at) && (issue.updatedAt || issue.updated_at) !== (issue.createdAt || issue.created_at)) ? (
            <Text style={styles.metaText}>Updated: {formatDate(issue.updatedAt || issue.updated_at)}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{String(issue.description || 'No description provided.')}</Text>
        </View>

        {imageUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image</Text>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
          </View>
        ) : null}

        {issue.adminRemarks && issue.adminRemarks.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Remarks</Text>
            <Text style={styles.remarks}>{String(issue.adminRemarks)}</Text>
          </View>
        ) : null}

        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

            <View style={styles.statusUpdate}>
              <Text style={styles.label}>Update Status</Text>
              <View style={styles.statusButtons}>
                {STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      selectedStatus === status && styles.statusButtonActive,
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedStatus === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.remarksUpdate}>
              <Text style={styles.label}>Admin Remarks (Optional)</Text>
              <TextInput
                style={styles.remarksInput}
                value={adminRemarks}
                onChangeText={setAdminRemarks}
                placeholder="Add remarks or notes (optional)..."
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.mutedText}
              />
            </View>

            <PrimaryButton
              title="Save Changes"
              onPress={handleUpdate}
              loading={loading}
              style={styles.updateButton}
              disabled={
                selectedStatus === normalizeStatus(issue.status || 'open') && 
                adminRemarks === (issue.adminRemarks || issue.admin_remarks || '')
              }
            />
          </View>
        )}
        </View>
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: spacing.xxl * 2, // Extra padding for keyboard
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  meta: {
    marginBottom: spacing.lg,
  },
  metaText: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  remarks: {
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusUpdate: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.md,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  updateButton: {
    marginTop: spacing.sm,
  },
  remarksUpdate: {
    marginTop: spacing.md,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
});

export default IssueDetailScreen;

