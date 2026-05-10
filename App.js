import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, Platform, TouchableOpacity } from 'react-native';
import { getUserData } from './src/utils/storage';
import { initializePurchases } from './src/utils/purchases';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import YearOverviewScreen from './src/screens/YearOverviewScreen';
import Svg, { Path, Rect, Line, Circle, Polyline } from 'react-native-svg';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const C = {
  blue:    '#1d4ed8',
  bluePale:'#93c5fd',
  white:   '#ffffff',
  navBg:   'rgba(255,255,255,0.97)',
  navBorder:'rgba(59,130,246,0.08)',
};

function HomeIcon({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function GridIcon({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="7" height="7" />
      <Rect x="14" y="3" width="7" height="7" />
      <Rect x="3" y="14" width="7" height="7" />
      <Rect x="14" y="14" width="7" height="7" />
    </Svg>
  );
}

function CalIcon({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="18" rx="2" />
      <Line x1="16" y1="2" x2="16" y2="6" />
      <Line x1="8" y1="2" x2="8" y2="6" />
      <Line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
  );
}

function UserIcon({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function PlusIcon({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

function CenterButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: C.blue,
        alignItems: 'center', justifyContent: 'center',
        marginTop: -18,
        shadowColor: C.blue,
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }}
    >
      <PlusIcon />
    </TouchableOpacity>
  );
}

function TabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.navBg,
          borderTopWidth: 1,
          borderTopColor: C.navBorder,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 82 : 62,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: C.blue,
        tabBarInactiveTintColor: C.bluePale,
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const size = 20;
          if (route.name === 'Home')        return <HomeIcon color={focused ? C.blue : C.bluePale} size={size} />;
          if (route.name === 'Boekhouding') return <GridIcon color={focused ? C.blue : C.bluePale} size={size} />;
          if (route.name === 'Nieuw')       return null;
          if (route.name === 'Kalender')    return <CalIcon  color={focused ? C.blue : C.bluePale} size={size} />;
          if (route.name === 'Profiel')     return <UserIcon color={focused ? C.blue : C.bluePale} size={size} />;
        },
        tabBarButton: route.name === 'Nieuw'
          ? (props) => <CenterButton onPress={() => navigation.navigate('Chat')} />
          : undefined,
      })}
    >
      <Tab.Screen name="Home"        component={HomeScreen} />
      <Tab.Screen name="Boekhouding" component={FavoritesScreen} />
      <Tab.Screen name="Nieuw"       component={HomeScreen} options={{ tabBarLabel: '' }} />
      <Tab.Screen name="Kalender"    component={CalendarScreen} />
      <Tab.Screen name="Profiel"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    getUserData().then((data) => {
      setInitialRoute(data?.name ? 'Main' : 'Onboarding');
    });
    initializePurchases();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dbeafe' }}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main"       component={TabNavigator} />
        <Stack.Screen name="Chat"       component={ChatScreen} />
        <Stack.Screen name="History"    component={HistoryScreen} />
        <Stack.Screen name="Paywall"    component={PaywallScreen} />
        <Stack.Screen name="Scanner"    component={ScannerScreen} />
        <Stack.Screen name="YearOverview" component={YearOverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
