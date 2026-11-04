import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Theme } from '@mui/material/styles';
import type { CategoryEntityEnum } from '@shared/types';

import CardFormBlock from '@/components/form/CardFormBlock';
import CheckboxField from '@/components/form/fields/CheckboxField';
import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import TextField from '@/components/form/fields/TextField';
import { categoryEntityOptions } from '@/constants/_core/cms.constants';
import {
  CATEGORY_FORM_PATH_BOX_GAP, CATEGORY_FORM_PATH_BOX_PADDING_X, CATEGORY_FORM_PATH_BOX_PADDING_Y,
  FONT_SIZE_OVERLINE, RADIUS,
} from '@/constants/_core/ui.constants';
import { IChoiceChipOption } from '@/types/_core/app.type';
import { ICategoryInput, ICategoryTypeEntity } from '@/types/_core/category.type';
import { getCategoryEntityLabel } from '@/utils/_core/cms.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { formatTechnicalCode } from '@/utils/_core/utils';

const classes = {
  // the path being built, on a recessed tile: it is read, never typed into
  pathBox: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${CATEGORY_FORM_PATH_BOX_GAP}px`,
      padding: `${CATEGORY_FORM_PATH_BOX_PADDING_Y}px ${CATEGORY_FORM_PATH_BOX_PADDING_X}px`,
      backgroundColor: tokens.surfaceSecondary,
      border: `1px solid ${tokens.borderLight}`,
      borderRadius: `${RADIUS}px`,
    };
  },
  pathTitle: (theme: Theme) => ({
    fontSize: FONT_SIZE_OVERLINE,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
    color: getDesignTokens(theme).textMuted,
  }),
  pathLevel: (theme: Theme) => ({ color: getDesignTokens(theme).textSecondary }),
  // whether the category is on the site closes the card, under a hairline
  active: (theme: Theme) => ({
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  activeDescription: (theme: Theme) => ({ color: getDesignTokens(theme).textSecondary }),
};

type Props = {
  /** the entity is fixed by the caller, ex: a category created from within an article form */
  lockedEntity?: ICategoryTypeEntity;
  /** the categories this one can be filed under, as a tree */
  parentOptions: IChoiceChipOption[];
  isParentOptionsLoading: boolean;
  path: string;
  level: number;
};

/**
 * Where the category is filed: the kind of content it classifies, the category it hangs under
 * (offered as a tree once the kind is known), the path both make, the technical code the apps
 * look it up by, and whether it is shown on the site.
 */
const CategoryFormFilingSection = ({
  lockedEntity, parentOptions, isParentOptionsLoading, path, level,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const {
    control, setValue, watch,
  } = useFormContext<ICategoryInput>();
  const entity = useWatch({ control, name: 'entity' });

  /*
   * the parents offered belong to one entity: switching it empties the parent, whose id would
   * otherwise point into the other tree. Only a change made by the editor clears it — resetting the
   * form to a saved category sets both at once and must keep its parent
   */
  useEffect(() => {
    const subscription = watch((_, { name, type }) => {
      if (name !== 'entity' || type !== 'change') return;
      setValue('parentCategory', undefined);
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // normalize whatever the admin types into an upper snake case technical code (ex: "Legal" => "LEGAL")
  const handleCodeChange = (value: string | number) => {
    setValue('code', formatTechnicalCode(String(value)), { shouldValidate: true });
  };

  const isParentFieldVisible = !!entity && (isParentOptionsLoading || !!parentOptions.length);

  return (
    <CardFormBlock title={t('cms:category.filing')}>
      <ChoiceChipsField
        disabled={!!lockedEntity}
        helperText={t('cms:category.categoryForHelper')}
        label={t('cms:category.categoryFor')}
        name="entity"
        options={categoryEntityOptions}
      />

      {/* absent means this category stays a root category (max depth: 3 levels) */}
      {isParentFieldVisible && (
        <ChoiceChipsField
          isStacked
          helperText={t('cms:category.parentCategoryHelper')}
          label={t('cms:category.parentCategory')}
          loading={isParentOptionsLoading}
          name="parentCategory"
          options={parentOptions}
        />
      )}

      <div css={classes.pathBox}>
        <Typography component="div" css={classes.pathTitle}>
          {t('cms:category.resultingPath')}
        </Typography>
        <Typography variant="body1">{path}</Typography>
        <Typography css={classes.pathLevel} variant="body2">
          {entity
            ? t('cms:category.levelWithEntity', {
              level,
              entity: getCategoryEntityLabel(entity as CategoryEntityEnum),
            })
            : t('cms:category.pickEntityFirst')}
        </Typography>
      </div>

      {/* technical code — not translated, independent of the translated name/slug */}
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

      <div css={classes.active}>
        <CheckboxField label={t('common:active')} name="active" />
        <Typography css={classes.activeDescription} variant="body2">
          {t('cms:category.activeCategoryVisible')}
        </Typography>
      </div>
    </CardFormBlock>
  );
};

export default CategoryFormFilingSection;
