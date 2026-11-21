'use client';

import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import TranslationClientProvider from '@/components/TranslationClientProvider';
import { ROUTES } from '@/i18n/routes';
import { useRouter } from '@/i18n/routing';
import { IEstimate } from '@/types/estimate.type';
import { copyToClipboard } from '@/utils/clipboard.utils';
import { ESTIMATE_STORAGE_KEY } from '@/utils/constants';

import Simulator from './Simulator';

const SimulatorWithActions = () => {
  const t = useTranslations('SimulatorPage');
  const router = useRouter();

  const handleRequestQuote = (estimate: IEstimate) => {
    try {
      // the quote request page starts from this estimate
      localStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(estimate));
    } catch { /* storage is blocked: the quote request starts empty */ }
    router.push(ROUTES.contact);
  };

  const handleCopySummary = async (summary: string) => {
    if (await copyToClipboard(summary)) toast.success(t('result.copied'));
  };

  return <Simulator onCopySummary={handleCopySummary} onRequestQuote={handleRequestQuote} />;
};

/**
 * The simulator wired to the site: the quote action hands the estimate to the contact page, the copy
 * action writes the summary to the clipboard and confirms it
 */
const SimulatorProvider = () => (
  <TranslationClientProvider rootKeys={['SimulatorPage']}>
    <SimulatorWithActions />
  </TranslationClientProvider>
);

export default SimulatorProvider;
