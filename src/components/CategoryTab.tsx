import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface CategoryTabProps {
  label: string;
  icon: string;
  color?: string;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ label, icon, color = '#000', isActive, onPress }) => {
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 250 }),
      transform: [{ scaleX: withTiming(isActive ? 1 : 0.5, { duration: 250 }) }]
    };
  }, [isActive]);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isActive ? '#000000' : '#777777', { duration: 250 }),
    };
  }, [isActive]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Icon name={icon} size={20} color={color} />
      <Animated.Text style={[styles.label, animatedTextStyle, isActive && styles.activeLabel]}>{label}</Animated.Text>
      <Animated.View style={[styles.indicator, animatedIndicatorStyle, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#004236',
    borderRadius: 2,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: 'bold',
  },
});
