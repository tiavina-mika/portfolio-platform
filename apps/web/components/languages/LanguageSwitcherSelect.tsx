'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';


import { loadZodI18nLocale } from '@/config/zod/zod-i18n';
import { Locale } from '@/i18n/config';
import { usePathname, useRouter } from '@/i18n/routing';
import { ISelectOption } from '@/types/app.type';
import { cn } from '@/utils/app.utils';

import Select, { SelectProps } from '../forms/inputs/Select';

type Props = {
  defaultValue: Locale;
  options: ISelectOption<Locale>[];
  className?: string;
} & SelectProps;

const LanguageSwitcherSelect = ({
  defaultValue,
  options,
  className,
  ...props
}: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const handleSelectChange = (value: Locale) => {
    startTransition(() => {
      router.replace({ pathname: pathname as string, params } as any, {
        locale: value,
      });
    });
    loadZodI18nLocale(value);
  };

  return (
    <Select
      {...props}
      onChange={handleSelectChange}
      options={options}
      value={defaultValue}
      className={cn(
        {
          'transition-opacity [&:disabled]:opacity-30': isPending,
        },
        className
      )}
    />
  );
};

export default LanguageSwitcherSelect;
