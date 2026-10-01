import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, MIN_TOUCH_SIZE, radius } from './theme';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Accessible name of the value, e.g. "Quantity". */
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  /** At the minimum, "−" becomes a remove button (cart lines). */
  onRemove?: () => void;
  removeLabel?: string;
  /** Shown after the number, e.g. "scoops". */
  unit?: string;
}

/** − value + with 44pt buttons; buttons disable at the bounds. */
export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  onRemove,
  removeLabel,
  unit,
}: StepperProps) {
  const canRemove = onRemove !== undefined && value <= min;
  const canDecrease = value > min || canRemove;
  const canIncrease = value < max;

  return (
    <View style={styles.stepper} accessibilityLabel={label}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={canRemove ? removeLabel : decreaseLabel}
        accessibilityState={{ disabled: !canDecrease }}
        disabled={!canDecrease}
        onPress={() => (canRemove ? onRemove?.() : onChange(value - 1))}
        style={[styles.button, !canDecrease && styles.disabled]}
      >
        {canRemove ? (
          <Trash2 size={16} color={colors.danger} />
        ) : (
          <Minus size={16} color={colors.primary} />
        )}
      </Pressable>
      <AppText style={styles.value} accessibilityLiveRegion="polite">
        {value}
        {unit ? ` ${unit}` : ''}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
        accessibilityState={{ disabled: !canIncrease }}
        disabled={!canIncrease}
        onPress={() => onChange(value + 1)}
        style={[styles.button, !canIncrease && styles.disabled]}
      >
        <Plus size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  button: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  value: {
    minWidth: 32,
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
});
