import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppTabs from './AppTabs';
import AdminTabs from './AdminTabs';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, role, loading } = useAuth();

  // Handle navigation when auth state changes
  useEffect(() => {
    if (!loading && navigationRef.isReady()) {
      const timer = setTimeout(() => {
        if (navigationRef.isReady() && !isAuthenticated) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            })
          );
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return <SplashScreen />;
  }

  // Determine initial route and screens based on auth state
  const getInitialRouteName = () => {
    if (!isAuthenticated) return 'Auth';
    return role === 'admin' ? 'AdminApp' : 'App';
  };

  // Use key to force re-mount when auth state changes
  const navigatorKey = isAuthenticated ? (role === 'admin' ? 'admin' : 'user') : 'auth';

  return (
    <Stack.Navigator 
      key={navigatorKey}
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRouteName()}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="App" component={AppTabs} />
      <Stack.Screen name="AdminApp" component={AdminTabs} />
    </Stack.Navigator>
  );
};

export default RootNavigator;

