import { useState } from 'react';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import Form from '@/components/form/Form';
import {
  CONTENT_GAP, FORM_WORKBENCH_BREAKPOINT, FORM_WORKBENCH_GAP,
  FORM_WORKBENCH_PREVIEW_WIDTH, FORM_WORKBENCH_RAIL_COLLAPSED_WIDTH, FORM_WORKBENCH_RAIL_WIDTH,
} from '@/constants/_core/ui.constants';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { CmsFormSectionEnum, ICmsFormSections } from '@/types/_core/cms.type';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { Locale } from '@/types/_core/setting.type';

import CmsFormErrorsAlert from './CmsFormErrorsAlert';
import CmsFormFooterBar from './CmsFormFooterBar';
import CmsFormPreviewPanel, { type CmsFormPreviewTab } from './CmsFormPreviewPanel';
import CmsFormSectionSkeleton from './CmsFormSectionSkeleton';
import CmsFormSectionsRail from './CmsFormSectionsRail';
import CmsFormToolbar from './CmsFormToolbar';

const classes = {
  workbench: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${CONTENT_GAP}px`,
  },
  /*
   * the summary rail, the section being filled and what it produces, side by side. Under the
   * breakpoint the three stack in that order: the rail above the form, the preview under it
   */
  row: (railCollapsed: boolean) => (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `${railCollapsed
      ? FORM_WORKBENCH_RAIL_COLLAPSED_WIDTH
      : FORM_WORKBENCH_RAIL_WIDTH}px minmax(0, 1fr) ${FORM_WORKBENCH_PREVIEW_WIDTH}px`,
    gap: `${FORM_WORKBENCH_GAP}px`,
    alignItems: 'start',
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  }),
  section: { minWidth: 0 },
};

type Props<TFieldValues extends FieldValues, TTransformedValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues, any, TTransformedValues>;
  formId: string;
  /** the sections the form is made of, and the fields each one counts */
  config: ICmsFormSections;
  onSubmit: (values: TTransformedValues) => void;
  loading?: boolean;
  /*
   * the initial values are computed asynchronously (the record's files and categories are read
   * into the form's shape), so until they land the section and the preview hold their skeletons
   * rather than an empty form that would then jump to the real one
   */
  initializing: boolean;
  /** what the section skeleton says is being waited for, ex: "Loading the page…" */
  loadingLabel: string;
  /** when the record was last written, absent while it has never been saved */
  savedAt?: string;
  /** the JSON import/template pair, offered on creation only */
  importAction?: ReactNode;
  /** the fields of the open section, in the language tab currently open */
  renderSection: (section: CmsFormSectionEnum, tab: Locale) => ReactNode;
  /** what the open section produces, drawn in the preview column */
  renderPreview: (section: CmsFormSectionEnum, tab: Locale) => ReactNode;
  /** past versions of the content, shown in the preview column's second tab */
  versions?: IContentVersion[];
  canRestoreVersion?: boolean;
  onRestoreVersion?: (versionId: string) => void;
};

/**
 * A CMS form laid out as a workbench: the summary rail naming its sections, the section being
 * filled, and what it produces drawn next to it. The page and article forms share it and only
 * bring their own sections and previews.
 *
 * It replaces wizards whose steps had to be walked in order. A record is rarely written front to
 * back — an editor coming back to fix one meta description had to step past the whole content to
 * reach it, and nothing about the record actually required that order.
 */
const CmsFormWorkbench = <TFieldValues extends FieldValues, TTransformedValues extends FieldValues>({
  form, formId, config, onSubmit, loading, initializing, loadingLabel, savedAt, importAction,
  renderSection, renderPreview, versions, canRestoreVersion, onRestoreVersion,
}: Props<TFieldValues, TTransformedValues>) => {
  // the language the translated fields are shown in — the whole workbench follows it
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const [activeSection, setActiveSection] = useState<CmsFormSectionEnum>(config.sections[0]);
  /*
   * the summary opens folded: it is pinned next to the form, so what it is there for — which
   * section is open and how full each one is — is already legible from its glyphs and counts,
   * and the 250px it takes unfolded are 250px the fields next to it do not get
   */
  const [isRailCollapsed, setIsRailCollapsed] = useState(true);
  const [previewTab, setPreviewTab] = useState<CmsFormPreviewTab>('preview');

  /*
   * triggered manually rather than through a native type="submit": the action lives in the band
   * above the form and in the footer bar under it, both outside the sections the form renders
   */
  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleToggleRail = () => setIsRailCollapsed((previous) => !previous);

  const handleGoToNextSection = () => {
    const nextSection = config.sections[config.sections.indexOf(activeSection) + 1];

    if (nextSection) setActiveSection(nextSection);
  };

  return (
    <Form
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      <div css={classes.workbench}>
        <CmsFormErrorsAlert />
        <CmsFormToolbar
          actions={importAction}
          loading={loading}
          onSave={handleSave}
          onTabChange={onTabChange}
          savedAt={savedAt}
          tab={tab}
        />
        <div css={classes.row(isRailCollapsed)}>
          <CmsFormSectionsRail
            activeSection={activeSection}
            collapsed={isRailCollapsed}
            config={config}
            onSectionChange={setActiveSection}
            onToggleCollapsed={handleToggleRail}
            tab={tab}
          />
          <div css={classes.section}>
            {initializing
              ? <CmsFormSectionSkeleton label={loadingLabel} />
              : renderSection(activeSection, tab)}
          </div>
          <CmsFormPreviewPanel
            canRestoreVersion={canRestoreVersion}
            loading={initializing}
            onRestoreVersion={onRestoreVersion}
            onTabChange={setPreviewTab}
            preview={renderPreview(activeSection, tab)}
            tab={previewTab}
            versions={versions}
          />
        </div>
        <CmsFormFooterBar
          activeSection={activeSection}
          config={config}
          loading={loading}
          onGoToNextSection={handleGoToNextSection}
          onSave={handleSave}
          tab={tab}
        />
      </div>
    </Form>
  );
};

export default CmsFormWorkbench;
