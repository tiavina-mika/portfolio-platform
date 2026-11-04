import {
  Divider, Stack, Typography,
} from '@mui/material';
import { t } from 'i18next';
import { useFormContext } from 'react-hook-form';

import CardFormBlock from '@/components/form/CardFormBlock';
import CheckboxField from '@/components/form/fields/CheckboxField';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import { pageLinkLocationOptions } from '@/constants/_core/cms.constants';
import { SETTINGS_ROW_GAP } from '@/constants/_core/ui.constants';
import CmsCountryField from '@/containers/_core/cms/CmsCountryField';
import { IPageFormInput } from '@/types/_core/page.type';
import { formatTechnicalCode } from '@/utils/_core/utils';

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
 * What the page is rather than what it says: whether it is on the site, the technical code the
 * apps look it up by, and which navigation it is linked from. Where it sits in the category tree
 * has a section of its own.
 */
const PageFormSettingsSection = () => {
  const {
    setValue,
  } = useFormContext<IPageFormInput>();

  // normalize whatever the admin types into an upper snake case technical code (ex: "Privacy policy" => "PRIVACY_POLICY")
  const handleCodeChange = (value: string | number) => {
    setValue('code', formatTechnicalCode(String(value)), { shouldValidate: true });
  };

  return (
    <CardFormBlock title={t('common:settings')}>
      <Stack spacing={2}>
        {/* on the site or not — the one setting that changes what every other one is for */}
        <div css={classes.switchRow}>
          <div css={classes.switchRowText}>
            <Typography variant="h6">{t('common:active')}</Typography>
            <Typography variant="body2">{t('cms:activePageVisible')}</Typography>
          </div>
          <CheckboxField isSwitch name="active" />
        </div>
        <Divider />

        <CmsCountryField />
        <Divider />

        <TextField
          fixedLabel
          fullWidth
          helperText={t('cms:technicalCodeHelper')}
          label={t('cms:technicalCode')}
          name="code"
          onFieldChange={handleCodeChange}
          type="text"
          variant="outlined"
        />
        <Divider />

        <SelectField
          isClearable
          isMulti
          helperText={t('cms:linkLocationHelper')}
          label={t('cms:linkLocation')}
          name="linkLocations"
          options={pageLinkLocationOptions}
          variant="outlined"
        />
      </Stack>
    </CardFormBlock>
  );
};

export default PageFormSettingsSection;
