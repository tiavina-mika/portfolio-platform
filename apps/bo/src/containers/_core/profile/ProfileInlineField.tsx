import {
  Box, Button, ButtonBase, TextField, Typography, type Theme,
} from '@mui/material';
import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ProfileRowChevronIcon } from '@/components/icons/ProfileIcons';
import {
  PROFILE_ACCOUNT_ROW_MIN_HEIGHT, PROFILE_FIELD_ACTIONS_GAP, PROFILE_FIELD_GAP,
  PROFILE_FIELD_LABEL_WIDTH, PROFILE_FIELD_PADDING_Y, PROFILE_FIELD_VALUE_PADDING_X,
  PROFILE_FIELD_VALUE_PADDING_Y, SETTINGS_ROW_LABEL_GAP, SETTINGS_ROW_PADDING_X,
} from '@/constants/_core/ui/entity.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * what the field is named, what it says, and — only while it is open — the pair of actions
   * closing it. The name column is fixed so every value in the card starts on the same edge
   */
  row: {
    display: 'grid',
    gridTemplateColumns: `${PROFILE_FIELD_LABEL_WIDTH}px minmax(0, 1fr) auto`,
    columnGap: `${PROFILE_FIELD_GAP}px`,
    alignItems: 'center',
    padding: `${PROFILE_FIELD_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
  },
  /*
   * the resting value is padded like the input that replaces it and pulled back out by the same
   * amount, so opening the field grows a box around the text instead of moving it
   */
  value: (theme: Theme) => ({
    justifySelf: 'start' as const,
    justifyContent: 'flex-start',
    maxWidth: '100%',
    padding: `${PROFILE_FIELD_VALUE_PADDING_Y}px ${PROFILE_FIELD_VALUE_PADDING_X}px`,
    margin: `${-PROFILE_FIELD_VALUE_PADDING_Y}px ${-PROFILE_FIELD_VALUE_PADDING_X}px`,
    borderRadius: RADIUS,
    // a caret, not a hand: clicking the text opens it for rewriting rather than navigating away
    cursor: 'text',
    textAlign: 'start' as const,
    '&:hover': { backgroundColor: getDesignTokens(theme).surfaceSecondary },
  }),
  actions: { display: 'flex', gap: `${PROFILE_FIELD_ACTIONS_GAP}px` },
  /*
   * a touch screen has no room for a name column, a value column and a pair of buttons on one row:
   * the whole row becomes the target and hands the field to the dialog instead
   */
  touchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${PROFILE_FIELD_ACTIONS_GAP}px`,
    width: '100%',
    minHeight: PROFILE_ACCOUNT_ROW_MIN_HEIGHT,
    padding: `${PROFILE_FIELD_PADDING_Y}px ${SETTINGS_ROW_PADDING_X}px`,
    textAlign: 'start' as const,
  },
  touchLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${SETTINGS_ROW_LABEL_GAP}px`,
    minWidth: 0,
  },
  chevron: (theme: Theme) => ({
    display: 'flex',
    flexShrink: 0,
    color: getDesignTokens(theme).textDisabled,
  }),
};

/*
 * clicking the value is what opened the field, so the caret has to land in it — otherwise the click
 * reads as having done nothing. Declared outside the component so the ref stays the same function
 * across renders and does not refocus the input on every keystroke.
 */
const focusOnMount = (input: HTMLInputElement | null) => input?.focus();

type Props = {
  label: string;
  value?: string;
  loading?: boolean;
  // the row is read-only on a touch screen: the whole of it opens the dialog holding both fields
  isTouchScreen?: boolean;
  onSave: (value: string) => void;
  onOpenDialog: () => void;
};

/**
 * One field of the profile's details card: its name, its value, and — on a pointer device — the
 * value itself as the way into rewriting it, opened in place rather than through a dialog.
 */
const ProfileInlineField = ({
  label, value, loading, isTouchScreen = false, onSave, onOpenDialog,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);

  const isEditing = draft !== null;

  const handleStartEdit = () => setDraft(value ?? '');
  const handleCancel = () => setDraft(null);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value);

  const handleSave = () => {
    if (draft === null) return;

    onSave(draft);
    setDraft(null);
  };

  // Enter commits the field and Escape drops it, the way the two buttons under the cursor do
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
      return;
    }
    if (event.key === 'Escape') handleCancel();
  };

  if (isTouchScreen) {
    return (
      <ButtonBase css={classes.touchRow} onClick={onOpenDialog}>
        <div css={classes.touchLabel}>
          <Typography variant="caption">{label}</Typography>
          <Typography noWrap variant="body1">{value ?? '-'}</Typography>
        </div>
        <Box component="span" css={classes.chevron}>
          <ProfileRowChevronIcon />
        </Box>
      </ButtonBase>
    );
  }

  return (
    <Box css={classes.row}>
      <Typography variant="caption">{label}</Typography>
      {isEditing
        ? (
          <>
            <TextField
              fullWidth
              inputRef={focusOnMount}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              value={draft}
            />
            <div css={classes.actions}>
              <Button disabled={loading} onClick={handleCancel} variant="outlined">
                {t('cancel')}
              </Button>
              <Button loading={loading} onClick={handleSave} variant="contained">
                {t('save')}
              </Button>
            </div>
          </>
        )
        : (
          <>
            <ButtonBase css={classes.value} onClick={handleStartEdit}>
              <Typography variant="body1">{value ?? '-'}</Typography>
            </ButtonBase>
            <div />
          </>
        )}
    </Box>
  );
};

export default ProfileInlineField;
