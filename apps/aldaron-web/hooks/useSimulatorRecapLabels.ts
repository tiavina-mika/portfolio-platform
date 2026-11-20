'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { ISimulatorRecapLabels } from '@/types/simulator.type';

/**
 * The words of the written summary of an estimate, in the language of the page
 */
export const useSimulatorRecapLabels = (): ISimulatorRecapLabels => {
  const t = useTranslations('SimulatorPage');

  return useMemo(() => ({
    with: t('recap.with'),
    complexity: t('complexity.label'),
    about: (screens: number) => t('recap.about', { n: screens }),
    bring: {
      idea: t('bring.idea.title'),
      spec: t('bring.spec.title'),
      mockup: t('bring.mockup.title'),
    },
    support: {
      web: t('lines.web'),
      app: t('lines.app'),
      mobile: t('lines.mobile'),
      bo: t('lines.bo'),
    },
    complexityLevel: {
      standard: t('complexity.standard'),
      some: t('complexity.some'),
      heavy: t('complexity.heavy'),
    },
    richLabel: t('rich.rich.title'),
    maintenanceLine: t('maintenance.line'),
    chatLabel: t('lines.chat'),
    paymentLabel: t('lines.payment'),
  }), [t]);
};
