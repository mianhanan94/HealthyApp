import { router } from 'expo-router';
import { ArrowRight, ChevronRight, MapPin, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { ProgressRing } from '@/core/ui/ProgressRing';
import { Screen } from '@/core/ui/Screen';
import { colors, fonts, radius, shadows, spacing, typography } from '@/core/ui/theme';
import { useHomeViewModel } from '@/features/home/useHomeViewModel';
import { FeaturedMealCard } from '@/features/menu/components/FeaturedMealCard';
import { MealTile } from '@/features/menu/components/MealTile';

const ON_PRIMARY_MUTED = 'rgba(255, 255, 255, 0.7)';

export default function HomeScreen() {
  const { t } = useTranslation();
  const vm = useHomeViewModel();
  // Meal detail and cart are the next features; until then meals open the menu.
  const openMenu = () => router.push('/menu');

  return (
    <Screen tab>
      <View style={styles.header}>
        <AppText muted style={styles.greeting}>
          {t(`home.greeting.${vm.greeting}`)}
        </AppText>
        <AppText style={styles.name} numberOfLines={1}>
          {vm.userName ?? t('home.guestName')}
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
          <AppText style={[styles.onPrimaryMuted, styles.progressText]}>
            {t('home.guestPrompt')}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/body-check')}
          style={styles.progressButton}
        >
          <AppText style={styles.progressButtonText}>{t('common.setMyPlan')}</AppText>
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
          <FeaturedMealCard meal={vm.featured} onCustomize={openMenu} onAdd={openMenu} />
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
            <MealTile key={meal.id} meal={meal} onPress={openMenu} />
          ))}
        </ScrollView>
      </View>
    </Screen>
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
});
