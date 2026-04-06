/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { DefaultNavigation } from './src/navigation/DefaultNavigation';
import { config } from './src/config';
import { BottomTabNavigation } from './src/navigation/BottomTabNavigation';
import { DrawerNavigation } from './src/navigation/DrawerNavigation';

function App() {

  const navigationComponentMap = {
    "default": <DefaultNavigation />,
    "bottom-tab": <BottomTabNavigation />,
    "drawer": <DrawerNavigation />,
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {navigationComponentMap[config.navigationConfig.type]}
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
