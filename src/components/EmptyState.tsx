import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  iconName: string;
  title: string;
  subtitle: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.graphicWrapper}>
        <View style={styles.sparkleTopLeft}>
           <Icon name="star-four-points" size={12} color="#6b7280" />
        </View>
        <View style={styles.sparkleTopRight}>
           <View style={styles.plusIcon}>
             <Icon name="plus" size={10} color="#004236" />
           </View>
        </View>
        <View style={styles.sparkleBottomRight}>
           <Icon name="star-four-points" size={16} color="#f5b041" />
        </View>
        
        <View style={styles.iconContainer}>
           <Icon 
             name={iconName === 'cart-outline' ? 'basket' : iconName} 
             size={50} 
             color="#a04000" 
           />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {buttonTitle && onButtonPress && (
        <TouchableOpacity style={styles.premiumButton} onPress={onButtonPress} activeOpacity={0.8}>
          <Text style={styles.btnText}>
            <Text style={{ color: '#ff6b6b' }}>EXPLORE </Text>
            <Text style={{ color: '#ffd93d' }}>FRESH </Text>
            <Text style={{ color: '#6bcb77' }}>MARKET</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fffcf7', // matching screenshot creamy bg
  },
  graphicWrapper: {
    width: 120,
    height: 120,
    borderRadius: 35,
    backgroundColor: '#f1f8ec', // matching pastel green background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#d8f3e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 25,
  },
  iconContainer: {
    shadowColor: '#a04000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    color: '#1a2b4c',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: 'sans-serif',
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  premiumButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  btnText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
