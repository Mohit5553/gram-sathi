import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { loadAuthState } from '../store/authSlice';
import { View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from '../utils/notifications';

// Screens (To be created)
import LoginScreen from '../screens/Auth/LoginScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ServicesScreen from '../screens/Services/ServicesScreen';
import TractorListScreen from '../screens/Services/TractorListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SchemesScreen from '../screens/Schemes/SchemesScreen';
import UserBookingsScreen from '../screens/Bookings/UserBookingsScreen';
import ProviderDashboardScreen from '../screens/Bookings/ProviderDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useSelector((state) => state.auth);
  
  // A simple check if user is provider. Often provider role is admin or they have specific fields.
  // We'll show Provider Dashboard if they have role 'admin' or if we want to show it conditionally.
  // For now, let's just show Bookings and if admin, show Dashboard.
  const isProvider = user?.role === 'admin' || user?.isProvider;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Services') iconName = 'tractor';
          else if (route.name === 'Schemes') iconName = 'file-document';
          else if (route.name === 'Profile') iconName = 'account';
          else if (route.name === 'Bookings') iconName = 'calendar-check';
          else if (route.name === 'Dashboard') iconName = 'view-dashboard';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: 'gray',
        headerShown: true
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Bookings" component={UserBookingsScreen} />
      {isProvider && <Tab.Screen name="Dashboard" component={ProviderDashboardScreen} />}
      <Tab.Screen name="Schemes" component={SchemesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

import BookingFormScreen from '../screens/Bookings/BookingFormScreen';

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { user, isHydrated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadAuthState());
    
    if (user) {
      registerForPushNotificationsAsync();
    }
  }, [dispatch, user]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Tractors" component={TractorListScreen} options={{ headerShown: true, title: 'Tractors Available' }} />
            <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ headerShown: true, title: 'Book Service' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
