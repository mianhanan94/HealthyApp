import { MAX_LINE_QUANTITY, type MenuItem } from '@healthyapp/shared';
import { router } from 'expo-router';
import { ArrowRight, ChevronRight, MapPin, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { grams } from '@/core/format';
import { showToast } from '@/core/toast';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { ProgressBar } from '@/core/ui/ProgressBar';
import { ProgressRing } from '@/core/ui/ProgressRing';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts, radius, shadows, spacing, typography } from '@/core/ui/theme';
import { ViewCartBar } from '@/core/ui/ViewCartBar';
import { useHomeViewModel } from '@/features/home/useHomeViewModel';
import { FeaturedMealCard } from '@/features/menu/components/FeaturedMealCard';
import { MealTile } from '@/features/menu/components/MealTile';
import { startOnboarding } from '@/features/onboarding/useOnboardingViewModels';

const ON_PRIMARY_MUTED = 'rgba(255, 255, 255, 0.7)';

export default function HomeScreen() {
  const { t } = useTranslation();
  const vm = useHomeViewModel();
  const openMenu = () => router.push('/menu');
  const openMeal = (item: MenuItem) =>
    router.push({ pathname: '/meal/[id]', params: { id: item.id } });
  const quickAdd = (item: MenuItem) => {
    const result = vm.quickAdd(item);
    if (result === 'added') showToast(t('meal.added', { name: item.name }));
    else if (result === 'capped') showToast(t('meal.capped', { max: MAX_LINE_QUANTITY }));
    // Another store's cart: let the customise screen ask before clearing it.
    else openMeal(item);
  };

  return (
    <View style={styles.flex}>
      <Screen tab>
        <View style={styles.header}>
          <AppText muted style={styles.greeting}>
            {t(`home.greeting.${vm.greeting}`)}
          </AppText>
          <AppText style={styles.name} numberOfLines={1}>
            {vm.firstName ?? t('home.guestName')}
          </AppText>
          <View style={styles.location}>
            <MapPin size={16} color={colors.primary} />
            <AppText style={styles.locationText} numberOfLines={1}>
              {vm.deliveryAddress ?? t('home.setLocation')}
            </AppText>
            <ChevronRight size={16} color={colors.primary} />
          </View>
        </View>

        <View style={styles.progressCard}>
          <View>
            <AppText style={styles.onPrimaryMuted}>{t('home.today')}</AppText>
            <AppText style={styles.progressTitle}>{t('home.dailyProgress')}</AppText>
          </View>
          <View style={styles.progressRow}>
            <ProgressRing
              progress={vm.todayProgress}
              size={104}
              thickness={11}
              color={colors.success}
              trackColor={colors.inkPanel}
            >
              <AppText style={styles.ringValue}>{Math.round(vm.todayProgress * 100)}%</AppText>
              <AppText style={styles.ringLabel}>{t('home.ofYourDay')}</AppText>
            </ProgressRing>
            {vm.plan ? (
              <View style={styles.bars}>
                <View style={styles.barBlock}>
                  <View style={styles.barLabels}>
                    <AppText style={styles.barLabel}>{t('nutrient.protein')}</AppText>
                    <AppText style={styles.barValue}>
                      {t('home.proteinOf', {
                        value: grams(vm.consumed.proteinG),
                        target: vm.plan.proteinG,
                      })}
                    </AppText>
                  </View>
                  <ProgressBar
                    progress={vm.consumed.proteinG / vm.plan.proteinG}
                    trackColor={colors.inkPanel}
                  />
                </View>
                <View style={styles.barBlock}>
                  <View style={styles.barLabels}>
                    <AppText style={styles.barLabel}>{t('nutrient.sugar')}</AppText>
                    <AppText style={styles.barValue}>
                      {t('home.sugarOf', {
                        value: grams(vm.consumed.sugarG),
                        max: vm.plan.sugarMaxG,
                      })}
                    </AppText>
                  </View>
                  <ProgressBar
                    progress={vm.consumed.sugarG / vm.plan.sugarMaxG}
                    color={colors.commerce}
                    trackColor={colors.inkPanel}
                  />
                </View>
              </View>
            ) : (
              <AppText style={[styles.onPrimaryMuted, styles.progressText]}>
                {t('home.guestPrompt')}
              </AppText>
            )}
          </View>
          {vm.plan ? (
            <AppText style={[styles.onPrimaryMuted, styles.small]}>{t('home.firstOrder')}</AppText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => (vm.plan ? router.navigate('/target') : startOnboarding(null))}
            style={styles.progressButton}
          >
            <AppText style={styles.progressButtonText}>
              {vm.plan ? t('home.seeTarget') : t('common.setMyPlan')}
            </AppText>
            <ArrowRight size={20} color={colors.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.flex}>
              <AppText variant="eyebrow" style={styles.successText}>
                {t('home.curatedEyebrow')}
              </AppText>
              <AppText style={styles.sectionTitleLarge}>{t('home.curatedTitle')}</AppText>
            </View>
            <Button variant="ghost" size="sm" label={t('home.viewAll')} onPress={openMenu} />
          </View>
          {vm.featured ? (
            <FeaturedMealCard
              meal={vm.featured}
              onCustomize={() => vm.featured && openMeal(vm.featured)}
              onAdd={() => vm.featured && quickAdd(vm.featured)}
            />
          ) : null}
        </View>

        <Pressable accessibilityRole="button" onPress={openMenu} style={styles.guidance}>
          <View style={styles.guidanceIcon}>
            <Sparkles size={20} color={colors.text} />
          </View>
          <View style={styles.flex}>
            <AppText style={styles.guidanceTitle}>{t('home.guidanceTitle')}</AppText>
            <AppText muted style={styles.guidanceBody}>
              {t('home.guidanceBody')}
            </AppText>
          </View>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText style={[styles.sectionTitle, styles.flex]}>{t('home.moreToExplore')}</AppText>
            <Button
              variant="ghost"
              size="sm"
              label={t('home.menu')}
              icon={ArrowRight}
              onPress={openMenu}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rail}
            contentContainerStyle={styles.railContent}
          >
            {vm.more.map((meal) => (
              <MealTile
                key={meal.id}
                meal={meal}
                fits={vm.fits(meal)}
                onPress={() => openMeal(meal)}
              />
            ))}
          </ScrollView>
        </View>
        {vm.cartCount > 0 ? <View style={styles.barSpace} /> : null}
      </Screen>
      <ViewCartBar count={vm.cartCount} total={vm.cartTotal} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.primary,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    flexShrink: 1,
  },
  progressCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 20,
    gap: 20,
    boxShadow: shadows.sheet,
  },
  onPrimaryMuted: {
    color: ON_PRIMARY_MUTED,
    fontSize: 14,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: -8,
  },
  progressTitle: {
    marginTop: 4,
    color: colors.onPrimary,
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    lineHeight: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressText: {
    flex: 1,
    lineHeight: 20,
  },
  bars: {
    flex: 1,
    gap: 16,
  },
  barBlock: {
    gap: 6,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  barLabel: {
    color: ON_PRIMARY_MUTED,
    fontSize: 12,
  },
  barValue: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  ringValue: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 26,
    color: colors.onPrimary,
  },
  ringLabel: {
    fontSize: 10,
    lineHeight: 12,
    color: ON_PRIMARY_MUTED,
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  section: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  successText: {
    color: colors.success,
  },
  sectionTitleLarge: {
    marginTop: 4,
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 28,
    color: colors.primary,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.primary,
  },
  guidance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(237, 153, 14, 0.3)',
    backgroundColor: colors.commerceSoft,
  },
  guidanceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.commerce,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceTitle: {
    fontFamily: fonts.bold,
  },
  guidanceBody: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 20,
  },
  rail: {
    marginHorizontal: -20,
  },
  railContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  barSpace: {
    height: 56,
  },
});
