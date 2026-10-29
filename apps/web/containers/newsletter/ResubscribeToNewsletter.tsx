'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';

import Button from '@/components/buttons/Button';
import Loading from '@/components/Loading';
import { Locale } from '@/i18n/config';
import { useRouter } from '@/i18n/routing';
import { resubscribeToNewsletter } from '@/server/mutations/newsletter.mutation';

type Props = {
  label: string;
  encryptedEmail: string;
  tSuccess: string;
  tError: string;
  tUnknownError: string;
  locale: Locale;
};
const ResubscribeToNewsletter = ({
  label,
  encryptedEmail,
  tSuccess,
  tError,
  tUnknownError,
  locale,
}: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const bindAction = resubscribeToNewsletter.bind(null, locale);

  const handleResubscribe = () => {
    startTransition(async () => {
      try {
        const res = await bindAction({
          encryptedEmail,
        });

        if (res?.serverError) {
          throw new Error(tUnknownError);
        }
        if (res?.data) {
          // success
          toast.success(tSuccess);
          router.push('/');
          return;
        }

        toast.error(tError);
      }
      catch (error) {
        toast.error((error as Error)?.message);
      }
    });
  };

  return (
    <Button
      className="flex flex-row items-center"
      color="default"
      fullWidth={false}
      onClick={handleResubscribe}
      variant="text"
    >
      {label}. {isPending ? <Loading className="ml-2 size-3" /> : null}
    </Button>
  );
};

export default ResubscribeToNewsletter;
