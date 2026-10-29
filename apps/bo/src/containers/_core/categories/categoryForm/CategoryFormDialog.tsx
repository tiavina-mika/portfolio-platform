import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import type { Theme } from '@mui/material/styles';
import type { TFunction } from 'i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import Form from '@/components/form/Form';
import FullScreenDialog from '@/components/FullScreenDialog';
import { CATEGORY_PATH_SEPARATOR } from '@/constants/_core/cms.constants';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';
import {
  CATEGORY_FORM_COLUMN_GAP, CATEGORY_FORM_GAP, CATEGORY_FORM_PADDING, CATEGORY_FORM_PHONE_PADDING,
  CATEGORY_FORM_SIDE_COLUMN_WIDTH, CATEGORY_FORM_TABLET_PADDING, FORM_WORKBENCH_BREAKPOINT,
  FORM_WORKBENCH_PHONE_BREAKPOINT,
} from '@/constants/_core/ui.constants';
import CmsSeoPreview from '@/containers/_core/cms/CmsSeoPreview';
import CmsFormSeoSection from '@/containers/_core/cms/form/CmsFormSeoSection';
import { useTranslatedValuesByTab } from '@/hooks/_core/useTranslatedValuesByTab';
import { searchCategoriesForAutocomplete } from '@/redux/actions/_core/category.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IChoiceChipOption } from '@/types/_core/app.type';
import { ICategory, ICategoryInput, ICategoryTypeEntity } from '@/types/_core/category.type';
import { getCategoryFormInitialValues, getParentCategoryOptions } from '@/utils/_core/cms.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { categorySchema } from '@/validations/_core/category.validations';

import CategoryFormActions from './CategoryFormActions';
import CategoryFormContentSection from './CategoryFormContentSection';
import CategoryFormFilingSection from './CategoryFormFilingSection';
import CategoryFormTranslationTabs from './CategoryFormTranslationTabs';

const CATEGORY_FORM_ID = 'category-form-id';

const classes = {
  // the form is laid on the recessed surface, so its cards stand out from it
  body: (theme: Theme) => ({
    minHeight: '100%',
    padding: CATEGORY_FORM_PADDING,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { padding: CATEGORY_FORM_TABLET_PADDING },
    [theme.breakpoints.down(FORM_WORKBENCH_PHONE_BREAKPOINT)]: { padding: CATEGORY_FORM_PHONE_PADDING },
  }),
  /*
   * where the category is filed and how it shows up away from the back-office stand in a fixed side
   * column, stacked under the rest below the breakpoint
   */
  grid: (theme: Theme) => ({
    display: 'grid',
    gridTemplateColumns: `minmax(0, 1fr) ${CATEGORY_FORM_SIDE_COLUMN_WIDTH}px`,
    gap: CATEGORY_FORM_GAP,
    alignItems: 'start',
    [theme.breakpoints.down(FORM_WORKBENCH_BREAKPOINT)]: { gridTemplateColumns: 'minmax(0, 1fr)' },
  }),
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: CATEGORY_FORM_COLUMN_GAP,
    minWidth: 0,
  },
  required: (theme: Theme) => ({ color: theme.palette.error.main }),
};

const getTitle = (t: TFunction, category?: ICategory | null): string => {
  if (!category) return t('cms:category.createCategory');
  if (category.parentCategory) return t('cms:category.editSubcategory');
  return t('cms:category.editCategory');
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ICategoryInput) => void;
  /** the category being edited, left out to create one */
  category?: ICategory | null;
  // when set, "category for" is preselected to this entity and locked (creation from within an article/page form)
  lockedEntity?: ICategoryTypeEntity;
  defaultEntity?: ICategoryTypeEntity; // when set, "category for" is preselected to this entity
};

/**
 * The category form, over the whole screen: its name, its SEO and its picture in the wide column,
 * where it is filed and the preview of its search result and social card in the side one. The
 * language every translated field is filled in is picked in the header, between the title and the
 * actions — in a band under the header on a phone. Once the screen is too narrow for the header to
 * hold the actions, they move to a bar pinned at the bottom, next to the path being built.
 *
 * It stays mounted while closed, so the form is reset each time it opens: to the category being
 * edited, or to an empty one — never to what was typed and cancelled the time before.
 */
const CategoryFormDialog = ({
  open, onClose, onSubmit, category, lockedEntity, defaultEntity,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const locale = useSelector(getSettingsLocaleSelector);
  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  const form = useForm<ICategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { active: true, entity: lockedEntity ?? defaultEntity },
  });

  const {
    control, reset, watch,
  } = form;

  const entity = watch('entity') as ICategoryTypeEntity | undefined;
  const parentCategoryId = watch('parentCategory');
  const name = watch(`${tab}:name`) as string | undefined;

  const [parentCategories, setParentCategories] = useState<ICategory[]>([]);
  const [isParentCategoriesLoading, setIsParentCategoriesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    // guards against a stale response landing after a newer `category` has already been selected
    let isCancelled = false;

    const init = async () => {
      if (!category) {
        reset({ active: true, entity: lockedEntity ?? defaultEntity });
        return;
      }

      const editionInitialValues = await getCategoryFormInitialValues(category);

      if (isCancelled) return;
      reset(editionInitialValues);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [open, category, reset, locale, lockedEntity, defaultEntity]);

  // the categories this one can hang under (levels 1 and 2 only — a category cannot be its own parent)
  useEffect(() => {
    if (!open || !entity) {
      setParentCategories([]);
      setIsParentCategoriesLoading(false);
      return;
    }
    let isCancelled = false;

    const loadParentCategories = async () => {
      setIsParentCategoriesLoading(true);
      /*
       * a list that cannot be read leaves the category a root one rather than blocking the form —
       * the parent is optional, and the save itself will surface a server that is down
       */
      try {
        const categories = await searchCategoriesForAutocomplete('', entity, {
          eligibleAsParent: true,
          excludeId: category?.id,
        });

        if (!isCancelled) setParentCategories(categories);
      }
      catch {
        if (!isCancelled) setParentCategories([]);
      }
      finally {
        if (!isCancelled) setIsParentCategoriesLoading(false);
      }
    };

    loadParentCategories();

    return () => {
      isCancelled = true;
    };
  }, [open, entity, category?.id]);

  const parentOptions: IChoiceChipOption[] = useMemo(
    () => getParentCategoryOptions(parentCategories, locale),
    [parentCategories, locale]
  );

  const parentOption = parentOptions.find((option) => option.value === parentCategoryId);
  const path = [parentOption?.label, name || t('cms:category.newCategory')]
    .filter(Boolean)
    .join(CATEGORY_PATH_SEPARATOR);
  // a root is level 1, a child of a root level 2, a child of a subcategory level 3
  const level = parentOption
    ? (parentOption.depth ?? 0) + 2
    : 1;

  return (
    <FullScreenDialog
      disableGutters
      open={open}
      pretitle={t('cms:category.category')}
      title={getTitle(t, category)}
      toggle={onClose}
      actions={(
        <>
          <CategoryFormTranslationTabs
            control={control}
            onTabChange={onTabChange}
            placement="header"
            tab={tab}
          />
          <CategoryFormActions
            formId={CATEGORY_FORM_ID}
            onCancel={onClose}
            path={path}
            placement="header"
          />
        </>
      )}
      footer={(
        <CategoryFormActions
          formId={CATEGORY_FORM_ID}
          onCancel={onClose}
          path={path}
          placement="footer"
        />
      )}
      subheader={(
        <CategoryFormTranslationTabs
          control={control}
          onTabChange={onTabChange}
          placement="band"
          tab={tab}
        />
      )}
    >
      <div css={classes.body}>
        <Form form={form} formId={CATEGORY_FORM_ID} onSubmit={onSubmit}>
          <div css={classes.grid}>
            <div css={classes.column}>
              <CategoryFormContentSection tab={tab} />
              {/* keyed by locale: the section only ever holds the fields of the language picked */}
              <CmsFormSeoSection
                basePath="/"
                key={tab}
                locale={tab}
                slugHelperText={t('cms:category.slugHelper')}
                slugSourceField="name"
                theEntity={t('cms:category.theCategory')}
              />
              <CardFormBlock
                title={(
                  <>
                    {t('common:image')}
                    {' '}
                    <span css={classes.required}>*</span>
                  </>
                )}
              >
                <DropzoneField
                  required
                  accept={ACCEPTED_IMAGE_TYPES}
                  helperText={t('cms:category.imageHelper')}
                  inputLabel={t('common:addImage')}
                  maxSize={MAX_IMAGE_SIZE_BYTES}
                  name="image"
                  shouldReset={!!category} // can reset input in edition
                />
              </CardFormBlock>
            </div>
            <div css={classes.column}>
              <CategoryFormFilingSection
                isParentOptionsLoading={isParentCategoriesLoading}
                level={level}
                lockedEntity={lockedEntity}
                parentOptions={parentOptions}
                path={path}
              />
              <CardFormBlock title={t('cms:seoPreview.title')}>
                <CmsSeoPreview
                  basePath="/"
                  locale={tab}
                  shareCardLayout="centered"
                  tab={tab}
                  titleFieldName={tab + ':name'}
                  titlePlaceholder={t('cms:category.newCategory')}
                />
              </CardFormBlock>
            </div>
          </div>
        </Form>
      </div>
    </FullScreenDialog>
  );
};

export default CategoryFormDialog;
