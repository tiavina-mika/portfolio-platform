import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef, Fragment } from 'react';


import { Locale } from '@/i18n/config';
import { cn } from '@/utils/app.utils';
import { getBreadcrumbListJsonLd } from '@/utils/jsonLd.utils';
import { cutText } from '@/utils/utils';

import JsonLd from './JsonLd';
import NextIcon from './NextIcon';
import TextLink from './typography/TextLink';

export type BreadcrumbsSegment = {
  name: string;
  link: any;
};

type BreadcrumbsProps = ComponentPropsWithoutRef<'nav'> & {
  segments: BreadcrumbsSegment[];
  separator?: string;
  truncationLength?: number;
  /**
   * current locale, used to build the absolute, locale-prefixed URLs in the BreadcrumbList JSON-LD
   */
  locale?: Locale;
};

export type IBreadCrumbSegment = BreadcrumbsProps['segments'];

export const Breadcrumbs = ({
  segments,
  separator,
  truncationLength = 0,
  className,
  locale,
  ...props
}: BreadcrumbsProps) => {
  const t = useTranslations('NavBar');

  const newSegments = [
    {
      name: t('home'),
      link: '/',
    },
    ...segments,
  ];

  return (
    <div
      aria-label="breadcrumbs"
      className={cn(
        'flex items-center overflow-auto text-sm font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      <JsonLd data={getBreadcrumbListJsonLd(newSegments, locale)} />
      {newSegments.map((segment: BreadcrumbsSegment, index: number) => {
        const isLastSegment = index === newSegments.length - 1;

        return (
          <Fragment key={index}>
            <TextLink
              aria-current={isLastSegment ? 'page' : undefined}
              href={segment.link}
              underline={false}
              className={cn(
                `
                  truncate text-base font-normal transition-colors
                  hover:opacity-70
                `,
                isLastSegment
                  ? 'font-semibold text-primary-dark'
                  : 'font-normal text-gray-600'
              )}
            >
              {truncationLength > 0 && segment.name
                ? cutText(segment.name, truncationLength)
                : segment.name}
            </TextLink>
            {/* do not display icon in the last link */}
            {!isLastSegment && (
              <NextIcon
                aria-hidden="true"
                className="mx-2"
                size={14}
                src={`/icons/${separator || 'chevron-right'}.svg`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
