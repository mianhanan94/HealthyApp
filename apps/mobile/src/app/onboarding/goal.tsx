import type { MealsPerDay } from '@healthyapp/shared';
import { Redirect } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatDate, formatSigned } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { OptionRow } from '@/core/ui/OptionRow';
import { Screen } from '@/core/ui/Screen';
import { Segmented } from '@/core/ui/Segmented';
import { colors } from '@/core/ui/theme';
import { StepHeader } from '@/features/onboarding/components/StepHeader';
import { useGoalViewModel } from '@/features/onboarding/useOnboardingViewModels';

const MEALS: MealsPerDay[] = ['2', '3', '3_snack', '4'];

export default function GoalScreen() {
  const { t } = useTranslation();
  const vm = useGoalViewModel();
  if (!vm) return <Redirect href="/onboarding/details" />;

  return (
    <Screen>
      <StepHeader step={3} title={t('onboarding.goal.title')} />

      <View>
        {vm.goals.map((goal) => (
          <OptionRow
            key={goal}
            title={t(`onboarding.goal.goals.${goal}.title`)}
            detail={t(`onboarding.goal.goals.${goal}.detail`)}
            tag={
              goal === vm.suggested && vm.goals.length > 1
                ? t('onboarding.goal.suggested')
                : undefined
            }
            selected={vm.goal === goal}
            onPress={() => vm.setGoal(goal)}
          />
        ))}
      </View>

      {vm.paces.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="heading">{t('onboarding.goal.paceTitle')}</AppText>
          <View>
            {vm.paces.map((p) => (
              <OptionRow
                key={p.pace}
                title={t(`onboarding.goal.pace.${p.pace}`)}
                tag={p.pace === 'steady' && p.allowed ? t('onboarding.goal.suggested') : undefined}
                detail={[
                  t('onboarding.goal.paceLine', {
                    weekly: formatSigned(p.weeklyKg),
                    kcal: formatSigned(p.kcalPerDay),
                  }),
                  p.weeks !== null && p.finishDate
                    ? t('onboarding.goal.paceFinish', {
                        target: vm.target.targetKg,
                        date: formatDate(p.finishDate),
                        weeks: p.weeks,
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join('\n')}
                selected={vm.pace === p.pace && p.allowed}
                disabled={!p.allowed}
                disabledNote={t('onboarding.goal.tooFast')}
                onPress={() => vm.setPace(p.pace)}
              />
            ))}
          </View>
          {vm.noSafePace ? <InfoBox tone="warn">{t('onboarding.goal.tooFast')}</InfoBox> : null}
          <AppText muted style={styles.note}>
            {t('onboarding.goal.paceNote')}
          </AppText>
        </View>
      ) : null}

      <View style={styles.section}>
        <AppText variant="label">{t('onboarding.goal.meals')}</AppText>
        <Segmented
          accessibilityLabel={t('onboarding.goal.meals')}
          value={vm.mealsPerDay}
          onChange={vm.setMealsPerDay}
          options={MEALS.map((m) => ({ value: m, label: t(`onboarding.goal.mealsOption.${m}`) }))}
        />
      </View>

      <Button label={t('onboarding.goal.next')} icon={ArrowRight} onPress={vm.next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
  },
});
