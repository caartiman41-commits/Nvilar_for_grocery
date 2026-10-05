import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSellerStore } from '../sellerStore';
import { useAuthStore } from '../../auth/authStore';

// Lazy-loaded or memoized tabs
import { StudioDashboardTab } from './tabs/StudioDashboardTab';
import { StudioOrdersTab } from './tabs/StudioOrdersTab';
import { StudioCatalogTab } from './tabs/StudioCatalogTab';
import { StudioChatTab } from './tabs/StudioChatTab';
import { StudioProfileTab } from './tabs/StudioProfileTab';

export type StudioTabKey = 'studio' | 'orders' | 'catalog' | 'chat' | 'profile';

export const SellerStudioScreen: React.FC = memo(() => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<StudioTabKey>('studio');

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      navigation.replace('Auth');
    }
  }, [isAuthenticated, user, navigation]);

  const orders = useSellerStore((s) => s.orders);
  const products = useSellerStore((s) => s.products);
  const conversations = useSellerStore((s) => s.conversations);
  const exitStudioMode = useSellerStore((s) => s.exitStudioMode);
  const fetchSellerStudioDataFromBackend = useSellerStore((s) => s.fetchSellerStudioDataFromBackend);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchSellerStudioDataFromBackend();
    }
  }, [isAuthenticated, user, fetchSellerStudioDataFromBackend]);

  if (!isAuthenticated || !user) {
    return null;
  }

  React.useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    } else if (route.params?.conversation_id || route.params?.conversationId) {
      setActiveTab('chat');
    }
  }, [route.params]);

  const handleSwitchToBuyerApp = useCallback(() => {
    exitStudioMode();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [exitStudioMode, navigation]);

  const handleNavigateToOrders = useCallback(() => {
    setActiveTab('orders');
  }, []);

  const handleNavigateToCatalog = useCallback(() => {
    setActiveTab('catalog');
  }, []);

  const handleNavigateToChat = useCallback(() => {
    setActiveTab('chat');
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    setActiveTab('profile');
  }, []);

  // Compute live badges
  const pendingOrdersCount = orders.filter((o) => o.status === 'new').length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <View style={styles.container}>
      {/* Active Tab Screen Content */}
      <View style={styles.tabContentArea}>
        {activeTab === 'studio' && (
          <StudioDashboardTab
            onSwitchToBuyerApp={handleSwitchToBuyerApp}
            onOpenOrders={handleNavigateToOrders}
            onOpenCatalog={handleNavigateToCatalog}
            onOpenChat={handleNavigateToChat}
            onOpenProfile={handleNavigateToProfile}
          />
        )}
        {activeTab === 'orders' && (
          <StudioOrdersTab />
        )}
        {activeTab === 'catalog' && (
          <StudioCatalogTab />
        )}
        {activeTab === 'chat' && (
          <StudioChatTab
            initialConversationId={route?.params?.conversation_id || route?.params?.conversationId}
          />
        )}
        {activeTab === 'profile' && (
          <StudioProfileTab
            onSwitchToBuyerApp={handleSwitchToBuyerApp}
          />
        )}
      </View>

      {/* Seller Studio 5-Item Bottom Navigation Bar */}
      <View style={[styles.bottomNavBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {/* Tab 1: Studio */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('studio')}
          activeOpacity={0.7}
        >
          <Icon
            name={activeTab === 'studio' ? 'view-dashboard' : 'view-dashboard-outline'}
            size={23}
            color={activeTab === 'studio' ? '#EA580C' : '#64748B'}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'studio' && styles.navItemTextActive,
            ]}
          >
            Studio
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Orders */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Icon
              name={activeTab === 'orders' ? 'package-variant-closed' : 'package-variant-closed'}
              size={23}
              color={activeTab === 'orders' ? '#EA580C' : '#64748B'}
            />
            {pendingOrdersCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pendingOrdersCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navItemText,
              activeTab === 'orders' && styles.navItemTextActive,
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Catalog */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('catalog')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Icon
              name={activeTab === 'catalog' ? 'tshirt-crew' : 'tshirt-crew-outline'}
              size={23}
              color={activeTab === 'catalog' ? '#EA580C' : '#64748B'}
            />
            <View style={[styles.tabBadge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.tabBadgeText, { color: '#64748B' }]}>{products.length}</Text>
            </View>
          </View>
          <Text
            style={[
              styles.navItemText,
              activeTab === 'catalog' && styles.navItemTextActive,
            ]}
          >
            Catalog
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Chat */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('chat')}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrap}>
            <Icon
              name={activeTab === 'chat' ? 'chat-processing' : 'chat-processing-outline'}
              size={23}
              color={activeTab === 'chat' ? '#EA580C' : '#64748B'}
            />
            {unreadMessagesCount > 0 && (
              <View style={styles.tabDotBadge} />
            )}
          </View>
          <Text
            style={[
              styles.navItemText,
              activeTab === 'chat' && styles.navItemTextActive,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Icon
            name={activeTab === 'profile' ? 'store' : 'store-outline'}
            size={23}
            color={activeTab === 'profile' ? '#EA580C' : '#64748B'}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'profile' && styles.navItemTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContentArea: {
    flex: 1,
  },
  bottomNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  navItemTextActive: {
    color: '#EA580C',
    fontWeight: '900',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tabDotBadge: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
});
