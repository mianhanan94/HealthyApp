import { Redirect, router } from 'expo-router';
import { ArrowRight, HeartPulse } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatSigned } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts, radius, typography } from '@/core/ui/theme';
import { BmiScale } from '@/features/onboarding/components/BmiScale';
import { StepHeader } from '@/features/onboarding/components/StepHeader';
import { useResultViewModel } from '@/features/onboarding/useOnboardingViewModels';

function NumberCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.cell}>
      <AppText style={[styles.cellValue, accent && styles.accent]}>{value}</AppText>
      <AppText muted style={styles.cellLabel}>
        {label}
      </AppText>
    </View>
  );
}

export default function ResultScreen() {
  const { t } = useTranslation();
  const { body, name, result } = useResultViewModel();
  if (!body || !result) return <Redirect href="/onboarding/details" />;

  const firstName = name.split(' ')[0] ?? name;
  const { safety } = result;
  const holding = safety.minor || safety.pregnancy;
  const change = result.changeKg;

  const coach = holding
    ? null
    : result.category === 'overweight' || result.category === 'obese'
      ? result.suggestedGoal === 'build_muscle'
        ? t('onboarding.result.muscle')
        : result.target.isStepTarget
          ? t('onboarding.result.coach.loseStep', {
              target: result.target.targetKg,
              milestone: result.milestoneKg,
            })
          : result.milestoneKg === null
            ? t('onboarding.result.coach.loseShort', { kg: Math.abs(change) })
            : t('onboarding.result.coach.lose', {
                kg: Math.abs(change),
                milestone: result.milestoneKg,
              })
      : result.category === 'underweight'
        ? t('onboarding.result.coach.gain', { kg: change })
        : t('onboarding.result.coach.healthy');

  return (
    <Screen>
      <StepHeader step={2} title={t('onboarding.result.title', { name: firstName })} />

      {holding ? (
        <InfoBox title={t('onboarding.result.bmi')}>
          {safety.minor
            ? t('onboarding.result.bmiNotUsed.minor')
            : t('onboarding.result.bmiNotUsed.pregnancy')}
        </InfoBox>
      ) : (
        <>
          <View style={styles.scoreRow}>
            <View>
              <AppText variant="eyebrow" muted>
                {t('onboarding.result.bmi')}
              </AppText>
              <AppText style={styles.score}>{result.bmi.toFixed(1)}</AppText>
            </View>
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: result.category === 'healthy' ? colors.primary : colors.commerce,
                },
              ]}
            >
              <AppText
                style={[
                  styles.tagText,
                  { color: result.category === 'healthy' ? colors.onPrimary : colors.text },
                ]}
              >
                {t(`bmiCategory.${result.category}`)}
              </AppText>
            </View>
          </View>
          <BmiScale bmi={result.bmi} category={result.category} />
          <AppText style={styles.verdict}>
            {t(`onboarding.result.verdict.${result.category}`)}
          </AppText>

          <View style={styles.grid}>
            <NumberCell
              label={t('onboarding.result.healthyWeight')}
              value={`${result.healthyRange.minKg}–${result.healthyRange.maxKg} kg`}
            />
            <NumberCell
              label={
                result.target.isStepTarget
                  ? t('onboarding.result.stepTarget')
                  : t('onboarding.result.target')
              }
              value={`${result.target.targetKg} kg`}
            />
            <NumberCell
              label={t('onboarding.result.toReach')}
              value={change === 0 ? t('onboarding.result.stay') : `${formatSigned(change)} kg`}
              accent={change !== 0}
            />
          </View>
        </>
      )}

      {result.waistToHeight !== null && !holding ? (
        <View style={styles.waist}>
          <AppText style={styles.waistTitle}>
            {t('onboarding.result.waistCheck', { ratio: result.waistToHeight.toFixed(2) })}
          </AppText>
          <AppText
            style={{ color: result.waistToHeight >= 0.5 ? colors.commerce : colors.primary }}
          >
            {result.waistToHeight >= 0.5
              ? t('onboarding.result.waistHigh')
              : t('onboarding.result.waistGood')}
          </AppText>
        </View>
      ) : null}

      {safety.minor ? (
        <InfoBox icon={HeartPulse}>{t('onboarding.result.safety.minor')}</InfoBox>
      ) : null}
      {safety.pregnancy ? (
        <InfoBox icon={HeartPulse}>{t('onboarding.result.safety.pregnancy')}</InfoBox>
      ) : null}
      {safety.seeDoctor ? (
        <InfoBox icon={HeartPulse}>{t('onboarding.result.safety.seeDoctor')}</InfoBox>
      ) : null}

      {coach ? (
        <View style={styles.coach}>
          <AppText variant="eyebrow" style={styles.coachEyebrow}>
            {t('onboarding.result.whatThisMeans')}
          </AppText>
          <AppText style={styles.coachText}>{coach}</AppText>
        </View>
      ) : null}

      <AppText muted style={styles.footnote}>
        {t('onboarding.result.footnote')}
      </AppText>
      <Button
        label={t('onboarding.result.next')}
        icon={ArrowRight}
        onPress={() => router.push('/onboarding/goal')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  score: {
    ...typography.number,
    fontSize: 64,
    lineHeight: 66,
    color: colors.primary,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  tagText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  verdict: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
  },
  grid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cellValue: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary,
  },
  accent: {
    color: colors.commerce,
  },
  cellLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  waist: {
    gap: 2,
  },
  waistTitle: {
    fontFamily: fonts.bold,
  },
  coach: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
    backgroundColor: colors.card,
  },
  coachEyebrow: {
    color: colors.primary,
  },
  coachText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footnote: {
    fontSize: 11.5,
    lineHeight: 17,
  },
});
