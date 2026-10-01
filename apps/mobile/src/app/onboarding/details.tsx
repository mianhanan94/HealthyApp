import type { ActivityLevel } from '@healthyapp/shared';
import { ArrowRight, Check, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { InfoBox } from '@/core/ui/InfoBox';
import { OptionRow } from '@/core/ui/OptionRow';
import { Screen } from '@/core/ui/Screen';
import { Segmented } from '@/core/ui/Segmented';
import { Sheet } from '@/core/ui/Sheet';
import { TextField } from '@/core/ui/TextField';
import { colors, fonts } from '@/core/ui/theme';
import { StepHeader } from '@/features/onboarding/components/StepHeader';
import { useDetailsViewModel } from '@/features/onboarding/useOnboardingViewModels';

const ACTIVITY: ActivityLevel[] = ['sedentary', 'light', 'active', 'very_active', 'athlete'];

function GroupLabel({ children }: { children: string }) {
  return (
    <AppText variant="eyebrow" muted style={styles.groupLabel}>
      {children}
    </AppText>
  );
}

function FieldLabel({ label, error }: { label: string; error: string | null }) {
  return (
    <View style={styles.fieldLabel}>
      <AppText variant="label">{label}</AppText>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

export default function DetailsScreen() {
  const { t } = useTranslation();
  const vm = useDetailsViewModel();
  const d = vm.details;
  const [waistHelp, setWaistHelp] = useState(false);
  const err = (field: Parameters<typeof vm.errorFor>[0]) => {
    const code = vm.errorFor(field);
    return code ? t(`onboarding.errors.${code}`) : null;
  };

  return (
    <Screen>
      <StepHeader
        step={1}
        title={t('onboarding.details.title')}
        intro={t('onboarding.details.intro')}
      />

      <GroupLabel>{t('onboarding.details.aboutYou')}</GroupLabel>
      <TextField
        label={t('onboarding.details.name')}
        value={d.name}
        onChangeText={(name) => vm.setDetails({ name })}
        onBlur={() => vm.touch('name')}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        maxLength={40}
        error={err('name')}
      />
      <TextField
        label={t('onboarding.details.age')}
        value={d.ageText}
        onChangeText={(ageText) => vm.setDetails({ ageText: ageText.replace(/[^\d]/g, '') })}
        onBlur={() => vm.touch('age')}
        keyboardType="number-pad"
        maxLength={2}
        suffix={t('onboarding.details.years')}
        error={err('age')}
      />
      <View style={styles.field}>
        <FieldLabel label={t('onboarding.details.sex')} error={err('sex')} />
        <Segmented
          accessibilityLabel={t('onboarding.details.sex')}
          value={d.sex}
          onChange={(sex) => {
            vm.setDetails({ sex, pregnant: sex === 'male' ? null : d.pregnant });
            vm.touch('sex');
          }}
          options={[
            { value: 'male', label: t('onboarding.details.male') },
            { value: 'female', label: t('onboarding.details.female') },
          ]}
        />
        <AppText variant="caption" muted>
          {t('onboarding.details.sexHelper')}
        </AppText>
      </View>
      {d.sex === 'female' ? (
        <View style={styles.field}>
          <FieldLabel label={t('onboarding.details.pregnant')} error={err('pregnant')} />
          <Segmented
            accessibilityLabel={t('onboarding.details.pregnant')}
            value={d.pregnant === null ? null : d.pregnant ? 'yes' : 'no'}
            onChange={(v) => {
              vm.setDetails({ pregnant: v === 'yes' });
              vm.touch('pregnant');
            }}
            options={[
              { value: 'no', label: t('onboarding.details.no') },
              { value: 'yes', label: t('onboarding.details.yes') },
            ]}
          />
        </View>
      ) : null}

      <GroupLabel>{t('onboarding.details.yourBody')}</GroupLabel>
      <View style={styles.field}>
        {d.heightUnit === 'ft' ? (
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField
                label={`${t('onboarding.details.height')} · ${t('onboarding.details.feet')}`}
                value={d.feetText}
                onChangeText={(feetText) =>
                  vm.setDetails({ feetText: feetText.replace(/[^\d]/g, '') })
                }
                onBlur={() => vm.touch('height')}
                keyboardType="number-pad"
                maxLength={1}
                suffix={t('onboarding.details.ft')}
              />
            </View>
            <View style={styles.flex}>
              <TextField
                label={t('onboarding.details.inches')}
                value={d.inchesText}
                onChangeText={(inchesText) =>
                  vm.setDetails({ inchesText: inchesText.replace(/[^\d]/g, '') })
                }
                onBlur={() => vm.touch('height')}
                keyboardType="number-pad"
                maxLength={2}
                suffix={t('onboarding.details.in')}
              />
            </View>
          </View>
        ) : (
          <TextField
            label={t('onboarding.details.height')}
            value={d.heightCmText}
            onChangeText={(heightCmText) => vm.setDetails({ heightCmText })}
            onBlur={() => vm.touch('height')}
            keyboardType="decimal-pad"
            maxLength={5}
            suffix={t('onboarding.details.cm')}
          />
        )}
        {err('height') ? <AppText style={styles.error}>{err('height')}</AppText> : null}
        <Button
          variant="ghost"
          size="sm"
          style={styles.unitLink}
          label={
            d.heightUnit === 'ft' ? t('onboarding.details.useCm') : t('onboarding.details.useFeet')
          }
          onPress={vm.toggleHeightUnit}
        />
      </View>

      <View style={styles.field}>
        <TextField
          label={t('onboarding.details.weight')}
          value={d.weightText}
          onChangeText={(weightText) => vm.setDetails({ weightText })}
          onBlur={() => vm.touch('weight')}
          keyboardType="decimal-pad"
          maxLength={5}
          suffix={d.weightUnit === 'kg' ? t('onboarding.details.kg') : t('onboarding.details.lbs')}
          error={err('weight')}
        />
        <Button
          variant="ghost"
          size="sm"
          style={styles.unitLink}
          label={
            d.weightUnit === 'kg' ? t('onboarding.details.useLbs') : t('onboarding.details.useKg')
          }
          onPress={vm.toggleWeightUnit}
        />
      </View>

      {vm.preview ? (
        <Card>
          <AppText
            style={[
              styles.previewLine,
              { color: vm.preview.category === 'healthy' ? colors.primary : colors.commerce },
            ]}
          >
            {t('onboarding.details.bmiPreview', {
              bmi: vm.preview.bmi.toFixed(1),
              category: t(`bmiCategory.${vm.preview.category}`),
            })}
          </AppText>
          <AppText muted style={styles.small}>
            {t('onboarding.details.bmiPreviewRange', {
              min: vm.preview.range.minKg,
              max: vm.preview.range.maxKg,
            })}
          </AppText>
        </Card>
      ) : null}

      <View style={styles.field}>
        <TextField
          label={t('onboarding.details.waist')}
          value={d.waistText}
          onChangeText={(waistText) => vm.setDetails({ waistText })}
          onBlur={() => vm.touch('waist')}
          keyboardType="decimal-pad"
          maxLength={4}
          suffix={t('onboarding.details.in')}
          helper={t('onboarding.details.waistHelper')}
          error={err('waist')}
        />
        <Button
          variant="ghost"
          size="sm"
          style={styles.unitLink}
          label={t('onboarding.details.howToMeasure')}
          onPress={() => setWaistHelp(true)}
        />
      </View>

      <GroupLabel>{t('onboarding.details.yourDay')}</GroupLabel>
      <View>
        <FieldLabel label={t('onboarding.details.activity')} error={err('activity')} />
        {ACTIVITY.map((level) => (
          <OptionRow
            key={level}
            title={t(`onboarding.details.activityLevel.${level}.title`)}
            detail={t(`onboarding.details.activityLevel.${level}.detail`)}
            selected={d.activity === level}
            onPress={() => {
              vm.setDetails({ activity: level });
              vm.touch('activity');
            }}
          />
        ))}
      </View>

      <View style={styles.privacy} accessible>
        <Lock size={14} color={colors.textMuted} />
        <AppText muted style={styles.small}>
          {t('onboarding.details.privacy')}
        </AppText>
      </View>
      {vm.hasErrors ? <InfoBox tone="warn">{t('onboarding.details.fixErrors')}</InfoBox> : null}
      <Button label={t('onboarding.details.submit')} icon={ArrowRight} onPress={vm.submit} />

      <Sheet
        visible={waistHelp}
        onClose={() => setWaistHelp(false)}
        title={t('onboarding.details.waistSheetTitle')}
        closeLabel={t('common.close')}
      >
        <AppText muted style={styles.sheetText}>
          {t('onboarding.details.waistSheetBody')}
        </AppText>
        <Button label={t('common.close')} icon={Check} onPress={() => setWaistHelp(false)} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  groupLabel: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    gap: 2,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 16,
  },
  unitLink: {
    alignSelf: 'flex-start',
    marginLeft: -12,
  },
  previewLine: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  small: {
    fontSize: 12,
    lineHeight: 17,
    flexShrink: 1,
  },
  privacy: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  sheetText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
