import type { MealBudget, Nutrition } from '@healthyapp/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatMoney, formatNumber, formatSigned, grams } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { ProgressBar } from '@/core/ui/ProgressBar';
import { colors, fonts, typography } from '@/core/ui/theme';

interface NutritionPanelProps {
  nutrition: Nutrition;
  kcalDelta: number;
  budget: MealBudget;
  unitPrice: number;
}

const MUTED = 'rgba(255, 255, 255, 0.7)';

/** Live totals that update with every change (spec 3.1 sticky header). */
export function NutritionPanel({ nutrition, kcalDelta, budget, unitPrice }: NutritionPanelProps) {
  const { t } = useTranslation();
  const cells = [
    {
      key: 'protein',
      label: t('nutrient.protein'),
      value: `${grams(nutrition.proteinG)}g`,
      progress: budget.proteinG ? nutrition.proteinG / budget.proteinG : 0,
      // More protein than the target is fine: no warning colour.
      overColor: colors.success,
    },
    {
      key: 'carbs',
      label: t('nutrient.carbs'),
      value: `${grams(nutrition.carbsG)}g`,
      progress: null,
      overColor: colors.commerce,
    },
    {
      key: 'fat',
      label: t('nutrient.fat'),
      value: `${grams(nutrition.fatG)}g`,
      progress: null,
      overColor: colors.commerce,
    },
    {
      key: 'sugar',
      label: t('nutrient.sugar'),
      value: `${grams(nutrition.sugarG)}g`,
      progress: budget.sugarMaxG ? nutrition.sugarG / budget.sugarMaxG : 0,
      overColor: colors.commerce,
    },
  ];

  return (
    <View style={styles.panel}>
      <View style={styles.topRow}>
        <View style={styles.kcalBlock}>
          <AppText style={styles.kcal} accessibilityLiveRegion="polite">
            {formatNumber(nutrition.kcal)}
          </AppText>
          <AppText style={styles.kcalUnit}>{t('nutrient.kcal')}</AppText>
          {kcalDelta !== 0 ? (
            <View style={styles.delta}>
              <AppText style={styles.deltaText}>
                {t('meal.vsOriginal', { delta: formatSigned(kcalDelta) })}
              </AppText>
            </View>
          ) : null}
        </View>
        <AppText style={styles.price}>{formatMoney(unitPrice)}</AppText>
      </View>
      <ProgressBar
        progress={budget.kcal ? nutrition.kcal / budget.kcal : 0}
        trackColor={colors.primary}
        height={6}
      />
      <View style={styles.cells}>
        {cells.map((c) => (
          <View key={c.key} style={styles.cell}>
            <AppText style={styles.cellValue}>{c.value}</AppText>
            <AppText style={styles.cellLabel}>{c.label}</AppText>
            {c.progress !== null ? (
              <ProgressBar
                progress={c.progress}
                trackColor={colors.primary}
                overColor={c.overColor}
                height={3}
              />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.inkPanel,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.success,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  kcalBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  kcal: {
    ...typography.number,
    fontSize: 36,
    lineHeight: 38,
    color: colors.onPrimary,
  },
  kcalUnit: {
    color: MUTED,
    fontFamily: fonts.bold,
  },
  delta: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  deltaText: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  price: {
    color: colors.onPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 20,
  },
  cells: {
    flexDirection: 'row',
    gap: 12,
  },
  cell: {
    flex: 1,
    gap: 4,
  },
  cellValue: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  cellLabel: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 14,
  },
});
