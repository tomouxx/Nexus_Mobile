import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SectorChatScreen from './src/screens/SectorChatScreen';
import InfrastructureScreen from './src/screens/InfrastructureScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerBackTitle: 'Retour',
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SectorChat"
            component={SectorChatScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Infrastructure"
            component={InfrastructureScreen}
            options={{ headerShown: true }}
          />
          <Stack.Screen name="Settings">
            {(props) => (
              <SettingsScreen
                {...props}
                onLogout={() => setIsAuthenticated(false)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
