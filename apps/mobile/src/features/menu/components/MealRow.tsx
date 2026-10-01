import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney, grams } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { colors, fonts, radius, shadows } from '@/core/ui/theme';

import type { MenuItem } from '../menu.types';

interface MealRowProps {
  meal: MenuItem;
  fits: boolean;
  onPress: () => void;
}

/** Menu list row (Lovable `MealRow`). "Fits" shows only when it does; we never shame. */
export function MealRow({ meal, fits, onPress }: MealRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meal.name}, ${t('common.kcalProtein', {
        kcal: meal.base.kcal,
        protein: grams(meal.base.proteinG),
      })}, ${formatMoney(meal.basePrice)}`}
      onPress={onPress}
      style={[styles.row, !meal.available && styles.unavailable]}
    >
      <MealPhoto style={styles.photo} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <AppText style={styles.category}>{t(`menu.category.${meal.category}`)}</AppText>
          {fits ? (
            <View style={styles.fits}>
              <AppText style={styles.fitsText}>{t('common.fits')}</AppText>
            </View>
          ) : null}
        </View>
        <AppText style={styles.name} numberOfLines={2}>
          {meal.name}
        </AppText>
        <AppText muted style={styles.numbers}>
          {t('common.kcalProtein', { kcal: meal.base.kcal, protein: grams(meal.base.proteinG) })}
        </AppText>
        <View style={styles.bottomLine}>
          <AppText style={styles.price}>{formatMoney(meal.basePrice)}</AppText>
          <View style={styles.add} accessibilityElementsHidden>
            <Plus size={17} color={colors.text} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    boxShadow: shadows.card,
  },
  unavailable: {
    opacity: 0.5,
  },
  photo: {
    width: 108,
    height: 116,
    borderRadius: radius.lg,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 20,
  },
  category: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    color: colors.success,
  },
  fits: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  fitsText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  name: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 19,
  },
  numbers: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 14,
  },
  bottomLine: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  add: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.commerce,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
