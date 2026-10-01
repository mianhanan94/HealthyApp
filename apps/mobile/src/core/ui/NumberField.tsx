import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import { colors, MIN_TOUCH_SIZE, radius, spacing, typography } from './theme';

interface NumberFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  suffix?: string;
  error?: string | null;
}

export function NumberField({
  label,
  value,
  onChangeText,
  onBlur,
  suffix,
  error,
}: NumberFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          style={styles.input}
        />
        {suffix ? <AppText muted>{suffix}</AppText> : null}
      </View>
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  error: {
    color: colors.danger,
  },
});
