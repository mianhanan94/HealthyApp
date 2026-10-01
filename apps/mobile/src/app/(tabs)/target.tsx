import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { colors, radius } from '@/core/ui/theme';

export default function TargetScreen() {
  const { t } = useTranslation();
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
        onPress={() => router.push('/body-check')}
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
});
