import React, { memo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface PriceHistoryButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const PriceHistoryButton: React.FC<PriceHistoryButtonProps> = memo(({
  onPress,
  style,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      speed: 25,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.shadowContainer,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="7-Day Price History & Trend"
        testID={testID}
        style={styles.buttonBody}
      >
        {/* Left: Trend chart icon */}
        <Icon
          name="chart-line"
          size={16}
          color="#059669"
          style={styles.icon}
        />

        {/* Center: Title text */}
        <Text style={styles.title}>7-Day Price History & Trend</Text>

        {/* Right: Glowing emerald dot */}
        <View style={styles.emeraldDot} />
      </TouchableOpacity>
    </Animated.View>
  );
});

PriceHistoryButton.displayName = 'PriceHistoryButton';

export default PriceHistoryButton;

const styles = StyleSheet.create({
  shadowContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  emeraldDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginLeft: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
});
