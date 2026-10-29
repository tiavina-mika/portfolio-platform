'use client';

import { useCallback, useEffect, useState } from 'react';

import IconButton from '@/components/buttons/IconButton';
import Select from '@/components/forms/inputs/Select';
import NextIcon from '@/components/NextIcon';
import { usePathname, useRouter } from '@/i18n/routing';
import { ISelectOption } from '@/types/app.type';
import { createQueryString } from '@/utils/next.utils';


export type SortProps = {
  className?: string;
  inputClassName?: string;
  searchParams: Record<string, string | number>;
  options: ISelectOption[];
};

const Sort = ({
  className, inputClassName, searchParams, options,
}: SortProps) => {
  const [values, setValues] = useState<SortProps['searchParams']>(searchParams);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.push(`${pathname}?${createQueryString(values)}`, {
      scroll: false,
    });
  }, [values, pathname, router]);

  const handleChangeOrderBy = (value: string) => {
    setValues(prev => ({ ...prev, orderedBy: value, page: 1 }));
  };

  const toggleSort = useCallback(() => {
    const order = searchParams.order || 'asc';

    setValues(prev => ({
      ...prev,
      order: order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }, [searchParams]);

  const arrow = (values.order || 'asc') === 'asc' ? 'up' : 'down';

  return (
    <div className="flex flex-row items-center gap-2">
      <Select
        className={className}
        inputClassName={inputClassName}
        onChange={handleChangeOrderBy}
        options={options}
        value={values.orderedBy ?? options[0]?.value}
      />
      <IconButton onClick={toggleSort}>
        <NextIcon
          size={18}
          src={`/icons/arrow-${arrow}.svg`}
          className={`
            block
            dark:hidden
          `}
        />
        <NextIcon
          size={18}
          src={`/icons/arrow-${arrow}-dark.svg`}
          className={`
            hidden
            dark:block
          `}
        />
      </IconButton>
    </div>
  );
};

export default Sort;
