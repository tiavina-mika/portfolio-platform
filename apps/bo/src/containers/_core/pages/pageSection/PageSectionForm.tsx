import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  useFieldArray, useForm, type Control, type FieldErrors,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiEye } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import ConfirmDeletionFormModal from '@/components/form/ConfirmDeletionFormModal';
import Form from '@/components/form/Form';
import { PAGE_SECTION_TRANSLATED_FIELDS } from '@/constants/_core/cms.constants';
import {
  FORM_WORKBENCH_BREAKPOINT, FORM_WORKBENCH_PHONE_BREAKPOINT, PAGE_HEAD_ACTION_ICON_SIZE,
  SECTION_FORM_COLUMN_GAP, SECTION_FORM_GAP, SECTION_FORM_LIST_TABLET_WIDTH, SECTION_FORM_LIST_WIDTH,
} from '@/constants/_core/ui.constants';
import CmsFormSectionSkeleton from '@/containers/_core/cms/form/CmsFormSectionSkeleton';
import CmsFormToolbar from '@/containers/_core/cms/form/CmsFormToolbar';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { IPageSection, PageSectionInput } from '@/types/_core/page.type';
import { getPageSectionEditionInitialValues } from '@/utils/_core/cms.utils';
import { pageSectionSchema } from '@/validations/_core/page.validations';

import PageSectionBlockEditor from './PageSectionBlockEditor';
import PageSectionBlocksList from './PageSectionBlocksList';
import PageSectionDetailsCard from './PageSectionDetailsCard';
import PageSectionFormFooterBar from './PageSectionFormFooterBar';
import PageSectionPreviewDialog from './PageSectionPreviewDialog';

const PAGE_SECTION_FORM_ID = 'page-section-form-id';

const classes = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_GAP}px`,
  },
  /*
   * the section and its list of blocks on the left, the open block on the right. The list narrows on
   * a tablet, and on a phone it sits above the block it opens
   */
  row: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${SECTION_FORM_LIST_WIDTH}px minmax(0, 1fr)`,
    gap: `${SECTION_FORM_GAP}px`,
    alignItems: 'start',
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: {
      gridTemplateColumns: `${SECTION_FORM_LIST_TABLET_WIDTH}px minmax(0, 1fr)`,
    },
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  }),
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SECTION_FORM_COLUMN_GAP}px`,
    minWidth: 0,
  },
  editor: { minWidth: 0 },
};

type Props = {
  onSubmit: (values: PageSectionInput) => void;
  onCancel: () => void;
  section?: IPageSection;
  loading?: boolean;
};

/**
 * A section of a page and its blocks, edited side by side: the section's title and description and
 * the list of its blocks in a narrow column, the one block being written next to it. A block is
 * opened from the list, moved up or down there, and deleted from its own card.
 *
 * It replaces a single column where each block was a full card stacked under the previous one —
 * past three blocks the one being written was screens away from the list that said how many there
 * were, and changing their order meant deleting and retyping them.
 */
const PageSectionForm = ({
  onSubmit, onCancel, section, loading,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  // the language the translated fields are shown in — the whole form and its preview follow it
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blockIndexToDelete, setBlockIndexToDelete] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!section);

  const form = useForm<PageSectionInput>({
    resolver: zodResolver(pageSectionSchema),
  });

  const {
    reset, control,
  } = form;

  const {
    fields, append, remove, move,
  } = useFieldArray({
    /*
     * the schema's translated fields are generated, so the inferred input type is an open record
     * that no longer names `blocks` as an array — typed back here for the field array only
     */
    control: control as unknown as Control<{ blocks: Record<string, unknown>[] }>,
    name: 'blocks',
  });

  useEffect(() => {
    if (!section) {
      reset({ active: true, blocks: [{}] });
      setIsInitializing(false);
      return;
    }

    // guards against a stale response landing after a newer `section` has already been selected
    let isCancelled = false;

    const init = async () => {
      setIsInitializing(true);
      const values = await getPageSectionEditionInitialValues(section);

      if (isCancelled) return;
      reset(values);
      setSelectedIndex(0);
      setIsInitializing(false);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [section, reset]);

  // a refused block the editor cannot see is opened, so the save does not fail without a visible reason
  const handleInvalid = (errors: FieldErrors<PageSectionInput>) => {
    const blockErrors = errors.blocks as unknown as (object | undefined)[] | undefined;

    if (!blockErrors || blockErrors[selectedIndex]) return;

    const firstRefusedIndex = blockErrors.findIndex((error) => !!error);

    if (firstRefusedIndex >= 0) setSelectedIndex(firstRefusedIndex);
  };

  /*
   * triggered manually rather than through a native type="submit": the action lives in the band
   * above the form and in the footer bar under it, both outside the fields the form renders
   */
  const handleSave = () => {
    form.handleSubmit(onSubmit, handleInvalid)();
  };

  const handleAddBlock = () => {
    append({}, { shouldFocus: false });
    setSelectedIndex(fields.length);
  };

  const handleMoveBlock = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    move(from, to);
    // the open block follows its own move, and stays open when its neighbour moves over it
    setSelectedIndex((previous) => {
      if (previous === from) return to;
      if (previous === to) return from;
      return previous;
    });
  };

  const handleCloseDeleteConfirmation = () => setBlockIndexToDelete(null);

  const handleConfirmDeleteBlock = () => {
    if (blockIndexToDelete === null) return;

    // a section always keeps one block to write in: deleting the last one leaves an empty one
    if (fields.length === 1) {
      remove(0);
      append({}, { shouldFocus: false });
      setSelectedIndex(0);
      setBlockIndexToDelete(null);
      return;
    }

    remove(blockIndexToDelete);
    setSelectedIndex((previous) => {
      if (previous > blockIndexToDelete) return previous - 1;
      return Math.min(previous, fields.length - 2);
    });
    setBlockIndexToDelete(null);
  };

  const selectedField = fields[Math.min(selectedIndex, fields.length - 1)];
  const openIndex = Math.min(selectedIndex, fields.length - 1);

  return (
    <Form
      form={form}
      formId={PAGE_SECTION_FORM_ID}
      loading={loading}
      onSubmit={onSubmit}
    >
      <div css={classes.root}>
        <CmsFormToolbar
          loading={loading}
          onSave={handleSave}
          onTabChange={onTabChange}
          savedAt={section?.updatedAt}
          tab={tab}
          translatedFields={PAGE_SECTION_TRANSLATED_FIELDS}
          actions={(
            <Button
              onClick={() => setIsPreviewOpen(true)}
              startIcon={<FiEye size={PAGE_HEAD_ACTION_ICON_SIZE} />}
              variant="outlined"
            >
              {t('common:preview')}
            </Button>
          )}
        />
        <div css={classes.row}>
          <div css={classes.column}>
            <PageSectionDetailsCard tab={tab} />
            <PageSectionBlocksList
              blockIds={fields.map((field) => field.id)}
              onAdd={handleAddBlock}
              onMove={handleMoveBlock}
              onSelect={setSelectedIndex}
              selectedIndex={openIndex}
              tab={tab}
            />
          </div>
          <div css={classes.editor}>
            {isInitializing || !selectedField
              ? <CmsFormSectionSkeleton label={t('cms:sectionForm.loadingSection')} />
              : (
                <PageSectionBlockEditor
                  index={openIndex}
                  key={selectedField.id}
                  onDelete={() => setBlockIndexToDelete(openIndex)}
                  tab={tab}
                />
              )}
          </div>
        </div>
        <PageSectionFormFooterBar
          loading={loading}
          onCancel={onCancel}
          onSave={handleSave}
          tab={tab}
        />
      </div>

      {blockIndexToDelete !== null && (
        <ConfirmDeletionFormModal
          open
          label={t('cms:sectionForm.blockNumber', { value: blockIndexToDelete + 1 }).toLowerCase()}
          onConfirmed={handleConfirmDeleteBlock}
          toggle={handleCloseDeleteConfirmation}
          type={t('cms:block')}
          value={`${blockIndexToDelete + 1}`}
        />
      )}
      {isPreviewOpen && (
        <PageSectionPreviewDialog
          open
          onClose={() => setIsPreviewOpen(false)}
          onTabChange={onTabChange}
          tab={tab}
        />
      )}
    </Form>
  );
};

export default PageSectionForm;
