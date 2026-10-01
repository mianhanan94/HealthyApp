import { router } from 'expo-router';
import { ArrowRight, ShoppingBag } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts } from '@/core/ui/theme';

export default function CartScreen() {
  const { t } = useTranslation();
  return (
    <Screen tab>
      <PageHeading eyebrow={t('cart.eyebrow')} title={t('cart.title')} />
      <View style={styles.empty}>
        <ShoppingBag size={38} strokeWidth={1.5} color={colors.text} />
        <AppText style={styles.emptyTitle}>{t('cart.empty')}</AppText>
        <AppText muted style={styles.emptyBody}>
          {t('cart.emptyBody')}
        </AppText>
      </View>
      <Button label={t('cart.browse')} icon={ArrowRight} onPress={() => router.push('/menu')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginTop: 48,
    gap: 12,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 26,
  },
  emptyBody: {
    fontSize: 14,
  },
});
