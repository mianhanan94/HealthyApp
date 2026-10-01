import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { colors, CONTROL_HEIGHT, fonts, MIN_TOUCH_SIZE, radius, shadows, spacing } from './theme';

/** Mirrors the Lovable button variants. */
type Variant = 'primary' | 'outline' | 'ghost' | 'commerce' | 'ink';
/** `action` is the full-width 52pt call to action; `square` is an icon-only button. */
type Size = 'action' | 'sm' | 'square';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  /** Trailing icon (the only content for `square`). */
  icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT: Record<Variant, { container: ViewStyle; text: string }> = {
  primary: {
    container: { backgroundColor: colors.primary, boxShadow: shadows.card },
    text: colors.onPrimary,
  },
  outline: {
    container: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    text: colors.primary,
  },
  ghost: { container: {}, text: colors.primary },
  commerce: {
    container: { backgroundColor: colors.commerce, boxShadow: shadows.card },
    text: colors.text,
  },
  ink: { container: { backgroundColor: colors.inkPanel }, text: colors.onPrimary },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'action',
  icon: Icon,
  disabled = false,
  style,
}: ButtonProps) {
  const { container, text } = VARIANT[variant];
  const iconOnly = size === 'square';
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={size === 'sm' ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        container,
        size === 'action' && variant !== 'ghost' && styles.spread,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {iconOnly ? (
        Icon && <Icon size={20} color={text} />
      ) : (
        <>
          <AppText
            numberOfLines={1}
            style={[styles.label, size === 'sm' && styles.labelSm, { color: text }]}
          >
            {label}
          </AppText>
          {Icon ? <Icon size={iconSize} color={text} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  action: {
    minHeight: CONTROL_HEIGHT,
    paddingHorizontal: 20,
    alignSelf: 'stretch',
  },
  sm: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  square: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
  },
  spread: {
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  labelSm: {
    fontSize: 12,
  },
});
