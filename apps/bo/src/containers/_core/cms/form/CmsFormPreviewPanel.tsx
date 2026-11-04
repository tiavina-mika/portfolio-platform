import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';


import {
  BUTTON_TOUCH_HEIGHT, FONT_SIZE_META,
  FORM_WORKBENCH_BREAKPOINT, FORM_WORKBENCH_PREVIEW_GAP, FORM_WORKBENCH_PREVIEW_PADDING,
  FORM_WORKBENCH_PREVIEW_TAB_HEIGHT, FORM_WORKBENCH_PREVIEW_TAB_PADDING_X, FORM_WORKBENCH_PREVIEW_TABS_GAP,
  FORM_WORKBENCH_PREVIEW_TABS_PADDING, RADIUS, RADIUS_LG,
} from '@/constants/_core/ui.constants';
import ContentVersionHistory from '@/containers/_core/cms/ContentVersionHistory';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

import CmsFormPreviewSkeleton from './CmsFormPreviewSkeleton';

export type CmsFormPreviewTab = 'preview' | 'history';

const classes = {
  /*
   * the third column of the workbench. Under the breakpoint the grid collapses to one column and
   * the panel follows the section it previews, so a tablet or a phone still sees what is being
   * written — only lower down, after the fields
   */
  panel: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      minWidth: 0,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS_LG,
      boxShadow: tokens.shadow,
    };
  },
  /*
   * two slots sharing the head of the column. They switch what the column shows rather than where
   * the reader is in the app, so they are a pair of buttons on the card's own surface — an
   * underlined tab strip here would read as a second level of navigation next to the form
   */
  tabs: (theme: Theme) => ({
    display: 'flex',
    gap: `${FORM_WORKBENCH_PREVIEW_TABS_GAP}px`,
    padding: FORM_WORKBENCH_PREVIEW_TABS_PADDING,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  tab: (active: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      flex: 1,
      height: FORM_WORKBENCH_PREVIEW_TAB_HEIGHT,
      padding: `0 ${FORM_WORKBENCH_PREVIEW_TAB_PADDING_X}px`,
      font: 'inherit',
      fontSize: FONT_SIZE_META,
      fontWeight: theme.typography.fontWeightMedium,
      border: 'none',
      borderRadius: RADIUS,
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: active
        ? theme.palette.primary.dark
        : tokens.textSecondary,
      '&:hover': { backgroundColor: tokens.surfaceSecondary },
      // under the breakpoint every target in the workbench is a touch target
      [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { height: BUTTON_TOUCH_HEIGHT },
    };
  },
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_PREVIEW_GAP}px`,
    padding: FORM_WORKBENCH_PREVIEW_PADDING,
  },
};

type Props = {
  /** what the section being filled produces — the form picks it, since it depends on the record */
  preview: ReactNode;
  tab: CmsFormPreviewTab;
  onTabChange: (tab: CmsFormPreviewTab) => void;
  /** past versions of the content, only ever available on an existing record */
  versions?: IContentVersion[];
  canRestoreVersion?: boolean;
  onRestoreVersion?: (versionId: string) => void;
  /** the record is still being read into the form — the column holds its outline meanwhile */
  loading?: boolean;
};

/**
 * What the section being filled will produce, drawn next to it: the search result and the social
 * card for the SEO section, the record as the site renders it for the content and the pictures,
 * its own summary for the settings.
 *
 * The history of the record shares the column as a second slot rather than standing as a tab of the
 * whole screen — restoring an earlier version is a question asked while looking at the current
 * one, not a separate page of the back-office.
 */
const CmsFormPreviewPanel = ({
  preview, tab, onTabChange, versions, canRestoreVersion, onRestoreVersion, loading,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  const hasHistory = !!onRestoreVersion;
  const currentTab = hasHistory
    ? tab
    : 'preview';

  return (
    <aside css={classes.panel}>
      <div css={classes.tabs} role="tablist">
        <button
          aria-selected={currentTab === 'preview'}
          css={classes.tab(currentTab === 'preview')}
          onClick={() => onTabChange('preview')}
          role="tab"
          type="button"
        >
          {t('common:preview')}
        </button>
        {hasHistory && (
          <button
            aria-selected={currentTab === 'history'}
            css={classes.tab(currentTab === 'history')}
            onClick={() => onTabChange('history')}
            role="tab"
            type="button"
          >
            {t('cms:contentVersion.history')}
          </button>
        )}
      </div>
      {/* the version list runs edge to edge, so it brings its own insets instead of the body's */}
      {loading && (
        <div css={classes.body}>
          <CmsFormPreviewSkeleton />
        </div>
      )}
      {!loading && (currentTab === 'history' && onRestoreVersion
        ? (
          <ContentVersionHistory
            canRestore={!!canRestoreVersion}
            onRestore={onRestoreVersion}
            versions={versions ?? []}
          />
        )
        : <div css={classes.body}>{preview}</div>)}
    </aside>
  );
};

export default CmsFormPreviewPanel;
