import {
  Button, IconButton, Tooltip, Typography,
} from '@mui/material';
import { CategoryEntityEnum } from '@shared/types';
import { t } from 'i18next';
import { useEffect, useMemo, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';

import CardFormBlock from '@/components/form/CardFormBlock';
import ChoiceChipsField from '@/components/form/fields/ChoiceChipsField';
import { CATEGORY_PATH_SEPARATOR } from '@/constants/_core/cms.constants';
import { SETTINGS_ROW_GAP } from '@/constants/_core/ui.constants';
import CategoryFormDialog from '@/containers/_core/categories/categoryForm/CategoryFormDialog';
import { useToggle } from '@/hooks/_core/useToggle';
import { createCategory } from '@/redux/actions/_core/category.action';
import { getCategoryCategoriesSelector } from '@/redux/reducers/_core/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { ICategory, ICategoryInput } from '@/types/_core/category.type';
import { IPageFormInput } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getChildCategories } from '@/utils/_core/cms.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  // the chosen path and the way back to "no category", closing the card under a hairline
  footer: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${SETTINGS_ROW_GAP}px`,
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${getDesignTokens(theme).borderLight}`,
  }),
  path: { minWidth: 0 },
  clear: { flexShrink: 0 },
};

const toOptions = (categories: ICategory[], locale: Locale): ISelectOption[] => (
  categories.map((category) => ({
    value: category.id,
    label: getTranslatedField(category.translated, locale, 'name'),
  }))
);

const getParentId = (category?: ICategory): string | undefined => (
  category?.parentCategory?.objectId ?? category?.parentCategory?.id
);

/**
 * Where the page sits in the category tree. Each level is a row of pills rather than a dropdown:
 * a level rarely holds more than a handful of categories, and seeing them all at once is faster
 * than opening a list to read it. A level only appears once the one above it has children.
 *
 * The tree is read from the store, where the page routes load it whole on entering the form — so
 * every level is derived in memory, and a story can seed it like any other slice.
 */
const PageFormCategorySection = () => {
  const locale = useSelector(getSettingsLocaleSelector);
  const categories = useSelector(getCategoryCategoriesSelector);
  const dispatch = useDispatch();
  const {
    open: isOpenCategoryCreation, toggle: toggleCategoryCreation,
  } = useToggle();

  const {
    setValue, watch,
  } = useFormContext<IPageFormInput>();

  // cascade: root category -> subcategory (if any) -> sub-subcategory (if any), max depth 3 levels
  const rootCategory = watch('category');
  const subcategory = watch('subcategory');
  const subcategory2 = watch('subcategory2');

  const rootCategoryOptions = useMemo(
    () => toOptions(getChildCategories(categories), locale),
    [categories, locale]
  );
  const subcategoryOptions = useMemo(
    () => (rootCategory
      ? toOptions(getChildCategories(categories, rootCategory), locale)
      : []),
    [categories, rootCategory, locale]
  );
  const subcategory2Options = useMemo(
    () => (subcategory
      ? toOptions(getChildCategories(categories, subcategory), locale)
      : []),
    [categories, subcategory, locale]
  );

  // a level already picked stays on screen even when its parent has lost its other children
  const isSubcategoryFieldVisible = !!subcategoryOptions.length || !!subcategory;
  const isSubcategory2FieldVisible = !!subcategory2Options.length || !!subcategory2;

  const prevRootCategoryIdRef = useRef<string | undefined>(undefined);
  const prevSubcategoryIdRef = useRef<string | undefined>(undefined);

  /*
   * create a category on the fly from this form, then select it at whichever level it sits. The
   * creation adds it to the store's list, so its row of pills already holds it
   */
  const handleCreateCategory = (values: ICategoryInput) => {
    dispatch(createCategory(values, false, (created: ICategory) => {
      // only preselect a published category — an inactive one isn't a valid choice for the page
      if (!created.active) return;

      const parentId = getParentId(created);

      if (!parentId) {
        /*
         * don't touch prevRootCategoryIdRef here — the root category is actually changing, so the
         * "root category changed" effect below must run and clear any previously selected subcategory
         */
        setValue('category', created.id, { shouldValidate: true });
        return;
      }

      const grandParentId = getParentId(categories.find((category) => category.id === parentId));

      if (!grandParentId) {
        // new subcategory (level 2) — select its parent as the root, then itself
        prevRootCategoryIdRef.current = parentId;
        setValue('category', parentId, { shouldValidate: true });
        setValue('subcategory', created.id, { shouldValidate: true });
        return;
      }

      // new sub-subcategory (level 3) — select the whole chain down to it
      prevRootCategoryIdRef.current = grandParentId;
      prevSubcategoryIdRef.current = parentId;
      setValue('category', grandParentId, { shouldValidate: true });
      setValue('subcategory', parentId, { shouldValidate: true });
      setValue('subcategory2', created.id, { shouldValidate: true });
    }));
    toggleCategoryCreation();
  };

  // the lower levels follow through the "root category changed" effect below
  const handleClear = () => {
    setValue('category', undefined, { shouldValidate: true });
  };

  // user picked a different root category — the previously selected subcategory no longer applies
  useEffect(() => {
    if (prevRootCategoryIdRef.current !== undefined && prevRootCategoryIdRef.current !== rootCategory) {
      setValue('subcategory', undefined);
    }
    prevRootCategoryIdRef.current = rootCategory;
  }, [rootCategory, setValue]);

  // user picked a different subcategory — the previously selected sub-subcategory no longer applies
  useEffect(() => {
    if (prevSubcategoryIdRef.current !== undefined && prevSubcategoryIdRef.current !== subcategory) {
      setValue('subcategory2', undefined);
    }
    prevSubcategoryIdRef.current = subcategory;
  }, [subcategory, setValue]);

  /*
   * persist the deepest selected level (sub-subcategory > subcategory > root category) into the
   * many-to-many `categories` field actually saved on the page
   */
  useEffect(() => {
    const selectedId = subcategory2 || subcategory || rootCategory;

    if (!selectedId) {
      setValue('categories', [], { shouldValidate: true });
      return;
    }

    const selectedOptions = subcategory2
      ? subcategory2Options
      : subcategory
        ? subcategoryOptions
        : rootCategoryOptions;
    const selectedLabel = selectedOptions.find((option) => option.value === selectedId)?.label ?? '';

    setValue('categories', [{ label: selectedLabel, value: selectedId }], { shouldValidate: true });
  }, [
    rootCategory, subcategory, subcategory2,
    rootCategoryOptions, subcategoryOptions, subcategory2Options, setValue,
  ]);

  // the chosen levels read as one path, so the editor sees where the page lands without re-reading each row
  const categoryPath = [
    rootCategoryOptions.find((option) => option.value === rootCategory)?.label,
    subcategoryOptions.find((option) => option.value === subcategory)?.label,
    subcategory2Options.find((option) => option.value === subcategory2)?.label,
  ].filter(Boolean).join(CATEGORY_PATH_SEPARATOR);

  return (
    <CardFormBlock
      title={t('cms:category.category')}
      rightHeader={(
        <Tooltip title={t('cms:category.createCategory')}>
          <IconButton color="primary" onClick={toggleCategoryCreation}>
            <FiPlus />
          </IconButton>
        </Tooltip>
      )}
    >
      <ChoiceChipsField
        label={t('cms:category.category')}
        name="category"
        options={rootCategoryOptions}
      />

      {isSubcategoryFieldVisible && (
        <ChoiceChipsField
          helperText={t('cms:category.subcategoryHelper')}
          label={t('cms:category.subcategory')}
          name="subcategory"
          options={subcategoryOptions}
        />
      )}

      {isSubcategory2FieldVisible && (
        <ChoiceChipsField
          helperText={t('cms:category.subcategory2Helper')}
          label={t('cms:category.subcategory2')}
          name="subcategory2"
          options={subcategory2Options}
        />
      )}

      <div css={classes.footer}>
        <Typography color="text.secondary" css={classes.path} variant="body2">
          {categoryPath || t('cms:category.noCategory')}
        </Typography>
        {rootCategory && (
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
        defaultEntity={CategoryEntityEnum.PAGE}
        lockedEntity={CategoryEntityEnum.PAGE}
        onClose={toggleCategoryCreation}
        onSubmit={handleCreateCategory}
        open={isOpenCategoryCreation}
      />
    </CardFormBlock>
  );
};

export default PageFormCategorySection;
