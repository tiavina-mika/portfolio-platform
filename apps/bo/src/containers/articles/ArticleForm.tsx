import { zodResolver } from '@hookform/resolvers/zod';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import AutocompleteField from '@/components/form/fields/AutocompleteField';
import CheckboxField from '@/components/form/fields/CheckboxField';
import MetaTextField from '@/components/form/fields/MetaTextField';
import TextEditorField from '@/components/form/fields/TextEditorField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import { useToggle } from '@/hooks/useToggle';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { useUploadEditorImage } from '@/hooks/useUploadEditorImage';
import { createCategory } from '@/redux/actions/category.action';
import { loadArticleEditorTempFilesSlice } from '@/redux/reducers/article.reducer';
import { getCategoriesOptionsSelector } from '@/redux/reducers/category.reducer';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { IArticle, IArticleInput } from '@/types/article.type';
import { ICategoryInput } from '@/types/category.type';
import { Locale } from '@/types/setting.type';
import { getArticleEditionInitialValues } from '@/utils/cms.utils';
import { DEFAULT_LOCALE } from '@/utils/constants';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { articleSchema } from '@/validations/article.validations';

import CategoryForm from '../categories/CategoryForm';
import TranslatedSlugField from '../cms/TranslatedSlugField';


const CATEGORY_FORM_ID = 'category-form-id';

const initialValues = {
  active: true,
  categories: [],
};

type Props = {
  onSubmit: (values: IArticleInput) => void;
  article?: IArticle | null;
  loading?: boolean;
};

const ArticleForm = ({
  onSubmit, article, loading,
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);
  const categories = useSelector(getCategoriesOptionsSelector);
  const dispatch = useDispatch();
  const {
    open: isOpenCategoryCreation, toggle: toggleCategoryCreation,
  } = useToggle();

  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  // upload image to cloud (API) when uploading an image in the editor
  const {
    uploadEditorImage,
  } = useUploadEditorImage({
    folder: 'articles/editor',
    action: loadArticleEditorTempFilesSlice,
  });

  const form = useForm<IArticleInput>({
    defaultValues: initialValues,
    resolver: zodResolver(articleSchema),
  });

  const {
    handleSubmit, reset, setValue,
  } = form;

  useEffect(() => {
    if (!article) return;
    const init = async () => {
      const editionInitialValues = await getArticleEditionInitialValues(article, locale);

      reset(editionInitialValues);
    };

    init();
  }, [article, reset, locale]);

  // change translated slug field value when title is changed
  const handleTitleChange = (value: string | number) => {
    setValue(tab + ':slug', value, { shouldValidate: true });
  };
  const handleCreateCategory = (values: ICategoryInput) => {
    dispatch(createCategory(values, true));
    toggleCategoryCreation();
  };

  const onFormSubmit: SubmitHandler<IArticleInput> = (values) => {
    onSubmit(values);
    reset(initialValues);
  };

  return (
    <>
      {/* main form */}
      <Form
        fixedButtons
        form={form}
        isDisabled={false}
        loading={loading}
        onSubmit={handleSubmit(onFormSubmit)}
      >
        {/* translated fields */}
        <CardFormBlock description={t('cms:translatedFields')} title={t('details')}>
          {/* translated tabs */}
          <TranslationTabs
            errors={getTranslatedFormTabErrors(form?.formState.errors, TRANSLATED_CMS_FIELDS)}
            tab={tab}
            onTabChange={onTabChange}
          />
          {/* all translated fields */}
          {locales.map((locale: string, index: number) => (
            <div
              key={index}
              css={{
                display: locale === tab
                  ? 'block'
                  : 'none', marginTop: 12,
              }}
            >
              <Stack spacing={2}>
                <TextField
                  fixedLabel
                  fullWidth
                  label={t('cms:title')}
                  name={locale + ':title'}
                  required={locale === DEFAULT_LOCALE}
                  type="text"
                  variant="outlined"
                  onFieldChange={handleTitleChange}
                />
                {/* slug field */}
                <TranslatedSlugField locale={locale} tab={tab} />
                <TextField
                  fixedLabel
                  fullWidth
                  multiline
                  helperText={t('cms:descriptionHelper')}
                  label={t('common:description')}
                  name={locale + ':description'}
                  required={locale === DEFAULT_LOCALE}
                  rows={3}
                  variant="outlined"
                />

                <TextEditorField
                  id={locale + index + 'content'}
                  label={t('cms:content')}
                  name={locale + ':content'}
                  required={locale === DEFAULT_LOCALE}
                  uploadFileOptions={{ uploadFile: uploadEditorImage(locale as Locale) }}
                />
                <TextField
                  fixedLabel
                  fullWidth
                  helperText={t('common:infoMessages.tagsHelper')}
                  label="Tags"
                  name={locale + ':tags'}
                  placeholder={t('common:infoMessages.separateTagsWithComma')}
                  type="text"
                  variant="outlined"
                />
                <MetaTextField
                  fixedLabel
                  fullWidth
                  name={locale + ':metaTitle'}
                  type="metaTitle"
                />
                <MetaTextField
                  fixedLabel
                  fullWidth
                  name={locale + ':metaDescription'}
                  type="metaDescription"
                />
              </Stack>
            </div>
          ))}
        </CardFormBlock>

        {/* active card */}
        <CardFormBlock
          description={t('cms:activeArticleVisible')}
          rightHeader={<CheckboxField isSwitch name="active" />}
          title={t('common:active')}
        />
        <CardFormBlock
          title={t('cms:category.categories')}
          rightHeader={(
            <Tooltip title={t('cms:category.createCategory')}>
              <IconButton
                color="primary"
                onClick={toggleCategoryCreation}
              >
                <FiPlus />
              </IconButton>
            </Tooltip>
          )}
        >
          <AutocompleteField
            fullWidth
            multiple
            name="categories"
            options={categories}
          />
        </CardFormBlock>

        {/* images card */}
        <CardFormBlock title={t('images')}>
          <Stack spacing={2}>
            <DropzoneField
              required
              inputLabel={t('common:addImage')}
              label={t('common:image')}
              multiple={false}
              name="image"
              shouldReset={!!article} // can reset input in edition
            />
            <DropzoneField
              helperText={t('common:infoMessages.articlePreviewImage')}
              inputLabel={`${t('common:add')} ${t('common:previewImage')}`}
              label={t('common:previewImage')}
              multiple={false}
              name="previewImage"
              shouldReset={!!article} // can reset input in edition
            />
            {/* multiple image upload */}
            <DropzoneField
              multiple
              inputLabel={t('images')}
              label={t('common:images')}
              name="images"
              shouldReset={!!article} // can reset input in edition
            />
          </Stack>
        </CardFormBlock>
      </Form>
      {/* category creation dialog */}
      <Dialog
        fullWidth
        formId={CATEGORY_FORM_ID}
        maxWidth="md"
        open={isOpenCategoryCreation}
        title={t('cms:category.createCategory')}
        toggle={toggleCategoryCreation}
      >
        <CategoryForm
          formId={CATEGORY_FORM_ID}
          onSubmit={handleCreateCategory}
        />
      </Dialog>
    </>
  );
};

export default ArticleForm;
