import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { House, ShoppingBag, Target, UserRound, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/core/ui/AppText';
import { usePricedCart } from '@/features/cart/cart.store';
import { colors, fonts } from '@/core/ui/theme';

export const TAB_BAR_HEIGHT = 72;
const TAB_BAR_GAP = 12;

/** Vertical space screens must leave free at the bottom so content clears the tab bar. */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_GAP) + 24;
}

const ICONS: Record<string, LucideIcon> = {
  index: House,
  target: Target,
  cart: ShoppingBag,
  profile: UserRound,
};

const LABEL_KEYS = {
  index: 'tabs.home',
  target: 'tabs.target',
  cart: 'tabs.cart',
  profile: 'tabs.profile',
} as const;

const INACTIVE = 'rgba(255, 255, 255, 0.55)';
/** Same height for every tab's icon so the labels line up. */
const ICON_SLOT = 28;

/**
 * The design's floating pill tab bar. The design raises the cart in the middle of five tabs;
 * with four tabs (Coach is Phase 2) it sits in line as an orange pill so the bar stays balanced.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cartCount = usePricedCart().itemCount;

  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, TAB_BAR_GAP) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? House;
        const label = t(LABEL_KEYS[route.name as keyof typeof LABEL_KEYS] ?? 'tabs.home');
        const a11yLabel = route.name === 'cart' && cartCount > 0 ? `${label}, ${cartCount}` : label;
        const isCart = route.name === 'cart';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={a11yLabel}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.tab}
          >
            {isCart ? (
              <View style={[styles.cartButton, focused && styles.cartButtonFocused]}>
                <Icon size={18} color={colors.text} />
                {cartCount > 0 ? (
                  <View style={styles.badge}>
                    <AppText style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</AppText>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.iconSlot}>
                <Icon size={20} color={focused ? colors.success : INACTIVE} />
              </View>
            )}
            <AppText style={[styles.label, { color: focused ? colors.success : INACTIVE }]}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: TAB_BAR_GAP,
    right: TAB_BAR_GAP,
    height: TAB_BAR_HEIGHT,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    boxShadow: '0 20px 25px rgba(22, 81, 53, 0.25)',
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
  },
  iconSlot: {
    height: ICON_SLOT,
    justifyContent: 'center',
  },
  cartButton: {
    width: 36,
    height: ICON_SLOT,
    borderRadius: 14,
    backgroundColor: colors.commerce,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 12,
    color: colors.primary,
  },
  cartButtonFocused: {
    borderWidth: 2,
    borderColor: colors.success,
  },
});
