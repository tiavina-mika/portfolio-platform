import {
  Chip, FormHelperText, IconButton, Stack, Tooltip,
} from '@mui/material';
import { lazy, Suspense } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiTrash2 } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import TextEditorFieldSkeleton from '@/components/form/fields/TextEditorFieldSkeleton';
import TextField from '@/components/form/fields/TextField';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import { imagePositionOptions } from '@/constants/_core/cms.constants';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';
import { SECTION_FORM_ACTION_ICON_SIZE, SECTION_FORM_EDITOR_GAP } from '@/constants/_core/ui.constants';
import { ISectionBlockObj } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getSectionBlockImageLabel } from '@/utils/_core/cms.utils';

const TextEditorField = lazy(() => import('@/components/form/fields/TextEditorField'));

const classes = {
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_EDITOR_GAP}px`,
  },
  /*
   * the side is read under the picture rather than next to it, at every width: four pills need
   * the whole line, and they describe the picture right above them
   */
  image: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_EDITOR_GAP}px`,
  },
  delete: (theme: Theme) => ({
    '&:hover': { color: theme.palette.error.main },
  }),
};

type BlockErrors = Record<string, { message?: string } | undefined>;

type Props = {
  /** the block's rank in the field array */
  index: number;
  /** the language tab the translated fields are shown in */
  tab: Locale;
  onDelete: () => void;
};

/**
 * The one block of a section being written: its title, description and content in the open
 * language, its picture and the side of the text the picture goes on. The block's rank and where
 * its picture sits head the card, so the editor never loses track of which block is open.
 *
 * The parent keys it by the block, so opening another block mounts a fresh rich text editor rather
 * than handing the one already mounted a different value.
 */
const PageSectionBlockEditor = ({ index, tab, onDelete }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control,
  } = useFormContext();
  const name = `blocks.${index}`;
  // only the picture and its side are watched: they change the head of the card, typing does not
  const [image, imagePosition] = useWatch({
    control,
    name: [`${name}.image`, `${name}.imagePosition`],
  }) as [unknown, ISectionBlockObj['imagePosition'] | undefined];
  const {
    errors,
  } = useFormState({ control, name });
  /*
   * a block's fields are registered under the array, so their errors are nested there rather than
   * keyed by the field's full name the fields themselves look up
   */
  const blockErrors = ((errors.blocks as unknown as BlockErrors[] | undefined)?.[index]) ?? {};
  const getErrorMessage = (field: string): string | undefined => blockErrors[field]?.message;

  return (
    <CardFormBlock
      rightHeader={(
        <Tooltip title={t('cms:sectionForm.deleteBlock')}>
          <IconButton
            aria-label={t('cms:sectionForm.deleteBlock')}
            css={classes.delete}
            onClick={onDelete}
          >
            <FiTrash2 size={SECTION_FORM_ACTION_ICON_SIZE} />
          </IconButton>
        </Tooltip>
      )}
      title={(
        <span css={classes.title}>
          {t('cms:sectionForm.blockNumber', { value: index + 1 })}
          <Chip label={getSectionBlockImageLabel({ hasImage: !!image, imagePosition })} size="small" />
        </span>
      )}
    >
      <div css={classes.fields}>
        <Stack>
          <TextField
            fixedLabel
            fullWidth
            errorMessage={getErrorMessage(`${tab}:title`)}
            key={`${tab}:title`}
            label={t('cms:titleOfEachBlock')}
            name={`${name}.${tab}:title`}
            placeholder={t('cms:titleOfEachBlock')}
            required={tab === DEFAULT_LOCALE}
            type="text"
            variant="outlined"
          />
          {getErrorMessage(`${tab}:title`) && (
            <FormHelperText error>{getErrorMessage(`${tab}:title`)}</FormHelperText>
          )}
        </Stack>
        <TextField
          fixedLabel
          fullWidth
          multiline
          key={`${tab}:description`}
          label={t('common:description')}
          name={`${name}.${tab}:description`}
          placeholder={t('cms:blockDescription')}
          rows={3}
          type="text"
          variant="outlined"
        />
        <Stack>
          <Suspense fallback={<TextEditorFieldSkeleton />}>
            {/* keyed by the tab: a mounted editor does not follow a value handed to it afterwards */}
            <TextEditorField
              id={`${name}.${tab}.content`}
              key={tab}
              label={t('cms:content')}
              name={`${name}.${tab}:content`}
              required={tab === DEFAULT_LOCALE}
              toolbar={['bold', 'italic', 'underline', 'link', 'orderedList', 'bulletList']}
            />
          </Suspense>
          {getErrorMessage(`${tab}:content`) && (
            <FormHelperText error>{getErrorMessage(`${tab}:content`)}</FormHelperText>
          )}
        </Stack>
        <div css={classes.image}>
          <DropzoneField
            shouldReset // can reset input in edition
            accept={ACCEPTED_IMAGE_TYPES}
            error={getErrorMessage('image')}
            helperText={t('cms:blockImageHelper')}
            inputLabel={t('common:addImage')}
            label={t('common:image')}
            maxSize={MAX_IMAGE_SIZE_BYTES}
            multiple={false}
            name={`${name}.image`}
          />
          {/* the side only means something once there is a picture to place */}
          {!!image && (
            <Stack>
              {/* a single choice, cleared by clicking the held pill again */}
              <ChoiceChipsField
                helperText={t('cms:imagePositionHelper')}
                label={t('cms:imagePosition')}
                name={`${name}.imagePosition`}
                options={imagePositionOptions}
              />
              {getErrorMessage('imagePosition') && (
                <FormHelperText error>{getErrorMessage('imagePosition')}</FormHelperText>
              )}
            </Stack>
          )}
        </div>
      </div>
    </CardFormBlock>
  );
};

export default PageSectionBlockEditor;
