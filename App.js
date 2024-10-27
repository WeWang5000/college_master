// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './screens/LandingScreen';
import ReviewScreen from './screens/ReviewScreen';
import GoalsScreen from './screens/GoalsScreen';
import HomeworkScreen from './screens/HomeworkScreen';
import IntroScreen from './screens/IntroScreen';
import VoicePromptScreen from './screens/VoicePromptScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: '' }} />
        <Stack.Screen name="Goals" component={GoalsScreen} options={{ title: '' }} />
        <Stack.Screen name="Homework" component={HomeworkScreen} options={{ title: '' }} />
        <Stack.Screen name="Intro" component={IntroScreen} options={{ title: '' }} />
        <Stack.Screen name="VoicePrompt" component={VoicePromptScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
