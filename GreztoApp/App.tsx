import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, Platform, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Disable intrusive debug warning popups on device
LogBox.ignoreAllLogs(true);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { MitrenoToastContainer } from './src/components/MitrenoToast';
import { MitrenoBootSplash } from './src/components/MitrenoBootSplash';
import { NotificationService } from './src/services/NotificationService';

const App = () => {
  const [showBootSplash, setShowBootSplash] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      (StatusBar as any).setTranslucent?.(true);
      (StatusBar as any).setBackgroundColor?.('transparent');
    }

    // Initialize notification channels, Firebase listeners, and foreground alerts
    const unsubscribeNotifications = NotificationService.initialize();

    return () => {
      unsubscribeNotifications?.();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar 
          barStyle="dark-content" 
        />
        <View style={styles.container}>
          <AppNavigator />
        </View>
        {showBootSplash && (
          <MitrenoBootSplash onAnimationComplete={() => setShowBootSplash(false)} />
        )}
        <MitrenoToastContainer />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.warmBackground,
  },
  container: {
    flex: 1,
    backgroundColor: colors.warmBackground,
  },
});

export default App;
