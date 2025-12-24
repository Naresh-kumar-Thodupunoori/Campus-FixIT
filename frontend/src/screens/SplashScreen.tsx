import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../utils/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus FixIt</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.lg,
  },
});

export default SplashScreen;

