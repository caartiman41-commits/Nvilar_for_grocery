import React, { useState, useEffect, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

export interface LiveBargainBannerProps {
  initialSeconds?: number;
}

export const LiveBargainBanner: React.FC<LiveBargainBannerProps> = memo(({
  initialSeconds = 1086, // ~18:06
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 1200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <Icon name="clock-time-four-outline" size={16} color={colors.terracotta} style={{ marginRight: 6 }} />
        <Text style={styles.label}>
          Limited Live Bargain Window: <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        </Text>
      </View>
      <View style={styles.rightTag}>
        <Text style={styles.openTagText}>Counter-Offers Open</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF4EB',
    borderWidth: 1,
    borderColor: '#E7DCce',
    borderRadius: 22,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#6F4E37',
    fontWeight: '600',
  },
  timer: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C3822',
  },
  rightTag: {
    paddingLeft: 8,
  },
  openTagText: {
    fontSize: 11,
    color: colors.verifiedGreen,
    fontWeight: '700',
  },
});
