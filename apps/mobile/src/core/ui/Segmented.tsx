import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, MIN_TOUCH_SIZE, radius } from './theme';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.group}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            <AppText style={[styles.label, selected && styles.selectedLabel]}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
  },
  segment: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  selected: {
    backgroundColor: colors.card,
    boxShadow: '0 1px 3px rgba(22, 81, 53, 0.15)',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});
