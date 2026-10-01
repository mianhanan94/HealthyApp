import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts } from './theme';

type Tone = 'neutral' | 'success';

/** Small rounded label, e.g. "620 kcal" or "High protein". */
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.pill, tone === 'success' ? styles.success : styles.neutral]}>
      <AppText style={[styles.label, tone === 'success' ? styles.successText : styles.neutralText]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  neutral: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  neutralText: {
    color: colors.textMuted,
  },
  successText: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
});
