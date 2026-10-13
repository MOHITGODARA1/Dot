import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Deep-linking config so browser back/forward, refresh, and shared URLs
// work on web instead of resetting to the initial route.
const linking = {
  prefixes: [],
  config: {
    screens: {
      Welcome: '',
      Register: 'register',
      Login: 'login',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking} fallback={null}>
        <StatusBar style="light" backgroundColor="#5847D1" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
