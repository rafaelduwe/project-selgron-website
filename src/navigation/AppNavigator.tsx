import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import TokenScreen from '../screens/TokenScreen';
import ReembolsoScreen from '../screens/ReembolsoScreen';
import OSScreen from '../screens/OSScreen';

const Tab = createBottomTabNavigator();

function Icone({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTitleStyle: { color: Colors.primary, fontWeight: 'bold', letterSpacing: 2 },
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen
        name="Token"
        component={TokenScreen}
        options={{
          title: 'TOKEN',
          tabBarLabel: 'Token',
          tabBarIcon: ({ focused }) => <Icone emoji="🔑" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reembolso"
        component={ReembolsoScreen}
        options={{
          title: 'REEMBOLSO',
          tabBarLabel: 'Reembolso',
          tabBarIcon: ({ focused }) => <Icone emoji="🧾" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="OS"
        component={OSScreen}
        options={{
          title: 'ORDEM DE SERVIÇO',
          tabBarLabel: 'OS',
          tabBarIcon: ({ focused }) => <Icone emoji="📋" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
