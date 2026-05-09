import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { getUserData } from './src/utils/storage';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    getUserData().then((data) => {
      setInitialRoute(data?.name ? 'Home' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#154273" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
