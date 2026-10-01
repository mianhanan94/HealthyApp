import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from './theme';

type Variant = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
}

export function AppText({ variant = 'body', muted = false, style, ...rest }: AppTextProps) {
  return (
    <Text style={[styles.base, typography[variant], muted && styles.muted, style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    // Numbers must not jump around as they change.
    fontVariant: ['tabular-nums'],
  },
  muted: {
    color: colors.textMuted,
  },
});
