import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Brand colors (same palette as the Welcome and Register screens)
const COLORS = {
  blue: '#5847D1',
  coral: '#FF6B7F',
  purple: '#7B6CF6',
  lavender: '#8E80F5',
  lime: '#C5EE7B',
  yellow: '#F4D06F',
  ink: '#111111',
  muted: '#6B6B76',
  placeholder: '#9A9AA6',
  surface: '#F5F5F7',
  error: '#D93A55', // darker coral so the text is readable on white
  white: '#FFFFFF',
};

// One reusable input: label, focus highlight, error, and show/hide for passwords
function Field({ label, error, hint, inputRef, secure, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputInvalid,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityInvalid={!!error}
          accessibilityErrorMessage={error}
          {...inputProps}
        />

        {secure ? (
          <Pressable
            hitSlop={12}
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? `Show ${label}` : `Hide ${label}`}
          >
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.inputError} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref so "Next" on the keyboard jumps to the password field
  const passwordRef = useRef(null);

  const titleSize = Math.min(Math.max(width * 0.095, 30), 40);

  // Entrance animation only (no endless loop on a form screen).
  const [entrance] = useState(() => new Animated.Value(0));
  const timeoutRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        entrance.setValue(1);
        return;
      }
      Animated.spring(entrance, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [entrance]);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = () => {
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);
    // TODO: Replace with actual authentication.
    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('Welcome');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header: headline on the left, logo sticker on the right */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text
                style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.08 }]}
                accessibilityRole="header"
              >
                Welcome back!
              </Text>
              <Text style={styles.subtitle}>Log in to continue your journey</Text>
            </View>

            <View
              style={styles.badge}
              accessible
              accessibilityRole="image"
              accessibilityLabel="Dot logo: two smiling circles joined by a heart"
            >
              <View pointerEvents="none" style={[styles.badgeCircle, styles.badgeCoral]} />
              <View pointerEvents="none" style={[styles.badgeCircle, styles.badgeLavender]} />
              <View pointerEvents="none" style={[styles.badgeCircle, styles.badgeLime]} />
              <View style={styles.logoCard}>
                <Image
                  source={require('../../../assets/logo22.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Form fills the rest of the screen */}
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 16) + 16,
                opacity: entrance,
                transform: [
                  {
                    translateY: entrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Field
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearError('email');
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Field
              label="Password"
              placeholder="Enter your password"
              inputRef={passwordRef}
              secure
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError('password');
              }}
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Log in button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSubmitting ? 'Logging in' : 'Log in'}
              accessibilityState={{ disabled: isSubmitting }}
              style={({ pressed }) => [
                styles.button,
                pressed && !isSubmitting && styles.buttonPressed,
                isSubmitting && styles.buttonDisabled,
              ]}
              disabled={isSubmitting}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>{isSubmitting ? 'Logging in…' : 'Log In'}</Text>
            </Pressable>

            {/* Reminder of what is waiting inside */}
            <View style={styles.nextRow}>
              <View style={styles.nextDots}>
                <View style={[styles.nextDot, { backgroundColor: COLORS.coral }]} />
                <View
                  style={[
                    styles.nextDot,
                    { backgroundColor: COLORS.purple, marginLeft: -8, opacity: 0.9 },
                  ]}
                />
              </View>
              <Text style={styles.nextText}>Pick up where you and your partner left off</Text>
            </View>

            {/* Link for new users */}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="New to Dot? Create an account"
              hitSlop={12}
              style={styles.linkWrap}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>
                New to Dot? <Text style={styles.link}>Create an account</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // ---------- Header ----------
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    color: COLORS.ink,
    fontWeight: '900',
    letterSpacing: -1,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },

  badge: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeCircle: {
    position: 'absolute',
    borderRadius: 999,
  },

  badgeCoral: {
    width: 68,
    height: 68,
    backgroundColor: COLORS.coral,
    left: -4,
    bottom: -2,
  },

  badgeLavender: {
    width: 54,
    height: 54,
    backgroundColor: COLORS.lavender,
    right: -2,
    top: -4,
  },

  badgeLime: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.lime,
    right: 4,
    bottom: 6,
  },

  // Card with a soft edge makes the logo feel like a sticker on the white background
  logoCard: {
    width: 88,
    height: 88,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#EDEDF3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    transform: [{ rotate: '4deg' }],
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  // ---------- Form ----------
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  field: {
    width: '100%',
    marginBottom: 18,
  },

  fieldLabel: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 18,
  },

  inputFocused: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.white,
  },

  inputInvalid: {
    borderColor: COLORS.coral,
  },

  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.ink,
  },

  toggle: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
  },

  hint: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 6,
  },

  inputError: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 6,
  },

  // ---------- Actions ----------
  button: {
    width: '100%',
    backgroundColor: COLORS.ink,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },

  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  nextDots: {
    flexDirection: 'row',
    marginRight: 10,
  },

  nextDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  nextText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },

  linkWrap: {
    alignItems: 'center',
    marginTop: 20,
  },

  linkText: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },

  link: {
    color: COLORS.purple,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});