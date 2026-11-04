import { Button, Typography } from '@mui/material';
import { CategoryEntityEnum } from '@shared/types';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import CardFormBlock from '@/components/form/CardFormBlock';
import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import { SETTINGS_ROW_GAP } from '@/constants/_core/ui.constants';
import CategoryFormDialog from '@/containers/_core/categories/categoryForm/CategoryFormDialog';
import { useToggle } from '@/hooks/_core/useToggle';
import { createCategory } from '@/redux/actions/_core/category.action';
import { getCategoriesOptionsSelector } from '@/redux/reducers/_core/category.reducer';
import { ICategory, ICategoryInput } from '@/types/_core/category.type';
import { getSelectedOptionsLabel } from '@/utils/_core/cms.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // the chosen categories and the way back to "no category", closing the card under a hairline
  footer: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${SETTINGS_ROW_GAP}px`,
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  selection: { minWidth: 0 },
  clear: { flexShrink: 0 },
};

/**
 * The shelves the article is filed under. Unlike a page, an article can sit on several at once, so
 * the categories are one row of pills that each toggle on their own rather than a cascade of
 * single choices. The options are the active article categories the route loads on entering the
 * form, and a new one can be created without leaving the article.
 */
const ArticleFormCategorySection = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const dispatch = useDispatch();
  const categoryOptions = useSelector(getCategoriesOptionsSelector);
  const {
    open: isOpenCategoryCreation, toggle: toggleCategoryCreation,
  } = useToggle();

  const {
    control, getValues, setValue,
  } = useFormContext();
  const categories = useWatch({ control, name: 'categories' }) as string[] | undefined;

  const handleCreateCategory = (values: ICategoryInput) => {
    // the creation reloads the options, so the new category's pill is already in the row
    dispatch(createCategory(values, true, (created: ICategory) => {
      // only preselect a published category — an inactive one isn't a valid choice for the article
      if (!created.active) return;

      setValue('categories', [...(getValues('categories') ?? []), created.id], { shouldValidate: true });
    }));
    toggleCategoryCreation();
  };

  const handleClear = () => {
    setValue('categories', [], { shouldValidate: true });
  };

  const selectionLabel = getSelectedOptionsLabel(categoryOptions, categories);

  return (
    <CardFormBlock
      title={t('cms:category.categories')}
      rightHeader={(
        <Button
          onClick={toggleCategoryCreation}
          size="small"
          startIcon={<FiPlus />}
          variant="outlined"
        >
          {t('cms:articleForm.createCategory')}
        </Button>
      )}
    >
      <ChoiceChipsField
        multiple
        required
        helperText={t('cms:articleForm.categoriesHelper')}
        label={t('cms:category.categories')}
        name="categories"
        options={categoryOptions}
      />

      <div css={classes.footer}>
        <Typography color="text.secondary" css={classes.selection} variant="body2">
          {selectionLabel || t('cms:category.noCategory')}
        </Typography>
        {!!categories?.length && (
          <Button
            color="inherit"
            css={classes.clear}
            onClick={handleClear}
            size="small"
            variant="text"
          >
            {t('cms:cmsForm.clearCategory')}
          </Button>
        )}
      </div>

      {/* category creation dialog */}
      <CategoryFormDialog
        defaultEntity={CategoryEntityEnum.ARTICLE}
        lockedEntity={CategoryEntityEnum.ARTICLE}
        onClose={toggleCategoryCreation}
        onSubmit={handleCreateCategory}
        open={isOpenCategoryCreation}
      />
    </CardFormBlock>
  );
};

export default ArticleFormCategorySection;
