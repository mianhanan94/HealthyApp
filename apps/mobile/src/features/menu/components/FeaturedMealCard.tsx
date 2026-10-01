import { Plus, Utensils } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMoney } from '@/core/format';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { MealPhoto } from '@/core/ui/MealPhoto';
import { Pill } from '@/core/ui/Pill';
import { colors, CONTROL_HEIGHT, fonts, radius, shadows } from '@/core/ui/theme';

import { HIGH_PROTEIN_G, type MenuItem } from '../menu.types';

interface FeaturedMealCardProps {
  meal: MenuItem;
  onCustomize: () => void;
  onAdd: () => void;
}

export function FeaturedMealCard({ meal, onCustomize, onAdd }: FeaturedMealCardProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={meal.name} onPress={onCustomize}>
        <MealPhoto style={styles.photo} />
        {meal.base.proteinG >= HIGH_PROTEIN_G ? (
          <View style={styles.tag}>
            <Pill tone="success" label={t('common.highProtein')} />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <AppText style={styles.name}>{meal.name}</AppText>
            <AppText muted style={styles.description}>
              {meal.description}
            </AppText>
          </View>
          <AppText style={styles.price}>{formatMoney(meal.basePrice)}</AppText>
        </View>
        <View style={styles.pills}>
          <Pill label={t('common.kcal', { value: meal.base.kcal })} />
          <Pill label={t('common.protein', { value: Math.round(meal.base.proteinG) })} />
        </View>
        <View style={styles.actions}>
          <Button
            label={t('home.customize')}
            icon={Utensils}
            onPress={onCustomize}
            style={styles.customize}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.add', { name: meal.name })}
            onPress={onAdd}
            style={styles.add}
          >
            <Plus size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  photo: {
    height: 208,
  },
  tag: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  titleText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  price: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  customize: {
    flex: 1,
  },
  add: {
    width: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: radius.lg,
    backgroundColor: colors.commerce,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
});
