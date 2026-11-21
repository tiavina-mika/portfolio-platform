import {
  Divider, Stack, Typography,
} from '@mui/material';
import { TargetEnum } from '@shared/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import CheckboxField from '@/components/form/fields/CheckboxField';
import DateRangeField from '@/components/form/fields/DateRangeField';
import FieldsArray from '@/components/form/fields/FieldsArray';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import { SETTINGS_ROW_GAP } from '@/constants/_core/ui.constants';
import { PROJECT_LINK_DEFAULTS } from '@/constants/_domain/project.constants';
import { ISelectOption } from '@/types/_core/app.type';

const classes = {
  /*
   * a setting whose control is a switch is a row, not a field: the question on the left, the answer
   * pinned to the right edge, the same shape the settings page uses for its own toggles
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
 * What the project is rather than what it says: whether it is visible on the site, which website
 * shows it, the society it was made for, when it ran, and the addresses where it can be seen or read.
 */
const ProjectFormSettingsSection = () => {
  const { t } = useTranslation(['common', 'cms', 'project']);

  // a project belongs to one website: the portfolio or Aldaron, never both
  const targetOptions: ISelectOption[] = useMemo(() => [
    { label: t('cms:target.portfolio'), value: TargetEnum.PORTFOLIO },
    { label: t('cms:target.aldaron'), value: TargetEnum.ALDARON },
  ], [t]);

  return (
    <CardFormBlock title={t('common:settings')}>
      <Stack spacing={2}>
        {/* visible or not, the one setting that changes what every other one is for */}
        <div css={classes.switchRow}>
          <div css={classes.switchRowText}>
            <Typography variant="h6">{t('common:active')}</Typography>
            <Typography variant="body2">{t('project:project.activeProjectVisible')}</Typography>
          </div>
          <CheckboxField isSwitch name="active" />
        </div>
        <Divider />

        <SelectField
          helperText={t('project:project.targetHelper')}
          label={t('project:project.target')}
          name="target"
          options={targetOptions}
          variant="outlined"
        />

        <TextField
          fixedLabel
          fullWidth
          label={t('project:project.society')}
          name="society"
          type="text"
          variant="outlined"
        />
        <DateRangeField label={t('common:date')} name="dateRange" />
        <Divider />

        <TextField
          fixedLabel
          fullWidth
          label={t('project:project.website')}
          name="website"
          type="text"
          variant="outlined"
        />
        <TextField
          fixedLabel
          fullWidth
          label="Youtube"
          name="youtube"
          type="text"
          variant="outlined"
        />
        <FieldsArray
          addButtonLabel={t('project:project.addLinks')}
          label={t('project:project.links')}
          name="links"
          subFieldsDirection="column"
          subNames={[{
            name: 'url', type: 'url', placeholder: t('project:project.link'), defaultValue: PROJECT_LINK_DEFAULTS.link,
          }]}
        />
        <FieldsArray
          addButtonLabel={t('project:project.addRepository')}
          label={t('project:project.repositories')}
          name="repositories"
          subFieldsDirection="column"
          subNames={[{
            name: 'url',
            type: 'url',
            placeholder: t('project:project.link'),
            defaultValue: PROJECT_LINK_DEFAULTS.repository,
          }]}
        />
        <FieldsArray
          addButtonLabel={t('project:project.addNpmLinks')}
          label={t('project:project.npmLinks')}
          name="npm"
          subFieldsDirection="column"
          subNames={[{
            name: 'url',
            type: 'url',
            placeholder: t('project:project.link'),
            defaultValue: PROJECT_LINK_DEFAULTS.npm,
          }]}
        />
        <FieldsArray
          addButtonLabel={t('project:project.addCodesandboxLinks')}
          label={t('project:project.codesandboxLinks')}
          name="codesandbox"
          subFieldsDirection="column"
          subNames={[{
            name: 'url',
            type: 'url',
            placeholder: t('project:project.link'),
            defaultValue: PROJECT_LINK_DEFAULTS.codesandbox,
          }]}
        />
      </Stack>
    </CardFormBlock>
  );
};

export default ProjectFormSettingsSection;
