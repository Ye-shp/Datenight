import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import InputScreen from '../screens/InputScreen';
import ResultsScreen from '../screens/ResultsScreen';

export type RootStackParamList = {
  Login: undefined;
  Input: undefined;
  Results: { city: string; budget: number; vibe: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Input" component={InputScreen} options={{ title: 'Plan Your Date' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Your Date Plan' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
