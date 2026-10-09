import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Brand colors (same palette as the design guide)
const COLORS = {
  blue: '#5847D1',
  coral: '#FF6B7F',
  purple: '#7B6CF6',
  lavender: '#8E80F5',
  lime: '#C5EE7B',
  yellow: '#F4D06F',
  ink: '#111111',
  white: '#FFFFFF',
};

// Small "live status" pill that shows what Dot does at a glance
function StatusChip({ dotColor, name, text, background, style, anim, floatShift }) {
  return (
    <Animated.View
      style={[
        styles.chip,
        { backgroundColor: background },
        style,
        {
          opacity: anim,
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            { translateY: floatShift },
          ],
        },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
      <Text style={styles.chipText}>
        <Text style={styles.chipName}>{name}</Text>
        {'  '}
        {text}
      </Text>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const titleSize = Math.min(Math.max(width * 0.11, 36), 50);
  const cardSize = Math.min(width * 0.6, height * 0.32, 280);

  // Animation values
  const cardIn = useRef(new Animated.Value(0)).current;
  const chipAIn = useRef(new Animated.Value(0)).current;
  const chipBIn = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let loop;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;

      // Respect the phone's "reduce motion" setting
      if (reduceMotion) {
        cardIn.setValue(1);
        chipAIn.setValue(1);
        chipBIn.setValue(1);
        return;
      }

      // One entrance moment: card first, then the two status chips
      const spring = (value) =>
        Animated.spring(value, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        });
      Animated.stagger(160, [spring(cardIn), spring(chipAIn), spring(chipBIn)]).start();

      // Gentle floating loop afterwards
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    });

    return () => {
      mounted = false;
      if (loop) loop.stop();
    };
  }, [cardIn, chipAIn, chipBIn, float]);

  // The card floats up while the chips drift down, which adds depth
  const cardFloat = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const chipFloat = float.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.blue} />

      <View style={styles.content}>
        {/* Headline */}
        <View>
          <Text
            style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.08 }]}
            accessibilityRole="header"
          >
            Build better habits, together.
          </Text>
          <Text style={styles.subtitle}>Small routines. Stronger connections.</Text>
        </View>

        {/* Illustration stage */}
        <View style={styles.stage}>
          {/* Background circles echo the two overlapping circles in the logo */}
          <View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.bgCircle,
              {
                width: cardSize * 0.95,
                height: cardSize * 0.95,
                backgroundColor: COLORS.coral,
                left: width * 0.02,
                bottom: '6%',
              },
            ]}
          />
          <View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.bgCircle,
              {
                width: cardSize * 0.8,
                height: cardSize * 0.8,
                backgroundColor: COLORS.lavender,
                right: -width * 0.04,
                top: '4%',
              },
            ]}
          />
          <View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.bgCircle,
              {
                width: 26,
                height: 26,
                backgroundColor: COLORS.lime,
                right: width * 0.08,
                bottom: '14%',
              },
            ]}
          />

          {/* Logo sticker card */}
          <View style={{ width: cardSize, height: cardSize }}>
            <Animated.View
              style={[
                styles.logoCard,
                {
                  width: cardSize,
                  height: cardSize,
                  opacity: cardIn,
                  transform: [
                    { translateY: cardFloat },
                    { scale: cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                    { rotate: '-4deg' },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../../assets/logo22.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Dot logo: two smiling circles joined by a heart"
              />
            </Animated.View>

            {/* Status chips show the idea: you can see each other's day */}
            <StatusChip
              anim={chipAIn}
              floatShift={chipFloat}
              background={COLORS.lime}
              dotColor={COLORS.coral}
              name="Aman"
              text="at the gym since 7:25"
              style={{ top: -16, left: -width * 0.07 }}
            />
            <StatusChip
              anim={chipBIn}
              floatShift={chipFloat}
              background={COLORS.yellow}
              dotColor={COLORS.purple}
              name="Simran"
              text="finished reading"
              style={{ bottom: -16, right: -width * 0.07 }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.bottomSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel="I already have an account"
            hitSlop={12}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.link}>I already have an account</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blue,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: -1,
  },

  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },

  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
  },

  // White card makes the logo feel like a sticker, whatever its background is
  logoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },

  chipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  chipText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '500',
  },

  chipName: {
    fontWeight: '800',
  },

  bottomSection: {
    width: '100%',
    paddingBottom: 16,
    alignItems: 'center',
  },

  button: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },

  buttonText: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
  },

  link: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 20,
    marginBottom: 4,
  },
});