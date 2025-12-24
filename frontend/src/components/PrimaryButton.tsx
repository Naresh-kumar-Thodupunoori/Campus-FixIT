import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows, borderRadius, typography, gradients, animations } from '../utils/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary',
  size = 'medium'
}) => {
  const getGradientColors = (): [string, string, ...string[]] => {
    switch (variant) {
      case 'secondary':
        return gradients.secondary as [string, string, ...string[]];
      case 'outline':
        return [colors.surface, colors.surface];
      default:
        return gradients.primary as [string, string, ...string[]];
    }
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);
    if (disabled) baseStyle.push(styles.buttonDisabled);
    if (variant === 'outline') baseStyle.push(styles.buttonOutline);
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : "#fff"} size="small" />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === 'outline' && styles.buttonTextOutline,
          size === 'small' && styles.buttonTextSmall,
          size === 'large' && styles.buttonTextLarge
        ]}>
          {title}
        </Text>
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.contentWrapper}>
          <ButtonContent />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 9999, // Fully rounded pill shape
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    overflow: 'hidden',
    borderWidth: 0,
    paddingHorizontal: spacing.xl + spacing.md, // More horizontal padding for pill shape
  },
  buttonSmall: {
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 9999,
  },
  buttonLarge: {
    minHeight: 68,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 9999,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonOutline: {
    borderWidth: 2.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 6,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md + 1,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  buttonTextOutline: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  buttonTextSmall: {
    fontSize: typography.fontSize.sm,
    letterSpacing: 0.8,
  },
  buttonTextLarge: {
    fontSize: typography.fontSize.lg + 2,
    letterSpacing: 1.2,
  },
});

export default PrimaryButton;

