import type { BmiCategory } from '@healthyapp/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { colors, fonts } from '@/core/ui/theme';

const MIN = 15;
const MAX = 35;
// WHO Asian cut-offs.
const SEGMENTS: { category: BmiCategory; from: number; to: number }[] = [
  { category: 'underweight', from: MIN, to: 18.5 },
  { category: 'healthy', from: 18.5, to: 23 },
  { category: 'overweight', from: 23, to: 27.5 },
  { category: 'obese', from: 27.5, to: MAX },
];
const TICKS = [18.5, 23, 27.5];

const pct = (bmi: number) => ((Math.min(Math.max(bmi, MIN), MAX) - MIN) / (MAX - MIN)) * 100;

/** Proportional BMI bar over 15–35 with the user's position marked (spec 1.5 A). */
export function BmiScale({ bmi, category }: { bmi: number; category: BmiCategory }) {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityLabel={`${t('onboarding.result.bmi')} ${bmi.toFixed(1)}, ${t(`bmiCategory.${category}`)}`}
    >
      <View style={styles.markerRow}>
        <View
          style={[styles.markerLabelWrap, { left: `${Math.min(Math.max(pct(bmi), 10), 90)}%` }]}
        >
          <AppText style={styles.markerLabel}>
            {t('onboarding.result.you', { bmi: bmi.toFixed(1) })}
          </AppText>
        </View>
      </View>
      <View style={styles.bar}>
        {SEGMENTS.map((s) => (
          <View
            key={s.category}
            style={{
              flex: s.to - s.from,
              backgroundColor:
                s.category === category
                  ? category === 'healthy'
                    ? colors.success
                    : colors.commerce
                  : s.category === 'healthy'
                    ? colors.primary
                    : colors.border,
            }}
          />
        ))}
        <View style={[styles.marker, { left: `${pct(bmi)}%` }]} />
      </View>
      <View style={styles.ticks}>
        {TICKS.map((tick) => (
          <AppText key={tick} muted style={[styles.tick, { left: `${pct(tick)}%` }]}>
            {tick}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markerRow: {
    height: 20,
  },
  markerLabelWrap: {
    position: 'absolute',
    width: 80,
    marginLeft: -40,
    alignItems: 'center',
  },
  markerLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  bar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  marker: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 3,
    marginLeft: -1.5,
    backgroundColor: colors.text,
  },
  ticks: {
    height: 18,
    marginTop: 4,
  },
  tick: {
    position: 'absolute',
    width: 40,
    marginLeft: -20,
    textAlign: 'center',
    fontSize: 11,
  },
});
