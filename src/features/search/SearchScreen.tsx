import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/AppHeader';

export const SearchScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title="SEARCH"
      />
      
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput 
          style={styles.input}
          placeholder="Search 'Fish', 'Eggs' or 'Meat'"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    fontSize: typography.size.md,
  },
});
