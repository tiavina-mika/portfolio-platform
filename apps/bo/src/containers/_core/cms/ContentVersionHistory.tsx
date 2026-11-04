import { Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';

import Dialog from '@/components/Dialog';
import {
  BUTTON_HEIGHT, BUTTON_TOUCH_HEIGHT, FONT_SIZE_BODY, FONT_SIZE_META,
  FORM_WORKBENCH_PREVIEW_PADDING, RADIUS,
  VERSION_LIST_ACTION_PADDING_X, VERSION_LIST_DATE_GAP, VERSION_LIST_PADDING_Y,
  VERSION_LIST_ROW_GAP, VERSION_LIST_ROW_PADDING_X, VERSION_LIST_ROW_PADDING_Y,
} from '@/constants/_core/ui.constants';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';
import { getUserFullName } from '@/utils/_core/user.utils';

const classes = {
  list: { padding: `${VERSION_LIST_PADDING_Y}px 0` },
  /*
   * the rows run edge to edge and are separated by a filet: the list is a sequence of past states,
   * not a stack of cards, and an inset row inside an already bordered panel reads as the second
   */
  row: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${VERSION_LIST_ROW_GAP}px`,
    padding: `${VERSION_LIST_ROW_PADDING_Y}px ${VERSION_LIST_ROW_PADDING_X}px`,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  rowText: { minWidth: 0 },
  date: (theme: Theme) => ({
    fontSize: FONT_SIZE_BODY,
    color: getDesignTokens(theme).text,
  }),
  author: (theme: Theme) => ({
    marginTop: `${VERSION_LIST_DATE_GAP}px`,
    fontSize: FONT_SIZE_META,
    color: getDesignTokens(theme).textSecondary,
  }),
  /*
   * putting a version back is one word, not a slab: it is offered on every row of the list, and a
   * filled button repeated down a column would read as the point of the panel
   */
  action: (theme: Theme) => ({
    height: BUTTON_HEIGHT,
    padding: `0 ${VERSION_LIST_ACTION_PADDING_X}px`,
    font: 'inherit',
    fontSize: FONT_SIZE_META,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.primary.dark,
    background: 'none',
    border: 'none',
    borderRadius: RADIUS,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    '&:hover': { backgroundColor: getTintedBackground(theme, theme.palette.primary.main) },
    [theme.breakpoints.down('sm')]: { height: BUTTON_TOUCH_HEIGHT },
  }),
  empty: { padding: FORM_WORKBENCH_PREVIEW_PADDING },
};

type Props = {
  versions: IContentVersion[];
  canRestore: boolean;
  onRestore: (versionId: string) => void;
};

/**
 * The past states of an article or a page: when each one was written and by whom, newest first,
 * with what it takes to put one back. It is shown inside the preview column of the page form and
 * as the history tab of the article form, so it draws no surface of its own — the panel it is
 * dropped into already has one.
 */
const ContentVersionHistory = ({ versions, canRestore, onRestore }: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const handleToggleConfirm = () => setSelectedVersionId(null);

  const handleConfirmRestore = () => {
    if (!selectedVersionId) return;
    onRestore(selectedVersionId);
    setSelectedVersionId(null);
  };

  if (versions.length === 0) {
    return (
      <Typography css={classes.empty} variant="body2">
        {t('cms:contentVersion.noHistory')}
      </Typography>
    );
  }

  return (
    <>
      <div css={classes.list}>
        {versions.map((version) => (
          <div css={classes.row} key={version.id}>
            <div css={classes.rowText}>
              <div css={classes.date}>{displayDate(version.createdAt)}</div>
              {version.createdBy && (
                <div css={classes.author}>{getUserFullName(version.createdBy)}</div>
              )}
            </div>
            {canRestore && (
              <button
                css={classes.action}
                onClick={() => setSelectedVersionId(version.id)}
                type="button"
              >
                {t('cms:contentVersion.restore')}
              </button>
            )}
          </div>
        ))}
      </div>

      <Dialog
        buttonColor="primary"
        maxWidth="xs"
        onPrimaryButtonAction={handleConfirmRestore}
        open={!!selectedVersionId}
        primaryButtonText={t('cms:contentVersion.restore')}
        title={t('cms:contentVersion.confirmRestoreTitle')}
        toggle={handleToggleConfirm}
      >
        {t('cms:contentVersion.confirmRestoreMessage')}
      </Dialog>
    </>
  );
};

export default ContentVersionHistory;
