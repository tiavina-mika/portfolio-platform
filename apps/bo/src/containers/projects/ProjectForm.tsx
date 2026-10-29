import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import CheckboxField from '@/components/form/fields/CheckboxField';
import DateRangePickerField from '@/components/form/fields/DateRangePickerField';
import FieldsArray from '@/components/form/fields/FieldsArray';
import MetaTextField from '@/components/form/fields/MetaTextField';
import SelectField from '@/components/form/fields/SelectField';
import TextEditorField from '@/components/form/fields/TextEditorField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { TRANSLATED_CMS_FIELDS } from '@/constants/cms.constants';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { useUploadEditorImage } from '@/hooks/useUploadEditorImage';
import { loadProjectEditorTempFilesSlice } from '@/redux/reducers/project.reducer';
import { IProject, IProjectInput } from '@/types/project.type';
import { Locale } from '@/types/setting.type';
import { DEFAULT_LOCALE } from '@/utils/constants';
import {
  getProjectEditionInitialValues, projectPlatforms, sortedProjectTypesOptions, sortedTechnologiesOptions,
} from '@/utils/project.utils';
import { getTranslatedFormTabErrors } from '@/utils/utils';
import { projectSchema } from '@/validations/project.validation';

import TranslatedSlugField from '../cms/TranslatedSlugField';

const initialValues = { active: true };

type Props = {
  onSubmit: (values: IProjectInput) => void;
  project?: IProject | null;
  loading?: boolean;
};


const ProjectForm = ({
  onSubmit, project, loading,
}: Props) => {
  // get translated fields depending on the selected language (tabs)
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  // upload image to cloud (API) when uploading an image in the editor
  const {
    uploadEditorImage,
  } = useUploadEditorImage({
    folder: 'projects/editor',
    action: loadProjectEditorTempFilesSlice,
  });

  const form = useForm<IProjectInput>({
    defaultValues: initialValues,
    resolver: zodResolver(projectSchema),
  });

  const {
    handleSubmit, reset, setValue,
  } = form;

  useEffect(() => {
    if (!project) return;
    const init = async () => {
      const editionInitialValues = await getProjectEditionInitialValues(project);

      reset(editionInitialValues);
    };

    init();
  }, [project, reset]);

  // change translated slug field value when title is changed
  const handleNameChange = debounce((value: string | number) => {
    setValue(tab + ':slug', value, { shouldValidate: true });
  }, 500);

  const onFormSubmit: SubmitHandler<IProjectInput> = async (values) => {
    await onSubmit(values);
    reset(initialValues);
  };

  return (
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
                label={t('common:name')}
                name={locale + ':name'}
                required={locale === DEFAULT_LOCALE}
                type="text"
                variant="outlined"
                onFieldChange={handleNameChange}
              />
              <TextField
                fixedLabel
                fullWidth
                label={t('cms:title')}
                name={locale + ':title'}
                required={locale === DEFAULT_LOCALE}
                type="text"
                variant="outlined"
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
              <TextEditorField
                fullWidth
                id={locale + index + 'societyDescription'}
                label={t('common:project.societyDescription')}
                name={locale + ':societyDescription'}
                toolbar={['bold', 'italic', 'underline']}
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
        description={t('cms:activeProjectVisible')}
        rightHeader={<CheckboxField isSwitch name="active" />}
        title={t('common:active')}
      />

      <CardFormBlock title="Types">
        <SelectField
          fullWidth
          isMulti
          required
          label={t('project.projectTypes')}
          name="types"
          options={sortedProjectTypesOptions}
          variant="outlined"
        />
        <SelectField
          fullWidth
          isMulti
          label={t('platforms')}
          name="platforms"
          options={projectPlatforms.map((platform: string) => ({ value: platform, label: platform }))}
          variant="outlined"
        />
        <SelectField
          fullWidth
          isMulti
          required
          label={t('project.technologies')}
          name="technologies"
          options={sortedTechnologiesOptions}
          variant="outlined"
        />
      </CardFormBlock>
      <CardFormBlock title={t('project.links')}>
        <TextField
          fixedLabel
          fullWidth
          label={t('project.society')}
          name="society"
          type="text"
          variant="outlined"
        />
        <TextField
          fixedLabel
          fullWidth
          label={t('project.website')}
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
          addButtonLabel={t('project.addLinks')}
          label={t('project.links')}
          name="links"
          subFieldsDirection="column"
          subNames={[{ name: 'url', type: 'url', placeholder: t('project.link'), defaultValue: 'https://' }]}
        />
        <FieldsArray
          addButtonLabel={t('project.addRepository')}
          label={t('project.repositories')}
          name="repositories"
          subFieldsDirection="column"
          subNames={[{ name: 'url', type: 'url', placeholder: t('project.link'), defaultValue: 'https://github.com/' }]}
        />
        <FieldsArray
          addButtonLabel={t('project.addNpmLinks')}
          label={t('project.npmLinks')}
          name="npm"
          subFieldsDirection="column"
          subNames={[{
            name: 'url',
            type: 'url',
            placeholder: t('project.link'),
            defaultValue: 'https://www.npmjs.com/package/',
          }]}
        />
        <FieldsArray
          addButtonLabel={t('project.addCodesandboxLinks')}
          label={t('project.codesandboxLinks')}
          name="codesandbox"
          subFieldsDirection="column"
          subNames={[{ name: 'url', type: 'url', placeholder: t('project.link'), defaultValue: 'https://codesandbox.io/' }]}
        />
        <div>
          <DateRangePickerField label={t('date')} name="dateRange" variant="outlined" />
        </div>
      </CardFormBlock>
      {/* images card */}
      <CardFormBlock title={t('images')}>
        <Stack spacing={2}>
          {/* non translated fields */}
          <DropzoneField
            required
            inputLabel={t('common:addImage')}
            label={t('common:image')}
            name="image"
            shouldReset={!!project} // can reset input in edition
          />
          <DropzoneField
            inputLabel={t('common:project.societyLogo')}
            label="Logo"
            name="logo"
            shouldReset={!!project} // can reset input in edition
          />
          <DropzoneField
            helperText={t('common:infoMessages.projectPreviewImage')}
            inputLabel={`${t('common:add')} ${t('common:previewImage')}`}
            label={t('common:previewImage')}
            name="previewImage"
            shouldReset={!!project} // can reset input in edition
          />
          {/* multiple image upload */}
          <DropzoneField
            multiple
            inputLabel={t('images')}
            label={t('common:images')}
            name="images"
            shouldReset={!!project} // can reset input in edition
          />
        </Stack>
      </CardFormBlock>
    </Form>
  );
};

export default ProjectForm;
