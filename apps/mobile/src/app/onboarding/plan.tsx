import { Redirect, router } from 'expo-router';
import { ArrowRight, HeartPulse } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatDate } from '@/core/format';
import { showToast } from '@/core/toast';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts, radius } from '@/core/ui/theme';
import { StepHeader } from '@/features/onboarding/components/StepHeader';
import { usePlanViewModel } from '@/features/onboarding/useOnboardingViewModels';
import { DailyTargetPanel, PerMealTable } from '@/features/plan/components/PlanSummary';

const TIP_KEYS = ['a', 'b', 'c'] as const;

export default function PlanScreen() {
  const { t } = useTranslation();
  const vm = usePlanViewModel();
  if (!vm.body || !vm.plan) return <Redirect href="/onboarding/details" />;
  const { plan, body } = vm;

  const intro = t(`onboarding.plan.intro.${plan.goal}`, {
    from: body.weightKg,
    to: plan.targetKg,
    rate: plan.weeklyKg ?? 0,
  });
  const tips = plan.goal === 'lose' ? 'lose' : plan.goal === 'gain' ? 'gain' : 'steady';

  return (
    <Screen>
      <StepHeader step={4} title={t('onboarding.plan.title')} intro={intro} />
      <DailyTargetPanel plan={plan} eyebrow={t('target.personal')} />

      {plan.targetDate && plan.weeksToTarget !== null ? (
        <AppText style={styles.timeline}>
          {plan.weeksToMilestone !== null && plan.milestoneKg !== null
            ? t('onboarding.plan.milestone', {
                kg: plan.milestoneKg,
                weeks: plan.weeksToMilestone,
                date: formatDate(plan.targetDate),
              })
            : t('onboarding.plan.fullTarget', {
                date: formatDate(plan.targetDate),
                weeks: plan.weeksToTarget,
              })}
        </AppText>
      ) : null}

      {body.pregnantOrBreastfeeding ? (
        <InfoBox icon={HeartPulse}>{t('onboarding.result.safety.pregnancy')}</InfoBox>
      ) : null}

      <View style={styles.section}>
        <AppText variant="eyebrow">{t('onboarding.plan.perMeal')}</AppText>
        <PerMealTable plan={plan} />
      </View>

      <View style={styles.tips}>
        <AppText variant="eyebrow" style={styles.tipsEyebrow}>
          {t('onboarding.plan.tipsTitle')}
        </AppText>
        {TIP_KEYS.map((k) => (
          <View key={k} style={styles.tip}>
            <View style={styles.bullet} />
            <AppText style={styles.tipText}>{t(`onboarding.plan.tips.${tips}.${k}`)}</AppText>
          </View>
        ))}
      </View>

      <AppText muted style={styles.footnote}>
        {t('onboarding.plan.footnote')}
      </AppText>

      <Button
        label={vm.isUpdate ? t('onboarding.plan.update') : t('onboarding.plan.save')}
        icon={ArrowRight}
        onPress={() => {
          if (!vm.save()) return;
          showToast(t('onboarding.plan.saved'));
          router.dismissTo('/');
        }}
      />
      <Button variant="outline" label={t('onboarding.plan.change')} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  timeline: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  section: {
    gap: 10,
  },
  tips: {
    gap: 10,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  tipsEyebrow: {
    color: colors.primary,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    marginTop: 6,
    borderRadius: 2,
    backgroundColor: colors.success,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 11.5,
    lineHeight: 17,
  },
});
