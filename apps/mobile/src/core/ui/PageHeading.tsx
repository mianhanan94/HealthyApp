import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors } from './theme';

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
}

export function PageHeading({ eyebrow, title, intro }: PageHeadingProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <AppText variant="eyebrow" style={styles.eyebrow}>
          {eyebrow}
        </AppText>
      ) : null}
      <AppText variant="title">{title}</AppText>
      {intro ? (
        <AppText muted style={styles.intro}>
          {intro}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    marginBottom: 4,
  },
  intro: {
    fontSize: 14,
    lineHeight: 24,
  },
});
