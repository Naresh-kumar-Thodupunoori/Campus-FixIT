import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminIssuesScreen from '../screens/AdminIssuesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import { colors } from '../utils/theme';

type AdminDashboardStackParamList = {
  AdminDashboard: undefined;
  IssueDetail: { issueId: string };
};

type AdminIssuesStackParamList = {
  AdminIssues: undefined;
  IssueDetail: { issueId: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AdminDashboardStackParamList & AdminIssuesStackParamList>();

const AdminDashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen as React.ComponentType<any>}
        options={{ title: 'Issue Details' }}
      />
    </Stack.Navigator>
  );
};

const AdminIssuesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminIssues"
        component={AdminIssuesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen as React.ComponentType<any>}
        options={{ title: 'Issue Details' }}
      />
    </Stack.Navigator>
  );
};

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminDashboardTab"
        component={AdminDashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminIssuesTab"
        component={AdminIssuesStack}
        options={{
          tabBarLabel: 'All Issues',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size || 24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;

