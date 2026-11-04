import { useFormContext, useFormState, useWatch } from 'react-hook-form';

import { ISectionBlockProgress } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { isCmsFormFieldFilled, isSectionBlockComplete } from '@/utils/_core/cms.utils';

export type SectionBlocksProgress = {
  blocks: ISectionBlockProgress[];
  completed: number;
  total: number;
};

/**
 * Where each block of a section form stands — complete, translated in the open tab, refused by the
 * schema — and how many are complete, for the list of blocks and the footer bar.
 *
 * It is a hook rather than a value computed by the form and passed down for the same reason as
 * `useCmsFormSections`: `useWatch` re-renders its caller on every keystroke, and the block being
 * written holds a rich text editor that must not re-render while it is being typed into.
 */
export const useSectionBlocksProgress = (tab: Locale): SectionBlocksProgress => {
  const {
    control,
  } = useFormContext();
  const values = useWatch({ control, name: 'blocks' }) as Record<string, unknown>[] | undefined;
  const {
    errors,
  } = useFormState({ control, name: 'blocks' });
  const blockErrors = errors.blocks as unknown as (object | undefined)[] | undefined;

  const blocks = (values ?? []).map((block, index): ISectionBlockProgress => ({
    title: (block?.[`${tab}:title`] as string | undefined)?.trim() || '',
    isComplete: isSectionBlockComplete(block),
    isTranslated: isCmsFormFieldFilled(block?.[`${tab}:title`]),
    hasImage: !!block?.image,
    imagePosition: block?.imagePosition as ISectionBlockProgress['imagePosition'],
    hasErrors: !!blockErrors?.[index],
  }));

  return {
    blocks,
    completed: blocks.filter((block) => block.isComplete).length,
    total: blocks.length,
  };
};
