import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { colors, CONTROL_HEIGHT, radius, spacing, typography } from './theme';

interface TextFieldProps extends Pick<
  TextInputProps,
  | 'keyboardType'
  | 'autoComplete'
  | 'textContentType'
  | 'maxLength'
  | 'autoCapitalize'
  | 'placeholder'
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  suffix?: string;
  helper?: string;
  /** Replaces the helper text when set (spec 1.3). */
  error?: string | null;
}

export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  suffix,
  helper,
  error,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          {...inputProps}
        />
        {suffix ? <AppText muted>{suffix}</AppText> : null}
      </View>
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" muted>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: CONTROL_HEIGHT,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
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
    alignSelf: 'stretch',
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  error: {
    color: colors.danger,
  },
});
