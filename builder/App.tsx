/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import PageRender from './src/component/PageRender';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntialScreen from './src/screens/IntialScreen';
import { createStaticNavigation } from '@react-navigation/native';
import DynamicScreen from './src/screens/DynamicScreen';


export type RootStackParamList = {
  '/': undefined;
  DynamicScreen: { url: string };
};

export const RootStack = createNativeStackNavigator<RootStackParamList>({
  screenOptions: {
    headerShown: false,
    animation: 'default',
  },
  screens: {
    '/': IntialScreen,
    DynamicScreen: DynamicScreen
  },
});

const Navigation = createStaticNavigation(RootStack,);



function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Navigation />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default App;
