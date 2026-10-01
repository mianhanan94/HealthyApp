import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMoney } from '@/core/format';
import { TAB_BAR_HEIGHT } from '@/core/navigation/FloatingTabBar';

import { AppText } from './AppText';
import { colors, fonts, radius, shadows } from './theme';

/** Floating "2 items · Rs 1,780 · View cart" bar above the tab bar (Lovable design). */
export function ViewCartBar({ count, total }: { count: number; total: number }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  if (count === 0) return null;
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT + 12 }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate('/cart')}
        style={styles.bar}
      >
        <AppText style={styles.text}>
          {t('cart.itemCount', { count })} · {formatMoney(total)}
        </AppText>
        <View style={styles.right}>
          <AppText style={styles.text}>{t('home.viewCart')}</AppText>
          <ArrowRight size={16} color={colors.text} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  bar: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.commerce,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    boxShadow: shadows.sheet,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
});
