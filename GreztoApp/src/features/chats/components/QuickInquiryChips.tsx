import React, { memo } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const DEFAULT_INQUIRIES = [
  'Is this still available?',
  'Can you do a combo discount?',
  'Send real photos & fit check?',
  'Can you dispatch today?',
];

export interface QuickInquiryChipsProps {
  inquiries?: string[];
  onSelectInquiry: (inquiryText: string) => void;
}

export const QuickInquiryChips: React.FC<QuickInquiryChipsProps> = memo(({
  inquiries = DEFAULT_INQUIRIES,
  onSelectInquiry,
}) => {
  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {inquiries.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.chip}
            onPress={() => onSelectInquiry(item)}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    height: 44,
    minHeight: 44,
    maxHeight: 44,
    flexShrink: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 32,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    letterSpacing: -0.1,
  },
});
