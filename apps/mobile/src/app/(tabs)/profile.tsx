import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { LANGUAGES } from '@/core/i18n';
import { formatNumber } from '@/core/format';
import { useSettingsStore } from '@/core/settings.store';
import { showToast } from '@/core/toast';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Chip } from '@/core/ui/Chip';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { Sheet } from '@/core/ui/Sheet';
import { colors, fonts } from '@/core/ui/theme';
import { startOnboarding } from '@/features/onboarding/useOnboardingViewModels';
import { usePlan, useProfileStore } from '@/features/profile/profile.store';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="eyebrow" muted>
        {label}
      </AppText>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile, plan } = usePlan();
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Screen tab>
      <PageHeading eyebrow={t('profile.eyebrow')} title={profile?.name ?? t('profile.title')} />
      <View>
        <Section label={t('profile.account')}>
          <AppText style={styles.value}>{t('profile.guest')}</AppText>
        </Section>
        <Section label={t('profile.body')}>
          <AppText style={styles.value}>
            {profile
              ? t('profile.bodySummary', {
                  age: profile.body.age,
                  height: profile.body.heightCm,
                  weight: profile.body.weightKg,
                })
              : t('profile.noBody')}
          </AppText>
        </Section>
        <Section label={t('profile.nutrition')}>
          {plan ? (
            <AppText style={styles.value}>
              {t('profile.planSummary', {
                kcal: formatNumber(plan.kcal),
                goal: t(`onboarding.goal.goals.${plan.goal}.title`),
              })}
            </AppText>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            style={styles.link}
            label={profile ? t('profile.updatePlan') : t('profile.setPlan')}
            onPress={() => startOnboarding(profile)}
          />
        </Section>
        <Section label={t('profile.delivery')}>
          <AppText style={styles.value}>{t('profile.noAddress')}</AppText>
        </Section>
        <Section label={t('profile.language')}>
          <View style={styles.chips}>
            {LANGUAGES.map((lng) => (
              <Chip
                key={lng}
                label={t(`language.${lng}`)}
                selected={language === lng}
                onPress={() => setLanguage(lng)}
              />
            ))}
          </View>
        </Section>
        {profile ? (
          <Section label={t('profile.privacy')}>
            <Button
              variant="ghost"
              size="sm"
              style={styles.link}
              label={t('profile.deleteBody')}
              onPress={() => setConfirmDelete(true)}
            />
          </Section>
        ) : null}
      </View>

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('profile.deleteTitle')}
        closeLabel={t('common.cancel')}
      >
        <AppText muted style={styles.sheetText}>
          {t('profile.deleteBodyText')}
        </AppText>
        <Button
          label={t('profile.deleteConfirm')}
          onPress={() => {
            clearProfile();
            setConfirmDelete(false);
            showToast(t('profile.deleted'));
          }}
        />
        <Button
          variant="outline"
          label={t('common.cancel')}
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 20,
    gap: 8,
  },
  value: {
    fontFamily: fonts.bold,
  },
  link: {
    alignSelf: 'flex-start',
    marginLeft: -12,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
