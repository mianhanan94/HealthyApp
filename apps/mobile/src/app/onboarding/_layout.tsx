import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors, fonts } from '@/core/ui/theme';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        title: t('onboarding.title'),
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
