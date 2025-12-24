import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { useIssues } from '../context/IssueContext';
import TextInputField from '../components/TextInputField';
import PrimaryButton from '../components/PrimaryButton';
import ErrorMessage from '../components/ErrorMessage';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors, spacing, shadows, borderRadius } from '../utils/theme';

const CATEGORIES = ['Electrical', 'Water', 'Internet', 'Infrastructure'];

type TabParamList = {
  CreateIssueTab: undefined;
  [key: string]: any;
};

interface CreateIssueScreenProps {
  navigation: BottomTabNavigationProp<TabParamList, 'CreateIssueTab'>;
}

// Platform-specific shadow styles
const getShadowStyles = () => ({
  small: Platform.OS === 'web'
    ? {
        boxShadow: `0 ${shadows.small.shadowOffset.height}px ${shadows.small.shadowRadius}px rgba(0, 0, 0, ${shadows.small.shadowOpacity})`,
      }
    : Platform.OS === 'ios'
    ? {
        shadowColor: shadows.small.shadowColor,
        shadowOffset: shadows.small.shadowOffset,
        shadowOpacity: shadows.small.shadowOpacity,
        shadowRadius: shadows.small.shadowRadius,
      }
    : {
        elevation: shadows.small.elevation,
      },
  medium: Platform.OS === 'web'
    ? {
        boxShadow: `0 ${shadows.medium.shadowOffset.height}px ${shadows.medium.shadowRadius}px rgba(0, 0, 0, ${shadows.medium.shadowOpacity})`,
      }
    : Platform.OS === 'ios'
    ? {
        shadowColor: shadows.medium.shadowColor,
        shadowOffset: shadows.medium.shadowOffset,
        shadowOpacity: shadows.medium.shadowOpacity,
        shadowRadius: shadows.medium.shadowRadius,
      }
    : {
        elevation: shadows.medium.elevation,
      },
});

const CreateIssueScreen: React.FC<CreateIssueScreenProps> = ({ navigation }) => {
  const { createIssue, loading } = useIssues();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false, // Allow full image without cropping
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets[0] && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!category) {
      setError('Please select a category');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImageUri(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    const result = await createIssue(
      { title: title.trim(), description: description.trim(), category },
      imageUri
    );

    if (result.success) {
      // Reset form before showing success message
      resetForm();
      Alert.alert('Success', 'Issue created successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } else {
      setError(result.error || 'An error occurred while creating the issue');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Issue</Text>
        </View>
        {error ? (
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        ) : null}
        <TextInputField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter issue title"
        />
        <TextInputField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail"
          multiline
          numberOfLines={4}
        />
        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Image (Optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.image} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            </TouchableOpacity>
          )}
        </View>
        <PrimaryButton title="Create Issue" onPress={handleSubmit} loading={loading} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
    </KeyboardAvoidingView>
  );
};

const shadowStyles = getShadowStyles();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  categoryContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: spacing.xs,
    ...shadowStyles.small,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadowStyles.small,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadowStyles.small,
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadowStyles.medium,
  },
  image: {
    width: '100%',
    height: 220,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadowStyles.medium,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CreateIssueScreen;