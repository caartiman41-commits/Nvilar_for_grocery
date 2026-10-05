import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ChipProps {
  label: string;
  variant?: 'bordered' | 'filled';
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, variant = 'bordered', onPress }) => {
  const isFilled = variant === 'filled';
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={!onPress}
      style={[
        styles.container, 
        isFilled ? styles.filledContainer : styles.borderedContainer
      ]}
    >
      <Text style={[styles.label, isFilled && styles.filledLabel]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  borderedContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filledContainer: {
    backgroundColor: '#E8F5E9', 
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  filledLabel: {
    color: colors.activeGreen,
  },
});
