import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, radius } from './theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Selectable filter chip: ink when selected, outlined otherwise. */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={4}
      style={[styles.chip, selected ? styles.selected : styles.unselected]}
    >
      <AppText style={[styles.label, { color: selected ? colors.onPrimary : colors.primary }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.inkPanel,
  },
  unselected: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
