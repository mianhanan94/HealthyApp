import type { NutritionPlan } from '@healthyapp/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatNumber } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { colors, fonts, radius, typography } from '@/core/ui/theme';

const MUTED = 'rgba(255, 255, 255, 0.7)';

/** Daily target panel + macro grid + split bar (spec 1.7 A). Used on the plan step and Target. */
export function DailyTargetPanel({ plan, eyebrow }: { plan: NutritionPlan; eyebrow: string }) {
  const { t } = useTranslation();
  // "About 2,390": maintenance is an estimate, so show it to the nearest 10 (spec 1.7 A).
  const tdee = Math.round(plan.tdee / 10) * 10;
  const diff = Math.abs(plan.kcal - tdee);
  const burns =
    diff < 25
      ? t('onboarding.plan.burnsSame', { tdee: formatNumber(tdee) })
      : plan.kcal < tdee
        ? t('onboarding.plan.burnsLess', { tdee: formatNumber(tdee), diff: formatNumber(diff) })
        : t('onboarding.plan.burnsMore', { tdee: formatNumber(tdee), diff: formatNumber(diff) });

  const cells = [
    {
      label: t('nutrient.protein'),
      value: t('onboarding.plan.grams', { value: plan.proteinG }),
      note: t('onboarding.plan.percent', { value: plan.macroPercent.protein }),
    },
    {
      label: t('nutrient.carbs'),
      value: t('onboarding.plan.grams', { value: plan.carbsG }),
      note: t('onboarding.plan.percent', { value: plan.macroPercent.carbs }),
    },
    {
      label: t('nutrient.fat'),
      value: t('onboarding.plan.grams', { value: plan.fatG }),
      note: t('onboarding.plan.percent', { value: plan.macroPercent.fat }),
    },
    {
      label: t('nutrient.fibre'),
      value: t('onboarding.plan.grams', { value: plan.fibreMinG }),
      note: t('onboarding.plan.min', { value: plan.fibreMinG }),
    },
    {
      label: t('nutrient.addedSugar'),
      value: t('onboarding.plan.grams', { value: plan.sugarMaxG }),
      note: t('onboarding.plan.max', { value: plan.sugarMaxG }),
    },
    {
      label: t('nutrient.water'),
      value: t('onboarding.plan.litres', { value: plan.waterL }),
      note: '',
    },
  ];

  const p = plan.macroPercent;
  return (
    <View style={styles.panel}>
      <AppText variant="eyebrow" style={styles.eyebrow}>
        {eyebrow}
      </AppText>
      <View style={styles.kcalRow}>
        <AppText style={styles.kcal}>{formatNumber(plan.kcal)}</AppText>
        <AppText style={styles.kcalUnit}>{t('onboarding.plan.aDay')}</AppText>
      </View>
      <AppText style={styles.burns}>{burns}</AppText>

      <View style={styles.grid}>
        {cells.map((c) => (
          <View key={c.label} style={styles.cell}>
            <AppText style={styles.cellValue}>{c.value}</AppText>
            <AppText style={styles.cellLabel}>{c.label}</AppText>
            {c.note ? <AppText style={styles.cellNote}>{c.note}</AppText> : null}
          </View>
        ))}
      </View>

      <View style={styles.split} accessibilityElementsHidden>
        <View style={{ flex: p.protein, backgroundColor: colors.success }} />
        <View style={{ flex: p.carbs, backgroundColor: colors.onPrimary }} />
        <View style={{ flex: p.fat, backgroundColor: colors.accentLight }} />
      </View>
    </View>
  );
}

/** Per-meal table; rows always add up to the day (spec 1.7 B). */
export function PerMealTable({ plan }: { plan: NutritionPlan }) {
  const { t } = useTranslation();
  const header = [
    t('nutrient.kcal'),
    t('nutrient.protein'),
    t('nutrient.carbs'),
    t('nutrient.fat'),
    t('nutrient.fibre'),
  ];
  const rows = [
    ...plan.meals.map((m) => ({
      key: m.slot,
      label: `${t(`mealSlot.${m.slot}`)} (${m.percent}%)`,
      values: [
        formatNumber(m.kcal),
        `${m.proteinG}g`,
        `${m.carbsG}g`,
        `${m.fatG}g`,
        `${m.fibreG}g`,
      ],
      total: false,
    })),
    {
      key: 'day',
      label: t('onboarding.plan.day'),
      values: [
        formatNumber(plan.kcal),
        `${plan.proteinG}g`,
        `${plan.carbsG}g`,
        `${plan.fatG}g`,
        `${plan.fibreMinG}g`,
      ],
      total: true,
    },
  ];

  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.thead]}>
        <AppText style={[styles.td, styles.first, styles.th]}> </AppText>
        {header.map((h) => (
          <AppText key={h} style={[styles.td, styles.th]} numberOfLines={1}>
            {h}
          </AppText>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r.key} style={[styles.tr, r.total && styles.totalRow]}>
          <AppText style={[styles.td, styles.first, r.total && styles.bold]} numberOfLines={2}>
            {r.label}
          </AppText>
          {r.values.map((v, i) => (
            <AppText key={i} style={[styles.td, r.total && styles.bold]}>
              {v}
            </AppText>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.inkPanel,
    borderRadius: radius.xl,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    color: colors.accentLight,
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  kcal: {
    ...typography.number,
    color: colors.onPrimary,
  },
  kcalUnit: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
  },
  burns: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  cell: {
    width: '33.33%',
    paddingVertical: 12,
    paddingRight: 8,
    gap: 2,
  },
  cellValue: {
    color: colors.onPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 20,
  },
  cellLabel: {
    color: colors.onPrimary,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  cellNote: {
    color: MUTED,
    fontSize: 11,
  },
  split: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  thead: {
    borderTopWidth: 0,
    backgroundColor: colors.secondary,
  },
  totalRow: {
    backgroundColor: colors.accentSoft,
  },
  td: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  first: {
    flex: 1.9,
    textAlign: 'left',
  },
  th: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textMuted,
  },
  bold: {
    fontFamily: fonts.bold,
  },
});
