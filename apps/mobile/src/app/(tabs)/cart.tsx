import { buildChanges, MAX_LINE_QUANTITY, type PricedLine } from '@healthyapp/shared';
import { router } from 'expo-router';
import { ArrowRight, ShoppingBag, TriangleAlert } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { describeChanges, formatMoney, formatNumber, grams } from '@/core/format';
import { showToast } from '@/core/toast';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { InfoBox } from '@/core/ui/InfoBox';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { Stepper } from '@/core/ui/Stepper';
import { colors, fonts, radius } from '@/core/ui/theme';
import { useCartStore, usePricedCart } from '@/features/cart/cart.store';
import { usePlan } from '@/features/profile/profile.store';

function CartLineRow({ priced }: { priced: PricedLine }) {
  const { t } = useTranslation();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const { line, item, problem } = priced;
  const remove = () => setQuantity(line.id, 0);

  if (!item) {
    return (
      <View style={styles.line}>
        <View style={styles.lineBody}>
          <InfoBox tone="warn" icon={TriangleAlert}>
            {t('cart.missing')}
          </InfoBox>
        </View>
        <Button variant="ghost" size="sm" label={t('common.remove')} onPress={remove} />
      </View>
    );
  }

  const summary = describeChanges(t, buildChanges(item, line.selection));
  const edit = () =>
    router.push({ pathname: '/meal/[id]', params: { id: item.id, lineId: line.id } });

  return (
    <View style={styles.line}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('cart.edit', { name: item.name })}
        onPress={edit}
        style={styles.lineTap}
      >
        <MealPhoto style={styles.thumb} />
        <View style={styles.lineBody}>
          <AppText style={styles.lineName}>{item.name}</AppText>
          {summary ? (
            <AppText muted style={styles.small}>
              {summary}
            </AppText>
          ) : null}
          <AppText muted style={styles.small}>
            {t('common.kcalProtein', {
              kcal: priced.unitNutrition.kcal,
              protein: grams(priced.unitNutrition.proteinG),
            })}
          </AppText>
          {problem === 'build_invalid' ? (
            <AppText style={styles.problem}>{t('cart.invalid')}</AppText>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.lineSide}>
        <AppText style={styles.linePrice}>{formatMoney(priced.lineTotal)}</AppText>
        <Stepper
          value={line.quantity}
          min={1}
          max={MAX_LINE_QUANTITY}
          onChange={(q) => setQuantity(line.id, q)}
          onRemove={remove}
          removeLabel={t('common.remove')}
          label={t('meal.quantity')}
          decreaseLabel={t('common.decrease')}
          increaseLabel={t('common.increase')}
        />
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { t } = useTranslation();
  const priced = usePricedCart();
  const clear = useCartStore((s) => s.clear);
  const { plan } = usePlan();

  if (priced.lines.length === 0) {
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

  return (
    <Screen tab>
      <PageHeading
        eyebrow={t('cart.eyebrow')}
        title={t('cart.title')}
        intro={t('cart.itemCount', { count: priced.itemCount })}
      />

      <View>
        {priced.lines.map((p) => (
          <CartLineRow key={p.line.id} priced={p} />
        ))}
      </View>

      <View style={styles.panel}>
        <AppText variant="eyebrow" style={styles.panelEyebrow}>
          {t('cart.orderNutrition')}
        </AppText>
        <View style={styles.panelRow}>
          {[
            { label: t('nutrient.kcal'), value: formatNumber(priced.nutrition.kcal) },
            { label: t('nutrient.protein'), value: `${grams(priced.nutrition.proteinG)}g` },
            { label: t('nutrient.sugar'), value: `${grams(priced.nutrition.sugarG)}g` },
          ].map((c) => (
            <View key={c.label} style={styles.panelCell}>
              <AppText style={styles.panelValue}>{c.value}</AppText>
              <AppText style={styles.panelLabel}>{c.label}</AppText>
            </View>
          ))}
        </View>
        <AppText style={styles.panelNote}>
          {plan
            ? // Nothing ordered yet today: the day's tally starts with this order.
              t('cart.afterOrder', {
                kcal: formatNumber(priced.nutrition.kcal),
                target: formatNumber(plan.kcal),
              })
            : t('cart.afterOrderGuest')}
        </AppText>
      </View>

      <View style={styles.bill}>
        <View style={styles.billRow}>
          <AppText>{t('cart.subtotal')}</AppText>
          <AppText style={styles.billValue}>{formatMoney(priced.subtotal)}</AppText>
        </View>
        <View style={styles.billRow}>
          <AppText muted>{t('cart.deliveryFee')}</AppText>
          <AppText muted>{t('cart.deliveryAtCheckout')}</AppText>
        </View>
      </View>

      <Button label={t('cart.checkout')} icon={ArrowRight} disabled onPress={() => undefined} />
      <AppText muted style={styles.small}>
        {t('cart.checkoutSoon')}
      </AppText>
      <Button
        variant="ghost"
        size="sm"
        label={t('cart.clear')}
        style={styles.clear}
        onPress={() => {
          clear();
          showToast(t('cart.cleared'));
        }}
      />
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
  line: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  lineTap: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  lineBody: {
    flex: 1,
    gap: 3,
  },
  lineName: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
  },
  problem: {
    fontSize: 12,
    color: colors.danger,
    fontFamily: fonts.semiBold,
  },
  lineSide: {
    alignItems: 'flex-end',
    gap: 8,
  },
  linePrice: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  panel: {
    backgroundColor: colors.inkPanel,
    borderRadius: radius.xl,
    padding: 20,
    gap: 14,
  },
  panelEyebrow: {
    color: colors.accentLight,
  },
  panelRow: {
    flexDirection: 'row',
  },
  panelCell: {
    flex: 1,
    gap: 2,
  },
  panelValue: {
    color: colors.onPrimary,
    fontFamily: fonts.displayBold,
    fontSize: 22,
  },
  panelLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  panelNote: {
    color: colors.onPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  bill: {
    gap: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billValue: {
    fontFamily: fonts.bold,
  },
  clear: {
    alignSelf: 'center',
  },
});
