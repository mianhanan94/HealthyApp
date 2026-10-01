import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { LANGUAGES } from '@/core/i18n';
import { AppText } from '@/core/ui/AppText';
import { Chip } from '@/core/ui/Chip';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts } from '@/core/ui/theme';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
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
  const { t, i18n } = useTranslation();
  return (
    <Screen tab>
      <PageHeading eyebrow={t('profile.eyebrow')} title={t('profile.title')} />
      <View>
        <Section label={t('profile.account')}>
          <AppText style={styles.value}>{t('profile.guest')}</AppText>
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
                selected={i18n.language === lng}
                onPress={() => void i18n.changeLanguage(lng)}
              />
            ))}
          </View>
        </Section>
      </View>
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
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});
