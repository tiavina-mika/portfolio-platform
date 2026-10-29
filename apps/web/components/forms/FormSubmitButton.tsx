'use client';

import { useFormStatus } from 'react-dom';

import Button, { ButtonProps } from '../buttons/Button';
import Loading from '../Loading';

type Props = {
  text: string;
  loading?: boolean;
} & Omit<ButtonProps, 'children'>;

const FormSubmitButton = ({ text, loading, ...props }: Props) => {
  /**
   * if using useFormStatus in the form level (mainly for server actions)
   * all the child of the <form> can access to this hook
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { pending } = useFormStatus();

  return (
    <Button
      fullWidth
      type="submit"
      variant="contained"
      {...props}
      className="px-6 py-4"
    >
      {loading || pending ? <Loading /> : text}
    </Button>
  );
};

export default FormSubmitButton;
