import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  IPageInput, IPage, IPageStepOneInput, IPageStepThreeInput,
} from '@/types/page.type';

import PageFormStepOne from './PageFormStepOne';
import PageFormStepThree from './PageFormStepThree';
import PageFormStepTwo from './PageFormStepTwo';

type IStep = 1 | 2 | 3 | number;

const lastStep = 3;

type Props = {
  onSubmit: (values: IPageInput) => void;
  page?: IPage | null;
  loading?: boolean;
};

const PageForm = ({
  onSubmit, page, loading,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<IStep>(1);
  const [finalValues, setFinalValues] = useState<IPageInput | null>(null);

  const handlePrevious = () => {
    // do not decrement if the step is the first one
    if (step === 1) {
      router.history.back();
      return;
    }
    // decrement the step
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = (step: IStep) => (values: IPageInput) => {
    // do not increment in last step
    if (step < lastStep) {
      // increment the step
      setStep(prev => prev + 1);
      // store the values of each form step in the finalValues state
      setFinalValues((prev: IPageInput | null) => ({ ...prev, [step]: values } as IPageInput));
      return;
    }

    // if the step is the last one, submit the form
    const allValues = (Object.values({ ...finalValues, [step]: values }) as Partial<IPageInput>[])
      .reduce((acc: IPageInput, curr: Partial<IPageInput>) => ({ ...acc, ...curr }), {} as IPageInput);

    onSubmit(allValues);
  };

  return (
    <div>
      {step === 1 && (
        <PageFormStepOne
          buttonDirection="row"
          loading={loading}
          onSecondaryButtonClick={handlePrevious}
          onSubmit={handleFinalSubmit(step) as (values: IPageStepOneInput) => void}
          page={page}
          primaryButtonText={t('common:nextStep', { step, total: lastStep })}
        />
      )}
      {step === 2 && (
        <PageFormStepTwo
          buttonDirection="row"
          loading={loading}
          onSecondaryButtonClick={handlePrevious}
          onSubmit={handleFinalSubmit(step)}
          page={page}
          primaryButtonText={t('common:nextStep', { step, total: lastStep })}
          secondaryButtonText={t('common:previous')}
        />
      )}
      {step === 3 && (
        <PageFormStepThree
          buttonDirection="row"
          loading={loading}
          onSecondaryButtonClick={handlePrevious}
          onSubmit={handleFinalSubmit(step) as (values: IPageStepThreeInput) => void}
          page={page}
          primaryButtonText={t('common:terminateAndSaveStep', { step, total: lastStep })}
          secondaryButtonText={t('common:previous')}
        />
      )}
    </div>
  );
};

export default PageForm;
