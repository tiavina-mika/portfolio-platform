import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ReportResolutionInput, ReportStatusEnum } from '@/types/_core/report.type';
import { reportResolutionSchema } from '@/validations/_core/report.validations';

type Options = {
  // changes whenever another report is opened — the note written for the last one must not follow
  resetKey: string | undefined;
  onResolve: (
    values: ReportResolutionInput,
    status: typeof ReportStatusEnum.RESOLVED | typeof ReportStatusEnum.DISMISSED
  ) => void;
  onSuspend: (values: ReportResolutionInput) => void;
};

/**
 * The ruling on one report: a note and three ways of closing it. The note is written in one place
 * while the decision is taken in another (the body of the side sheet and its footer, a card and the
 * row of buttons under it), so the form is held here and reaches both through context — and each
 * decision calls `handleSubmit` itself rather than relying on a native submit, which would race
 * between three buttons sharing one field.
 * @param options the report being ruled on and what each decision does
 * @returns the form to provide and one handler per decision
 */
export const useReportDecisionForm = ({ resetKey, onResolve, onSuspend }: Options) => {
  const methods = useForm<ReportResolutionInput>({
    resolver: zodResolver(reportResolutionSchema),
    defaultValues: { resolution: '' },
  });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  return {
    methods,
    handleResolve: handleSubmit((values) => onResolve(values, ReportStatusEnum.RESOLVED)),
    handleDismiss: handleSubmit((values) => onResolve(values, ReportStatusEnum.DISMISSED)),
    handleSuspend: handleSubmit((values) => onSuspend(values)),
  };
};
