import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { colors, fonts, radius, shadows } from '@/core/ui/theme';

import type { MenuItem } from '../menu.types';

/** Compact card for horizontal rails. */
export function MealTile({
  meal,
  fits,
  onPress,
}: {
  meal: MenuItem;
  fits: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={meal.name}
      onPress={onPress}
      style={styles.tile}
    >
      <MealPhoto style={styles.photo} />
      {fits ? (
        <View style={styles.fits}>
          <AppText style={styles.fitsText}>{t('common.fits')}</AppText>
        </View>
      ) : null}
      <View style={styles.body}>
        <AppText style={styles.name} numberOfLines={2}>
          {meal.name}
        </AppText>
        <View style={styles.line}>
          <AppText muted style={styles.small}>
            {t('common.kcal', { value: meal.base.kcal })}
          </AppText>
          <AppText style={[styles.small, styles.price]}>{formatMoney(meal.basePrice)}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 172,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  photo: {
    height: 118,
  },
  fits: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.card,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fitsText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  body: {
    padding: 12,
    gap: 8,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 17,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  price: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
