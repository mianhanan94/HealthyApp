import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { LANGUAGES } from '@/core/i18n';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { spacing } from '@/core/ui/theme';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();

  return (
    <Screen>
      <AppText variant="title">{t('home.title')}</AppText>
      <AppText muted>{t('home.subtitle')}</AppText>

      <Button label={t('home.bodyCheck')} onPress={() => router.push('/body-check')} />

      <AppText variant="label">{t('home.language')}</AppText>
      <View style={styles.row}>
        {LANGUAGES.map((lng) => (
          <Button
            key={lng}
            label={t(`language.${lng}`)}
            disabled={i18n.language === lng}
            onPress={() => void i18n.changeLanguage(lng)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
