import { useTranslation } from 'react-i18next';

import { HEIGHT_CM, useBodyCheckViewModel, WEIGHT_KG } from '@/features/body/useBodyCheckViewModel';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { NumberField } from '@/core/ui/NumberField';
import { Screen } from '@/core/ui/Screen';

export default function BodyCheckScreen() {
  const { t } = useTranslation();
  const vm = useBodyCheckViewModel();

  return (
    <Screen>
      <NumberField
        label={t('bodyCheck.height')}
        suffix={t('bodyCheck.cm')}
        value={vm.heightText}
        onChangeText={vm.setHeightText}
        onBlur={() => vm.markTouched('height')}
        error={vm.heightInvalid ? t('bodyCheck.errors.height', HEIGHT_CM) : null}
      />
      <NumberField
        label={t('bodyCheck.weight')}
        suffix={t('bodyCheck.kg')}
        value={vm.weightText}
        onChangeText={vm.setWeightText}
        onBlur={() => vm.markTouched('weight')}
        error={vm.weightInvalid ? t('bodyCheck.errors.weight', WEIGHT_KG) : null}
      />

      {vm.preview ? (
        <Card>
          <AppText variant="eyebrow" muted>
            {t('bodyCheck.bmi')}
          </AppText>
          <AppText variant="heading">
            {t('bodyCheck.bmiLine', {
              bmi: vm.preview.bmi,
              category: t(`bmiCategory.${vm.preview.category}`),
            })}
          </AppText>
          <AppText muted>
            {t('bodyCheck.healthyRange', {
              min: vm.preview.healthyMinKg,
              max: vm.preview.healthyMaxKg,
            })}
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}
