import { Info, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { colors, fonts, radius, shadows } from '@/core/ui/theme';

import type { Meal } from '../menu.types';

interface MealRowProps {
  meal: Meal;
  onPress: () => void;
  onAdd: () => void;
}

export function MealRow({ meal, onPress, onAdd }: MealRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <MealPhoto style={styles.photo} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <AppText style={styles.category}>{t(`menu.category.${meal.category}`)}</AppText>
          <Info
            size={15}
            color={colors.textMuted}
            accessibilityLabel={t('menu.nutritionInfo', { badge: t(`menu.badge.${meal.badge}`) })}
          />
        </View>
        <AppText style={styles.name} numberOfLines={2}>
          {meal.name}
        </AppText>
        <AppText muted style={styles.numbers}>
          {t('common.kcalProtein', { kcal: meal.kcal, protein: meal.proteinG })}
        </AppText>
        <View style={styles.bottomLine}>
          <AppText style={styles.price}>{formatMoney(meal.price)}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.add', { name: meal.name })}
            onPress={onAdd}
            hitSlop={8}
            style={styles.add}
          >
            <Plus size={17} color={colors.text} />
          </Pressable>
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
  },
  category: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    color: colors.success,
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
