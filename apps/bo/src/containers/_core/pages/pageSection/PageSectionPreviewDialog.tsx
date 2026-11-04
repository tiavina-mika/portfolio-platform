import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import TranslationTabs from '@/components/form/translated/TranslationTabs';
import FullScreenDialog from '@/components/FullScreenDialog';
import {
  SECTION_FORM_PREVIEW_DESCRIPTION_GAP, SECTION_FORM_PREVIEW_GAP, SECTION_FORM_PREVIEW_MAX_WIDTH,
} from '@/constants/_core/ui.constants';
import SectionBlocksPreview from '@/pages/_core/pages/blocks/SectionBlocksPreview';
import { ISectionBlockObj } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  content: {
    width: '100%',
    maxWidth: SECTION_FORM_PREVIEW_MAX_WIDTH,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_PREVIEW_GAP}px`,
  },
  head: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_PREVIEW_DESCRIPTION_GAP}px`,
  },
  // an empty title is drawn as the placeholder it stands for, in the muted tone
  title: (isEmpty: boolean) => (theme: Theme) => ({
    color: isEmpty
      ? getDesignTokens(theme).textMuted
      : getDesignTokens(theme).text,
  }),
  description: (theme: Theme) => ({ color: getDesignTokens(theme).textSecondary }),
};

type FormBlock = Record<string, unknown>;

type Props = {
  open: boolean;
  onClose: () => void;
  /** the language the section is drawn in — the form's own tab, switched from here as well */
  tab: Locale;
  onTabChange: (value: Locale) => void;
};

/**
 * The section as the site will draw it, from what the form holds right now — saved or not. The
 * blocks are drawn by the same component the section's detail page uses; this only turns the
 * form's values into what that component reads.
 *
 * The parent mounts it only while it is open: it watches every value of the form, and a
 * subscription left mounted behind a closed dialog would re-render it on every keystroke.
 */
const PageSectionPreviewDialog = ({
  open, onClose, tab, onTabChange,
}: Props) => {
  const {
    t,
  } = useTranslation(['cms']);
  const {
    control,
  } = useFormContext();
  const values = useWatch({ control }) as Record<string, unknown>;
  const formBlocks = values.blocks as FormBlock[] | undefined;

  /*
   * a picture only exists as a `File` in the form — the one read back from the saved section too —
   * so each one is given an object URL for the time the preview is open
   */
  const blocks = useMemo(() => (formBlocks ?? []).map((block, index) => ({
    id: String(index),
    translated: {
      [tab]: {
        title: block[`${tab}:title`],
        description: block[`${tab}:description`],
        content: block[`${tab}:content`],
      },
    },
    imagePosition: block.imagePosition as ISectionBlockObj['imagePosition'],
    image: block.image instanceof File
      ? { url: URL.createObjectURL(block.image) }
      : undefined,
  })), [formBlocks, tab]);

  useEffect(() => () => {
    blocks.forEach((block) => {
      if (block.image) URL.revokeObjectURL(block.image.url);
    });
  }, [blocks]);

  const title = values[`${tab}:title`] as string | undefined;
  const description = values[`${tab}:description`] as string | undefined;

  return (
    <FullScreenDialog
      open={open}
      title={t('cms:sectionForm.sectionPreview')}
      toggle={onClose}
      actions={(
        <TranslationTabs onTabChange={onTabChange} tab={tab} />
      )}
    >
      <div css={classes.content}>
        <div css={classes.head}>
          <Typography css={classes.title(!title)} variant="h4">
            {title || t('cms:sectionForm.sectionTitlePlaceholder')}
          </Typography>
          {description && (
            <Typography css={classes.description}>{description}</Typography>
          )}
        </div>
        <SectionBlocksPreview blocks={blocks} locale={tab} />
      </div>
    </FullScreenDialog>
  );
};

export default PageSectionPreviewDialog;
