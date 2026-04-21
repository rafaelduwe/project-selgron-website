import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme/colors';

export default function App() {
  const [logado, setLogado] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      {logado ? (
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      ) : (
        <LoginScreen onLogin={() => setLogado(true)} />
      )}
    </GestureHandlerRootView>
  );
}
