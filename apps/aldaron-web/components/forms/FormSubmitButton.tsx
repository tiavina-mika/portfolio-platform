'use client';

import { useFormStatus } from 'react-dom';

import Button, { ButtonProps } from '../buttons/Button';

type Props = {
  text: string;
  /**
   * Label shown while the form is being sent, instead of the spinner alone
   */
  loadingText?: string;
  loading?: boolean;
} & Omit<ButtonProps, 'children'>;

const FormSubmitButton = ({
  text, loadingText, loading, className, ...props
}: Props) => {
  /**
   * if using useFormStatus in the form level (mainly for server actions)
   * all the child of the <form> can access to this hook
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { pending } = useFormStatus();
  const isLoading = loading || pending;

  return (
    <Button
      fullWidth
      loading={isLoading}
      size="lg"
      type="submit"
      {...props}
      className={className}
    >
      {isLoading ? (loadingText ?? text) : text}
    </Button>
  );
};

export default FormSubmitButton;
