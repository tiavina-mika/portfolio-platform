import { useTranslations } from 'next-intl';
import { ComponentPropsWithoutRef, Fragment } from 'react';


import { cn } from '@/utils/app.utils';
import { cutText } from '@/utils/utils';

import NextIcon from './NextIcon';
import TextLink from './typography/TextLink';

export type BreadcrumbsSegment = {
  title: string;
  href: any;
};

type BreadcrumbsProps = ComponentPropsWithoutRef<'nav'> & {
  segments: BreadcrumbsSegment[];
  separator?: string;
  truncationLength?: number;
};

export type IBreadCrumbSegment = BreadcrumbsProps['segments'];

export const Breadcrumbs = ({
  segments,
  separator,
  truncationLength = 0,
  className,
  ...props
}: BreadcrumbsProps) => {
  const t = useTranslations('NavBar');

  const newSegments = [
    {
      title: t('home'),
      href: '/',
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
      {newSegments.map((segment, index) => {
        const isLastSegment = index === newSegments.length - 1;

        return (
          <Fragment key={index}>
            <TextLink
              aria-current={isLastSegment ? 'page' : undefined}
              href={segment.href}
              underline={false}
              className={cn(
                `
                  truncate text-base font-normal transition-colors
                  hover:opacity-70
                `,
                isLastSegment
                  ? 'font-bold text-gray-800'
                  : 'font-normal text-gray-600'
              )}
            >
              {truncationLength > 0 && segment.title
                ? cutText(segment.title, truncationLength)
                : segment.title}
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
