import { Platform } from 'react-native';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    serif: Platform.select({ ios: 'Georgia', android: 'serif' }) || 'serif',
    serifBold: Platform.select({ ios: 'Georgia-Bold', android: 'serif' }) || 'serif',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};
