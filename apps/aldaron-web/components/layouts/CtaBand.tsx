import { cn } from '@/utils/app.utils';

import SectionIntro from './SectionIntro';
import ButtonLink from '../buttons/ButtonLink';

type Props = {
  /**
   * `inverted` is the band put forward (ink on the page): one per page, for the main call
   * @default card
   */
  variant?: 'card' | 'inverted';
  /**
   * `row` puts the button beside the text, `stacked` under it
   * @default row
   */
  layout?: 'row' | 'stacked';
  eyebrow?: string;
  title: string;
  description?: string;
  /**
   * The id of the title, for the `aria-labelledby` of the section around the band
   */
  titleId?: string;
  /**
   * The button: an internal path of `ROUTES` and its label
   */
  cta: { label: string; href: string };
};

/**
 * A band that ends a page or a section with one call to action: a title, a sentence and a brand button
 */
const CtaBand = ({
  variant = 'card',
  layout = 'row',
  eyebrow,
  title,
  description,
  titleId,
  cta,
}: Props) => {
  const isInverted = variant === 'inverted';
  const isRow = layout === 'row';

  return (
    <div
      className={cn(
        `
          flex gap-8 p-6
          md:p-10
        `,
        isInverted ? 'rounded-lg bg-primary text-primary-foreground' : `
          rounded-xl border border-border bg-card
        `,
        isRow ? 'flex-wrap items-center justify-between' : 'flex-col items-start gap-4'
      )}
    >
      <SectionIntro
        className={cn(isRow ? 'max-w-[52ch]' : 'gap-4')}
        description={description}
        descriptionClassName={cn(isInverted && 'text-primary-foreground/88')}
        eyebrow={eyebrow}
        eyebrowClassName={cn(isInverted && 'text-primary-foreground/85')}
        title={title}
        titleClassName={isRow ? 'max-w-none' : undefined}
        titleId={titleId}
      />
      <ButtonLink href={cta.href} size="lg" variant="brand">{cta.label}</ButtonLink>
    </div>
  );
};

export default CtaBand;
