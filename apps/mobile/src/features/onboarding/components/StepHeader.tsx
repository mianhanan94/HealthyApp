import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { colors } from '@/core/ui/theme';

import { ONBOARDING_STEPS } from '../useOnboardingViewModels';

interface StepHeaderProps {
  step: number;
  title: string;
  intro?: string;
}

/** "STEP 2 OF 4", a thin segmented progress bar, then the screen title (spec 1.3–1.7). */
export function StepHeader({ step, title, intro }: StepHeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View
        style={styles.bar}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: ONBOARDING_STEPS, now: step }}
      >
        {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
          <View key={i} style={[styles.segment, i < step && styles.done]} />
        ))}
      </View>
      <AppText variant="eyebrow" style={styles.eyebrow}>
        {t('onboarding.step', { step, total: ONBOARDING_STEPS })}
      </AppText>
      <AppText variant="title">{title}</AppText>
      {intro ? (
        <AppText muted style={styles.intro}>
          {intro}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  done: {
    backgroundColor: colors.success,
  },
  eyebrow: {
    color: colors.primary,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
  },
});
