import { Utensils } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from './theme';

/**
 * Meal photo slot. Real photos arrive with the menu data from the backend; until then this
 * renders a neutral placeholder of the same size.
 */
export function MealPhoto({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.placeholder, style]} accessibilityElementsHidden>
      <Utensils size={28} color={colors.primary} strokeWidth={1.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
