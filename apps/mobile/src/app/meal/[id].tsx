import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check, Info, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatMoney, grams } from '@/core/format';
import { showToast } from '@/core/toast';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { PageHeading } from '@/core/ui/PageHeading';
import { Pill } from '@/core/ui/Pill';
import { Sheet } from '@/core/ui/Sheet';
import { Stepper } from '@/core/ui/Stepper';
import { colors, fonts, radius } from '@/core/ui/theme';
import { ModifierGroupView } from '@/features/meal/components/ModifierGroupView';
import { NutritionPanel } from '@/features/meal/components/NutritionPanel';
import {
  useMealBuilderViewModel,
  type SubmitResult,
} from '@/features/meal/useMealBuilderViewModel';

export default function MealScreen() {
  const { t } = useTranslation();
  const { id, lineId } = useLocalSearchParams<{ id: string; lineId?: string }>();
  const vm = useMealBuilderViewModel(id, lineId);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [confirmNewCart, setConfirmNewCart] = useState(false);

  if (!vm.item || !vm.nutrition || !vm.budget || !vm.fit) {
    return (
      <SafeAreaView style={styles.missing} edges={['bottom']}>
        <PageHeading title={t('meal.notFound')} />
        <Button
          label={t('meal.backToMenu')}
          icon={ArrowRight}
          onPress={() => router.replace('/menu')}
        />
      </SafeAreaView>
    );
  }
  const item = vm.item;
  const slot = vm.budget.slot ? t(`mealSlot.${vm.budget.slot}`).toLowerCase() : '';

  const handle = (result: SubmitResult) => {
    if (result.status === 'needs_new_cart') {
      setConfirmNewCart(true);
      return;
    }
    if (result.status === 'invalid') return;
    if (result.status === 'updated') showToast(t('meal.updated'));
    else
      showToast(
        result.capped
          ? t('meal.capped', { max: vm.maxQuantity })
          : t('meal.added', { name: item.name }),
      );
    router.back();
  };

  const allergenList = vm.allergens?.map((a) => t(`allergen.${a}`)).join(', ') ?? '';
  // Cross-contact list: only allergens the build doesn't already contain.
  const kitchenList = item.kitchenAlsoHandles
    .filter((a) => !vm.allergens?.includes(a))
    .map((a) => t(`allergen.${a}`))
    .join(', ');
  const blocked = (vm.issues?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View>
          <MealPhoto style={styles.photo} />
          <View style={styles.intro}>
            <View style={styles.tags}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('menu.nutritionInfo', {
                  badge: t(`menu.badge.${item.badge}`),
                })}
                onPress={() => setBadgeOpen(true)}
                style={styles.badge}
              >
                <AppText style={styles.badgeText}>{t(`menu.badge.${item.badge}`)}</AppText>
                <Info size={14} color={colors.primary} />
              </Pressable>
              {item.dietTags.map((tag) => (
                <Pill key={tag} label={t(`diet.${tag}`)} />
              ))}
            </View>
            <AppText variant="title">{item.name}</AppText>
            <AppText muted style={styles.description}>
              {item.description}
            </AppText>
            {!item.available ? <InfoBox tone="warn">{t('meal.unavailable')}</InfoBox> : null}
          </View>
        </View>

        <NutritionPanel
          nutrition={vm.nutrition}
          kcalDelta={vm.kcalDelta ?? 0}
          budget={vm.budget}
          unitPrice={vm.unitPrice ?? item.basePrice}
        />

        <View style={styles.body}>
          {!vm.hasPlan ? (
            <AppText muted style={styles.fitLine}>
              {t('meal.guestLine', { budget: vm.budget.kcal })}
            </AppText>
          ) : vm.fit.fits ? (
            <View style={styles.fitRow}>
              <View style={styles.fitIcon}>
                <Check size={14} color={colors.primary} strokeWidth={3} />
              </View>
              <AppText style={[styles.fitLine, styles.flex]}>
                {t('meal.fitLine', {
                  slot,
                  kcal: vm.nutrition.kcal,
                  budget: vm.budget.kcal,
                  protein: grams(vm.nutrition.proteinG),
                  budgetProtein: vm.budget.proteinG,
                })}
              </AppText>
            </View>
          ) : (
            <InfoBox tone="warn" icon={TriangleAlert}>
              <AppText style={styles.warnText}>
                {[
                  vm.fit.overKcal > 0 ? t('meal.overKcal', { kcal: vm.fit.overKcal, slot }) : null,
                  vm.fit.overSugarG > 0
                    ? t('meal.overSugar', { grams: vm.fit.overSugarG, slot })
                    : null,
                  t('meal.overNote'),
                ]
                  .filter(Boolean)
                  .join(' ')}
              </AppText>
            </InfoBox>
          )}
          {vm.hasPlan && vm.fit.proteinShortG >= 10 ? (
            <AppText muted style={styles.fitLine}>
              {t('meal.proteinShort', { grams: vm.fit.proteinShortG, slot })}
            </AppText>
          ) : null}

          {item.modifierGroups.map((group) => (
            <ModifierGroupView
              key={group.id}
              group={group}
              chosen={vm.chosen(group.id)}
              count={vm.count(group.id, group.type === 'stepper' ? group.defaultCount : 0)}
              limitHit={vm.limitHit === group.id}
              onChooseSingle={(optionId) => vm.chooseSingle(group.id, optionId)}
              onToggleMulti={(optionId) =>
                group.type === 'multi' && vm.toggleMulti(group.id, optionId, group.max)
              }
              onToggleRemove={(optionId) => vm.toggleRemove(group.id, optionId)}
              onSetCount={(c) => vm.setCount(group.id, c)}
            />
          ))}

          <View style={styles.section}>
            <AppText variant="eyebrow">{t('meal.ingredients')}</AppText>
            <AppText style={styles.ingredients}>
              {item.ingredients.map((i) => `${i.name} ${i.grams}g`).join(' · ')}
            </AppText>
          </View>

          <View style={styles.section}>
            <AppText variant="eyebrow">{t('meal.allergens')}</AppText>
            <InfoBox tone="allergen">
              <AppText style={styles.allergenText}>
                {allergenList ? t('meal.contains', { list: allergenList }) : t('meal.containsNone')}
              </AppText>
              {kitchenList ? (
                <AppText style={styles.allergenText}>
                  {t('meal.kitchen', { list: kitchenList })}
                </AppText>
              ) : null}
              <AppText muted style={styles.small}>
                {t('meal.allergyNote')}
              </AppText>
            </InfoBox>
          </View>

          <View style={[styles.section, styles.quantityRow]}>
            <AppText variant="eyebrow">{t('meal.quantity')}</AppText>
            <Stepper
              value={vm.quantity}
              min={1}
              max={vm.maxQuantity}
              onChange={vm.setQuantity}
              label={t('meal.quantity')}
              decreaseLabel={t('common.decrease')}
              increaseLabel={t('common.increase')}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          label={t(vm.isEditing ? 'meal.updateCart' : 'meal.addToCart', {
            price: formatMoney(vm.totalPrice ?? 0),
          })}
          icon={ArrowRight}
          disabled={blocked}
          onPress={() => handle(vm.submit())}
        />
      </View>

      <Sheet
        visible={badgeOpen}
        onClose={() => setBadgeOpen(false)}
        eyebrow={t(`menu.badge.${item.badge}`)}
        title={t('menu.badgeTitle')}
        closeLabel={t('common.close')}
      >
        <AppText muted style={styles.sheetText}>
          {t(`menu.badgeBody.${item.badge}`)}
        </AppText>
        <Button label={t('common.close')} icon={Check} onPress={() => setBadgeOpen(false)} />
      </Sheet>

      <Sheet
        visible={confirmNewCart}
        onClose={() => setConfirmNewCart(false)}
        title={t('meal.newCartTitle')}
        closeLabel={t('common.cancel')}
      >
        <AppText muted style={styles.sheetText}>
          {t('meal.newCartBody')}
        </AppText>
        <Button
          label={t('meal.newCartConfirm')}
          onPress={() => {
            setConfirmNewCart(false);
            handle(vm.startNewCart());
          }}
        />
        <Button
          variant="outline"
          label={t('common.cancel')}
          onPress={() => setConfirmNewCart(false)}
        />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  missing: {
    flex: 1,
    padding: 20,
    gap: 16,
    backgroundColor: colors.background,
  },
  photo: {
    height: 220,
  },
  intro: {
    padding: 20,
    gap: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 30,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  body: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  fitRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  fitIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitLine: {
    fontSize: 14,
    lineHeight: 20,
  },
  warnText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  ingredients: {
    fontSize: 14,
    lineHeight: 22,
  },
  allergenText: {
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  sheetText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
