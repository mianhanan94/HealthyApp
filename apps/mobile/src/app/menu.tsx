import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Chip } from '@/core/ui/Chip';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { colors } from '@/core/ui/theme';
import { MealRow } from '@/features/menu/components/MealRow';
import { useMenuViewModel } from '@/features/menu/useMenuViewModel';

export default function MenuScreen() {
  const { t } = useTranslation();
  const vm = useMenuViewModel();

  return (
    <Screen>
      <PageHeading title={t('menu.title')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRail}
        contentContainerStyle={styles.chips}
      >
        {vm.canFilterFits ? (
          <>
            <Chip label={t('menu.fitsOnly')} selected={vm.fitsOnly} onPress={vm.toggleFitsOnly} />
            <View style={styles.divider} />
          </>
        ) : null}
        {vm.categories.map((c) => (
          <Chip
            key={c}
            label={t(`menu.category.${c}`)}
            selected={vm.category === c}
            onPress={() => vm.setCategory(c)}
          />
        ))}
      </ScrollView>
      {vm.meals.map((meal) => (
        <MealRow
          key={meal.id}
          meal={meal}
          fits={vm.fits(meal.id)}
          onPress={() => router.push({ pathname: '/meal/[id]', params: { id: meal.id } })}
        />
      ))}
      {vm.meals.length === 0 ? (
        <AppText muted style={styles.empty}>
          {vm.fitsOnly ? t('menu.emptyFits') : t('menu.empty')}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipsRail: {
    marginHorizontal: -20,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  empty: {
    paddingVertical: 40,
    fontSize: 14,
    lineHeight: 21,
  },
});
