import { ArrowRight, CalendarClock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatDate } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts, radius } from '@/core/ui/theme';
import { startOnboarding } from '@/features/onboarding/useOnboardingViewModels';
import { DailyTargetPanel, PerMealTable } from '@/features/plan/components/PlanSummary';
import { isRecheckDue, usePlan } from '@/features/profile/profile.store';

export default function TargetScreen() {
  const { t } = useTranslation();
  const { profile, plan } = usePlan();

  if (!profile || !plan) {
    return (
      <Screen tab>
        <PageHeading
          eyebrow={t('target.eyebrow')}
          title={t('target.title')}
          intro={t('target.intro')}
        />
        <View style={styles.panel}>
          <AppText variant="eyebrow" style={styles.panelEyebrow}>
            {t('target.noPlanEyebrow')}
          </AppText>
          <AppText style={styles.panelBody}>{t('target.noPlanBody')}</AppText>
        </View>
        <Button
          label={t('common.setMyPlan')}
          icon={ArrowRight}
          onPress={() => startOnboarding(null)}
        />
      </Screen>
    );
  }

  return (
    <Screen tab>
      <PageHeading
        eyebrow={t('target.eyebrow')}
        title={t('target.title')}
        intro={t('target.goalLine', {
          goal: t(`onboarding.goal.goals.${plan.goal}.title`),
          pace: plan.pace
            ? t(`onboarding.goal.pace.${plan.pace}`)
            : t(`onboarding.goal.goals.${plan.goal}.detail`),
        })}
      />
      {isRecheckDue(profile) ? (
        <InfoBox tone="warn" icon={CalendarClock} title={t('target.recheckTitle')}>
          {t('target.recheckBody')}
        </InfoBox>
      ) : null}
      <DailyTargetPanel plan={plan} eyebrow={t('target.personal')} />
      {plan.targetDate && plan.weeksToTarget !== null ? (
        <AppText style={styles.timeline}>
          {t('onboarding.plan.fullTarget', {
            date: formatDate(plan.targetDate),
            weeks: plan.weeksToTarget,
          })}
        </AppText>
      ) : null}
      <AppText variant="eyebrow">{t('onboarding.plan.perMeal')}</AppText>
      <PerMealTable plan={plan} />
      <Button
        label={t('target.updatePlan')}
        icon={ArrowRight}
        onPress={() => startOnboarding(profile)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.inkPanel,
    borderRadius: radius.xl,
    padding: 20,
    gap: 16,
  },
  panelEyebrow: {
    color: colors.accentLight,
  },
  panelBody: {
    color: colors.onPrimary,
    lineHeight: 24,
  },
  timeline: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },
});
