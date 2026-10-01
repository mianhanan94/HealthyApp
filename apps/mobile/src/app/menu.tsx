import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Chip } from '@/core/ui/Chip';
import { PageHeading } from '@/core/ui/PageHeading';
import { Screen } from '@/core/ui/Screen';
import { MealRow } from '@/features/menu/components/MealRow';
import { useMenuViewModel } from '@/features/menu/useMenuViewModel';

// TODO: open meal detail / add to cart once those features exist.
const notYet = () => undefined;

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
        <MealRow key={meal.id} meal={meal} onPress={notYet} onAdd={notYet} />
      ))}
      {vm.meals.length === 0 ? (
        <AppText muted style={styles.empty}>
          {t('menu.empty')}
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
  },
  empty: {
    paddingVertical: 40,
    fontSize: 14,
  },
});
