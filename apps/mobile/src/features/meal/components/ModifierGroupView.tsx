import type { ModifierGroup } from '@healthyapp/shared';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { formatMoney, formatOptionCost, grams } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { OptionRow } from '@/core/ui/OptionRow';
import { Stepper } from '@/core/ui/Stepper';
import { colors, fonts } from '@/core/ui/theme';

interface ModifierGroupViewProps {
  group: ModifierGroup;
  chosen: string[];
  count: number;
  limitHit: boolean;
  onChooseSingle: (optionId: string) => void;
  onToggleMulti: (optionId: string) => void;
  onToggleRemove: (optionId: string) => void;
  onSetCount: (count: number) => void;
}

/** One modifier group; every option shows its kcal and price cost before tapping (spec 3.1). */
export function ModifierGroupView({
  group,
  chosen,
  count,
  limitHit,
  onChooseSingle,
  onToggleMulti,
  onToggleRemove,
  onSetCount,
}: ModifierGroupViewProps) {
  const { t } = useTranslation();
  const none = t('meal.noChange');

  const rule =
    group.type === 'single'
      ? t('meal.rules.required')
      : group.type === 'multi'
        ? t('meal.rules.upTo', { max: group.max })
        : group.type === 'remove'
          ? t('meal.rules.remove')
          : t('meal.rules.stepper', { min: group.min, max: group.max });

  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <AppText variant="eyebrow">{group.name}</AppText>
        <AppText muted style={styles.rule}>
          {rule}
        </AppText>
      </View>

      {group.type === 'stepper' ? (
        <View style={styles.stepperRow}>
          <View style={styles.stepperText}>
            <AppText style={styles.optionName}>{group.option.name}</AppText>
            <AppText muted style={styles.small}>
              {t('meal.eachUnit', {
                unit: group.unit,
                kcal: group.option.delta.kcal,
                protein: grams(group.option.delta.proteinG),
                price: formatMoney(group.option.priceDelta),
              })}
            </AppText>
            {!group.option.available ? (
              <AppText style={styles.out}>{t('meal.outToday')}</AppText>
            ) : null}
          </View>
          <Stepper
            value={count}
            min={group.min}
            // Out of stock: can go down to the default, not above it.
            max={group.option.available ? group.max : Math.min(group.max, group.defaultCount)}
            onChange={onSetCount}
            label={group.name}
            decreaseLabel={t('common.decrease')}
            increaseLabel={t('common.increase')}
          />
        </View>
      ) : (
        group.options.map((option) => {
          const isChosen = chosen.includes(option.id);
          const isRemove = group.type === 'remove';
          const cost = formatOptionCost(option.delta.kcal, option.priceDelta, none);
          return (
            <OptionRow
              key={option.id}
              role={group.type === 'single' ? 'radio' : 'checkbox'}
              title={option.name}
              trailing={cost}
              selected={isChosen}
              // You can always un-pick or remove, even if out of stock.
              disabled={!option.available && !isChosen && !isRemove}
              disabledNote={t('meal.outToday')}
              onPress={() =>
                group.type === 'single'
                  ? onChooseSingle(option.id)
                  : group.type === 'multi'
                    ? onToggleMulti(option.id)
                    : onToggleRemove(option.id)
              }
            />
          );
        })
      )}
      {limitHit && group.type === 'multi' ? (
        <AppText style={styles.limit}>{t('meal.maxReached', { max: group.max })}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  rule: {
    fontSize: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  stepperText: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  out: {
    fontSize: 12,
    color: colors.danger,
  },
  limit: {
    marginTop: 8,
    fontSize: 12,
    color: colors.commerce,
    fontFamily: fonts.bold,
  },
});
