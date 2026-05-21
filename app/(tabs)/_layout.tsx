import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bid',
          tabBarIcon: ({ color }) => <MaterialIcons size={27} name="bolt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Memory',
          tabBarIcon: ({ color }) => <MaterialIcons size={27} name="history" color={color} />,
        }}
      />
    </Tabs>
  );
}
