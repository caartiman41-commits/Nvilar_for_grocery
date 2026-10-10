import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeScreen } from '../features/home/HomeScreen';
import { ChatsScreen } from '../features/chats/ChatsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { CartScreen } from '../features/cart/CartScreen';
import { useCartStore } from '../features/cart/cartStore';

const Tab = createBottomTabNavigator();

// Clean Luxury Boutique Color Tokens
const TAB_THEME = {
  activeIcon: '#1E3A8A',       // Luxury Deep Royal Navy
  activeLabel: '#1E3A8A',      // Matching Bold Navy Label
  inactiveIcon: '#64748B',     // Clean High-Res Slate-500
  inactiveLabel: '#64748B',    // Clean High-Res Slate-500
  chatBadge: '#10B981',        // Vibrant Emerald Green
  bagBadge: '#E11D48',         // Boutique Rose Red
  barBg: '#FFFFFF',            // Crisp White Background
  barBorder: '#E2E8F0',        // Subtle Clean Top Border
};

interface TabConfig {
  label: string;
  activeIcon: string;
  inactiveIcon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  badgeCount?: number;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  ExploreTab: {
    label: 'Explore',
    activeIcon: 'compass',
    inactiveIcon: 'compass-outline',
    iconFamily: 'Ionicons',
  },
  BagTab: {
    label: 'Bag',
    activeIcon: 'bag-handle',
    inactiveIcon: 'bag-handle-outline',
    iconFamily: 'Ionicons',
  },
  ChatsTab: {
    label: 'Chats',
    activeIcon: 'chatbubbles',
    inactiveIcon: 'chatbubbles-outline',
    iconFamily: 'Ionicons',
    badgeCount: 2,
  },
  ProfileTab: {
    label: 'Profile',
    activeIcon: 'person-circle',
    inactiveIcon: 'person-circle-outline',
    iconFamily: 'Ionicons',
  },
};

// Memoized Individual Tab Item with strictly ZERO background shadow/pill
interface TabItemProps {
  routeKey: string;
  routeName: string;
  isFocused: boolean;
  onPress: (routeKey: string, routeName: string) => void;
  badgeNumber: number;
}

const BoutiqueTabItem = memo(({ routeKey, routeName, isFocused, onPress, badgeNumber }: TabItemProps) => {
  const config = TAB_CONFIGS[routeName] || {
    label: routeName,
    activeIcon: 'square',
    inactiveIcon: 'square-outline',
    iconFamily: 'Ionicons',
  };

  const IconComponent = config.iconFamily === 'MaterialCommunityIcons'
    ? MaterialCommunityIcons
    : Ionicons;

  const iconName = isFocused ? config.activeIcon : config.inactiveIcon;
  const iconColor = isFocused ? TAB_THEME.activeIcon : TAB_THEME.inactiveIcon;
  const isBagTab = routeName === 'BagTab';

  const handlePress = useCallback(() => {
    onPress(routeKey, routeName);
  }, [onPress, routeKey, routeName]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      {/* Strictly ZERO background / pill / elevation */}
      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <IconComponent
            name={iconName}
            size={24}
            color={iconColor}
          />

          {/* Live Notification / Cart Badge */}
          {badgeNumber > 0 && (
            <View style={[
              styles.badge,
              isBagTab ? styles.bagBadge : styles.chatBadge
            ]}>
              <Text style={styles.badgeText}>
                {badgeNumber > 99 ? '99+' : badgeNumber}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Label with High-Contrast Typography */}
      <Text
        style={[
          styles.tabLabel,
          isFocused ? styles.tabLabelActive : styles.tabLabelInactive
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </TouchableOpacity>
  );
});

// Custom Butter-Smooth Bottom Tab Bar
function CustomBoutiqueTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const cartItemCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 10 : 8);

  const handleTabPress = useCallback((routeKey: string, routeName: string) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  }, [navigation]);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomInset }]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isBagTab = route.name === 'BagTab';
          const isChatsTab = route.name === 'ChatsTab';

          let badgeNumber = 0;
          if (isBagTab) {
            badgeNumber = cartItemCount;
          } else if (isChatsTab) {
            badgeNumber = TAB_CONFIGS[route.name]?.badgeCount || 0;
          }

          return (
            <BoutiqueTabItem
              key={route.key}
              routeKey={route.key}
              routeName={route.name}
              isFocused={isFocused}
              badgeNumber={badgeNumber}
              onPress={handleTabPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBoutiqueTabBar {...props} />}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        freezeOnBlur: true,
      }}
    >
      <Tab.Screen name="ExploreTab" component={HomeScreen} />
      <Tab.Screen name="BagTab" component={CartScreen} />
      <Tab.Screen name="ChatsTab" component={ChatsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: TAB_THEME.barBg,
    borderTopWidth: 1,
    borderTopColor: TAB_THEME.barBorder,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: TAB_THEME.activeLabel,
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: TAB_THEME.inactiveLabel,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  chatBadge: {
    backgroundColor: TAB_THEME.chatBadge,
  },
  bagBadge: {
    backgroundColor: TAB_THEME.bagBadge,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
});
