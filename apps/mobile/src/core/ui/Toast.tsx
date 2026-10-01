import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/core/navigation/FloatingTabBar';
import { useToastStore } from '@/core/toast';

import { AppText } from './AppText';
import { colors, fonts, radius, shadows } from './theme';

const DURATION_MS = 3000;

/** One app-wide toast, shown above the tab bar (spec Part 7). */
export function Toast() {
  const { message, key, hide } = useToastStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, key, hide]);

  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents="none"
      style={[styles.toast, { bottom: Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT + 16 }]}
    >
      <AppText style={styles.text}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.inkPanel,
    boxShadow: shadows.sheet,
  },
  text: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
