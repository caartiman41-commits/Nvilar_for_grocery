import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export interface DealFilterOption {
  id: string;
  label: string;
}

const DEFAULT_FILTERS: DealFilterOption[] = [
  { id: 'all', label: 'All Deals' },
  { id: 'under_1999', label: 'Under ₹1,999' },
  { id: 'min_50', label: 'Min 50% Off' },
  { id: 'biggest_discount', label: 'Biggest Discount' },
];

export interface DealFilterPillsProps {
  activeFilterId: string;
  onSelectFilter: (id: string) => void;
  filters?: DealFilterOption[];
}

export const DealFilterPills: React.FC<DealFilterPillsProps> = memo(({
  activeFilterId,
  onSelectFilter,
  filters = DEFAULT_FILTERS,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilterId === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.pill, isActive ? styles.activePill : styles.inactivePill]}
              onPress={() => onSelectFilter(filter.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isActive ? styles.activePillText : styles.inactivePillText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: colors.burgundy,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inactivePill: {
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#E8DED2',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  inactivePillText: {
    color: colors.burgundy,
  },
});
