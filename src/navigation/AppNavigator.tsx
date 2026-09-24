import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { SearchScreen } from '../features/search/SearchScreen';
import { AuthScreen } from '../features/auth/AuthScreen';
import { CheckoutScreen } from '../features/checkout/CheckoutScreen';
import { OrderSuccessScreen } from '../features/checkout/OrderSuccessScreen';
import { ProductDetailsScreen } from '../features/product/ProductDetailsScreen';
import { OrdersScreen } from '../features/orders/OrdersScreen';
import { SellerOnboardingScreen } from '../features/seller/SellerOnboardingScreen';
import { SellerStudioScreen } from '../features/seller/studio/SellerStudioScreen';
import { StudioChatTab } from '../features/seller/studio/tabs/StudioChatTab';
import { ChatsScreen } from '../features/chats/ChatsScreen';

import { useAuthStore } from '../features/auth/authStore';
import { navigationRef, NotificationService } from '../services/NotificationService';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => NotificationService.onNavigationReady()}
    >
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'MainTabs' : 'Auth'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 240,
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            animation: 'fade_from_bottom',
            animationDuration: 200,
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 220,
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 220,
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="SellerOnboarding"
          component={SellerOnboardingScreen}
          options={{
            animation: 'slide_from_bottom',
            animationDuration: 250,
          }}
        />
        <Stack.Screen
          name="SellerStudio"
          component={SellerStudioScreen}
          options={{
            animation: 'fade',
            animationDuration: 220,
          }}
        />
        <Stack.Screen
          name="ChatsScreen"
          component={ChatsScreen}
          options={{
            animation: 'slide_from_right',
            animationDuration: 220,
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen
          name="StudioChatTab"
          component={StudioChatTab}
          options={{
            animation: 'slide_from_right',
            animationDuration: 220,
            freezeOnBlur: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

