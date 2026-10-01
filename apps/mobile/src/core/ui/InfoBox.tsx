import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, radius } from './theme';

type Tone = 'calm' | 'warn' | 'allergen';

interface InfoBoxProps {
  tone?: Tone;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
}

const TONES: Record<Tone, { bg: string; border: string }> = {
  // Safety notes are calm, not alarming (spec 1.5).
  calm: { bg: colors.card, border: colors.primary },
  warn: { bg: colors.commerceSoft, border: 'rgba(237, 153, 14, 0.45)' },
  allergen: { bg: colors.accentSoft, border: colors.border },
};

export function InfoBox({ tone = 'calm', icon: Icon, title, children }: InfoBoxProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.box, { backgroundColor: t.bg, borderColor: t.border }]}>
      {Icon ? <Icon size={18} color={colors.primary} /> : null}
      <View style={styles.text}>
        {title ? <AppText style={styles.title}>{title}</AppText> : null}
        {typeof children === 'string' ? (
          <AppText style={styles.body}>{children}</AppText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
