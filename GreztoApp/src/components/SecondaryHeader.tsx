import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

interface SecondaryHeaderProps {
  topTitle: string;
  bottomTitle: string;
  bottomTitleColor?: string;
}

export const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({ topTitle, bottomTitle, bottomTitleColor }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.profileAvatar}>
          <Icon name="account-outline" size={24} color="#004236" />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.topTitle}>{topTitle}</Text>
          <Text style={[styles.bottomTitle, bottomTitleColor ? { color: bottomTitleColor } : null]}>{bottomTitle}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.langButton}>
          <Icon name="web" size={16} color="#000" />
          <Text style={styles.langText}>EN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bellButton}>
          <Icon name="bell-outline" size={24} color="#000" />
          <View style={styles.redDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f7ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ccebe0',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  bottomTitle: {
    fontSize: 14,
    color: '#000',
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 12,
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#000',
  },
  bellButton: {
    position: 'relative',
    padding: 4,
  },
  redDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
