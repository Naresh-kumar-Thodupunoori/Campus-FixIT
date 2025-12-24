import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
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
  imageUrl?: string;
  adminRemarks?: string;
}

interface IssueFilters {
  status: string;
  category: string;
}

interface IssueContextType {
  myIssues: Issue[];
  allIssues: Issue[];
  loading: boolean;
  error: string | null;
  filters: IssueFilters;
  fetchMyIssues: (filterStatus?: string, filterCategory?: string) => Promise<{ success: boolean; error?: string }>;
  fetchAllIssues: (filterStatus?: string, filterCategory?: string) => Promise<{ success: boolean; error?: string }>;
  fetchIssueById: (issueId: string) => Promise<{ success: boolean; issue?: Issue; error?: string }>;
  createIssue: (issueData: { title: string; description: string; category: string }, imageUri?: string | null) => Promise<{ success: boolean; issue?: Issue; error?: string }>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<{ success: boolean; error?: string }>;
  updateIssueStatus: (issueId: string, status: string) => Promise<{ success: boolean; issue?: Issue; error?: string }>;
  updateIssueRemarks: (issueId: string, adminRemarks: string) => Promise<{ success: boolean; issue?: Issue; error?: string }>;
  deleteIssue: (id: string) => Promise<{ success: boolean; error?: string }>;
  setFilters: (filters: IssueFilters) => void;
  clearError: () => void;
  refreshIssue?: (issueId: string) => Promise<{ success: boolean; issue?: Issue; error?: string }>;
  updateLocalIssue?: (updatedIssue: any) => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within IssueProvider');
  }
  return context;
};

interface IssueProviderProps {
  children: ReactNode;
}

export const IssueProvider: React.FC<IssueProviderProps> = ({ children }) => {
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IssueFilters>({ status: '', category: '' });
  
  // Get role from auth context (IssueProvider is inside AuthProvider, so this is safe)
  const authContext = useAuth();
  const role = authContext?.role || null;
  const token = authContext?.token || null;

  // Convert frontend status to backend format
  const convertStatusToBackend = (status: string): string => {
    if (!status) return 'Open';
    const lower = status.toLowerCase();
    if (lower === 'open') return 'Open';
    if (lower === 'in-progress' || lower === 'in progress') return 'In Progress';
    if (lower === 'resolved') return 'Resolved';
    return 'Open';
  };

  // Convert backend status to frontend format
  const convertStatusFromBackend = (status: string): 'open' | 'in-progress' | 'resolved' => {
    if (!status) return 'open';
    const lower = status.toLowerCase();
    if (lower === 'open') return 'open';
    if (lower === 'in progress' || lower === 'in-progress') return 'in-progress';
    if (lower === 'resolved') return 'resolved';
    return 'open';
  };

  // Normalize API response to match frontend expectations
  const normalizeIssue = (issue: any): Issue => {
    // Normalize status: "Open" -> "open", "In Progress" -> "in-progress", "Resolved" -> "resolved"
    const normalizeStatus = convertStatusFromBackend;

    // Normalize createdBy structure
    const normalizeCreatedBy = (createdBy: any) => {
      if (!createdBy) return undefined;
      // If it's already an object with name/email, return it with _id
      if (typeof createdBy === 'object' && createdBy.name) {
        return {
          _id: createdBy.id || createdBy._id || '',
          name: createdBy.name || '',
          email: createdBy.email || '',
        };
      }
      // If it's just an ID, return undefined (will be handled by fallback in UI)
      return undefined;
    };

    return {
      _id: issue.id || issue._id || '',
      title: issue.title || '',
      description: issue.description || '',
      category: issue.category || '',
      status: normalizeStatus(issue.status),
      createdAt: issue.created_at || issue.createdAt || new Date().toISOString(),
      updatedAt: issue.updated_at || issue.updatedAt || new Date().toISOString(),
      createdBy: normalizeCreatedBy(issue.createdBy),
      assignedTo: issue.assignedTo ? normalizeCreatedBy(issue.assignedTo) : undefined,
      imageUrl: issue.imageUrl || issue.image_url,
      adminRemarks: issue.adminRemarks || issue.admin_remarks || '',
    };
  };

  const fetchMyIssues = async (filterStatus = '', filterCategory = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { status?: string; category?: string } = {};
      if (filterStatus) params.status = convertStatusToBackend(filterStatus);
      if (filterCategory) params.category = filterCategory;
      
      const response = await api.get('/issues/my', { params });
      const normalizedIssues = (response.data || []).map(normalizeIssue);
      setMyIssues(normalizedIssues);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch issues';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIssues = async (filterStatus = '', filterCategory = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { status?: string; category?: string } = {};
      if (filterStatus) params.status = convertStatusToBackend(filterStatus);
      if (filterCategory) params.category = filterCategory;
      
      const response = await api.get('/issues', { params });
      const normalizedIssues = (response.data || []).map(normalizeIssue);
      setAllIssues(normalizedIssues);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch issues';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueById = async (issueId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/issues/${issueId}`);
      return { success: true, issue: normalizeIssue(response.data) };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch issue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData: { title: string; description: string; category: string }, imageUri: string | null = null) => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const url = `${API_BASE_URL}/api/issues`;

      const formData = new FormData();
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);

      if (imageUri) {
        // Handle blob URIs (web) vs file URIs (native)
        if (imageUri.startsWith('blob:')) {
          // For web blob URIs, fetch and convert to blob
          try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const filename = `image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
            formData.append('image', blob, filename);
          } catch (err) {
            console.error('Error converting blob to file:', err);
            // Fallback: try to append as-is
            formData.append('image', {
              uri: imageUri,
              name: `image-${Date.now()}.jpg`,
              type: 'image/jpeg',
            } as any);
          }
        } else {
          // For React Native file URIs
          const filename = imageUri.split('/').pop() || `image-${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('image', {
            uri: imageUri,
            name: filename,
            type: type,
          } as any);
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create issue');
      }

      const normalizedIssue = normalizeIssue(responseData);
      setMyIssues(prev => [normalizedIssue, ...prev]);

      // Refresh my issues
      await fetchMyIssues(filters.status, filters.category);

      return { success: true, issue: normalizedIssue };
    } catch (err: any) {
      console.error('Create issue error:', err);
      const errorMessage = err.message || 'Failed to create issue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert frontend status format to backend format
      const backendStatus = convertStatusToBackend(status);
      const response = await api.put(`/issues/${issueId}/status`, { status: backendStatus });
      
      const normalizedIssue = normalizeIssue(response.data);
      
      // Update local state
      if (role === 'admin') {
        setAllIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? normalizedIssue : issue
          )
        );
      } else {
        setMyIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? normalizedIssue : issue
          )
        );
      }

      return { success: true, issue: normalizedIssue };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateIssueRemarks = async (issueId: string, adminRemarks: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/issues/${issueId}/remarks`, { adminRemarks });
      
      const normalizedIssue = normalizeIssue(response.data);
      
      // Update local state
      if (role === 'admin') {
        setAllIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? normalizedIssue : issue
          )
        );
      } else {
        setMyIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? normalizedIssue : issue
          )
        );
      }

      return { success: true, issue: normalizedIssue };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update remarks';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshIssue = async (issueId: string) => {
    return await fetchIssueById(issueId);
  };

  const updateLocalIssue = (updatedIssue: any) => {
    const normalizedIssue = normalizeIssue(updatedIssue);
    if (role === 'admin') {
      setAllIssues((prev) =>
        prev.map((issue) => (issue._id === normalizedIssue._id ? normalizedIssue : issue))
      );
    } else {
      setMyIssues((prev) =>
        prev.map((issue) => (issue._id === normalizedIssue._id ? normalizedIssue : issue))
      );
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/issues/${id}`, updates);
      const normalizedIssue = normalizeIssue(response.data);
      
      // Update local state
      if (role === 'admin') {
        setAllIssues((prev) =>
          prev.map((issue) => (issue._id === id ? normalizedIssue : issue))
        );
      } else {
        setMyIssues((prev) =>
          prev.map((issue) => (issue._id === id ? normalizedIssue : issue))
        );
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update issue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/issues/${id}`);
      
      // Update local state
      if (role === 'admin') {
        setAllIssues((prev) => prev.filter((issue) => issue._id !== id));
      } else {
        setMyIssues((prev) => prev.filter((issue) => issue._id !== id));
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete issue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    myIssues,
    allIssues,
    loading,
    error,
    filters,
    setFilters,
    fetchMyIssues,
    fetchAllIssues,
    fetchIssueById,
    createIssue,
    updateIssue,
    updateIssueStatus,
    updateIssueRemarks,
    deleteIssue,
    refreshIssue,
    updateLocalIssue,
    clearError,
  };

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
};

