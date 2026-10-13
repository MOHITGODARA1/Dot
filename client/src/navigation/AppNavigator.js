import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../feature/screen/WelcomeScreen';
import RegisterScreen from '../feature/screen/register';
import LoginScreen from '../feature/screen/Login';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        // Same push/pop animation on iOS and Android instead of
        // each platform's default (which differ).
        animation: 'slide_from_right',
        gestureEnabled: true,
        // Avoid a white flash behind the blue screens during transitions.
        contentStyle: { backgroundColor: '#5847D1' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
