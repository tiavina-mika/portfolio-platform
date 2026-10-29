import {
  Divider, Stack, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import CheckboxField from '@/components/form/fields/CheckboxField';
import TextField from '@/components/form/fields/TextField';
import {
  ARTICLE_DEFAULT_VIEWS_GOAL, ARTICLE_VIEWS_GOAL_MAX, ARTICLE_VIEWS_GOAL_MIN,
} from '@/constants/_core/cms.constants';
import { SETTINGS_ROW_GAP } from '@/constants/_core/ui.constants';
import CmsCountryField from '@/containers/_core/cms/CmsCountryField';

const classes = {
  /*
   * a setting whose control is a switch is a row, not a field: the question on the left, the answer
   * pinned to the right edge — the same shape the settings page uses for its own toggles
   */
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${SETTINGS_ROW_GAP}px`,
  },
  switchRowText: { minWidth: 0 },
};

/**
 * What the article is rather than what it says: whether it is visible on the site, and the number
 * of views its audience is measured against in the back-office. The shelves it is filed under have
 * a section of their own.
 */
const ArticleFormSettingsSection = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);

  return (
    <CardFormBlock title={t('common:settings')}>
      <Stack spacing={2}>
        {/* visible or not — the one setting that changes what every other one is for */}
        <div css={classes.switchRow}>
          <div css={classes.switchRowText}>
            <Typography variant="h6">{t('common:active')}</Typography>
            <Typography variant="body2">{t('cms:activeArticleVisible')}</Typography>
          </div>
          <CheckboxField isSwitch name="active" />
        </div>
        <Divider />

        <CmsCountryField />
        <Divider />

        {/* the target this article's views are measured against, in the BO */}
        <TextField
          fixedLabel
          fullWidth
          label={t('cms:articleForm.viewsGoalOptional')}
          name="viewsGoal"
          placeholder={String(ARTICLE_DEFAULT_VIEWS_GOAL)}
          type="number"
          variant="outlined"
          helperText={t('cms:viewsGoalHelper', {
            value: ARTICLE_DEFAULT_VIEWS_GOAL.toLocaleString(),
          })}
          slotProps={{
            htmlInput: {
              min: ARTICLE_VIEWS_GOAL_MIN,
              max: ARTICLE_VIEWS_GOAL_MAX,
            },
          }}
        />
      </Stack>
    </CardFormBlock>
  );
};

export default ArticleFormSettingsSection;
