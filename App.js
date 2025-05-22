import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';

const App = () => {
  return (
    <SafeAreaProvider>
      <SplashScreen />
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});