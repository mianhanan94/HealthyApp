import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, MIN_TOUCH_SIZE, radius } from './theme';

interface OptionRowProps {
  title: string;
  /** Second line, e.g. "Desk job, little walking". */
  detail?: string;
  /** Right-hand note, e.g. "+40 kcal · +Rs 40". */
  trailing?: string;
  /** Small tag after the title, e.g. "SUGGESTED". */
  tag?: string;
  selected: boolean;
  disabled?: boolean;
  /** Shown instead of `detail` when disabled, e.g. "Out today". */
  disabledNote?: string;
  /** Radio for pick-one, checkbox for pick-many. Both render the design's rounded square. */
  role?: 'radio' | 'checkbox';
  onPress: () => void;
}

/** Tappable row with the design's selection square (Lovable `Choice`). */
export function OptionRow({
  title,
  detail,
  trailing,
  tag,
  selected,
  disabled = false,
  disabledNote,
  role = 'radio',
  onPress,
}: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={[title, detail, trailing].filter(Boolean).join(', ')}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={styles.text}>
        <View style={styles.titleLine}>
          <AppText style={styles.title}>{title}</AppText>
          {tag ? <AppText style={styles.tag}>{tag}</AppText> : null}
        </View>
        {disabled && disabledNote ? (
          <AppText muted style={styles.detail}>
            {disabledNote}
          </AppText>
        ) : detail ? (
          <AppText muted style={styles.detail}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {trailing ? (
        <AppText muted style={styles.trailing}>
          {trailing}
        </AppText>
      ) : null}
      <View style={selected ? styles.selectedSquare : styles.emptySquare}>
        {selected ? <Check size={14} color={colors.primary} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: MIN_TOUCH_SIZE + 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  tag: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.primary,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  detail: {
    fontSize: 12,
    lineHeight: 16,
  },
  trailing: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
    maxWidth: 140,
  },
  selectedSquare: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySquare: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
});
