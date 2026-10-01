import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarSpace } from '@/core/navigation/FloatingTabBar';

import { colors, spacing } from './theme';

interface ScreenProps {
  children: ReactNode;
  /** Tab screens have no header and must clear the floating tab bar. */
  tab?: boolean;
}

export function Screen({ children, tab = false }: ScreenProps) {
  const tabBarSpace = useTabBarSpace();
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={tab ? ['top', 'left', 'right'] : ['bottom', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          tab ? { paddingTop: spacing.lg, paddingBottom: tabBarSpace } : null,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
});
