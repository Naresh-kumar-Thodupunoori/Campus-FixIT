import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import MyIssuesScreen from '../screens/MyIssuesScreen';
import CreateIssueScreen from '../screens/CreateIssueScreen';
import ProfileScreen from '../screens/ProfileScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import { colors } from '../utils/theme';

type DashboardStackParamList = {
  Dashboard: undefined;
  IssueDetail: { issueId: string };
};

type MyIssuesStackParamList = {
  MyIssues: undefined;
  IssueDetail: { issueId: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<DashboardStackParamList & MyIssuesStackParamList>();

const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={StudentDashboardScreen}
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

const MyIssuesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyIssues"
        component={MyIssuesScreen}
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

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyIssuesTab"
        component={MyIssuesStack}
        options={{
          tabBarLabel: 'My Issues',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size || 24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateIssueTab"
        component={CreateIssueScreen}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size || 24} color={color} />
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

export default AppTabs;

