import '@/core/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
  const { t } = useTranslation();
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: t('home.title') }} />
        <Stack.Screen name="body-check" options={{ title: t('bodyCheck.title') }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
