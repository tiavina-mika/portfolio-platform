import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import DropzoneField from '@/components/form/dropzone/DropzoneField';
import JsonUploadButton from '@/components/JsonUploadButton';
import {
  creationUploadedFieldsToIgnore, PAGE_FORM_SECTIONS,
} from '@/constants/_core/cms.constants';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/constants/_core/file.constants';
import CmsSeoPreview from '@/containers/_core/cms/CmsSeoPreview';
import CmsFormRenderedPreview from '@/containers/_core/cms/form/CmsFormRenderedPreview';
import CmsFormSeoSection from '@/containers/_core/cms/form/CmsFormSeoSection';
import CmsFormWorkbench from '@/containers/_core/cms/form/CmsFormWorkbench';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { CmsFormSectionEnum } from '@/types/_core/cms.type';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { IPage, IPageFormInput, IPageInput } from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getFinalPageInitialValues } from '@/utils/_core/cms.utils';
import { finalPageSchema, pageDbTemplateSchema } from '@/validations/_core/page.validations';

import PageFormCategorySection from './PageFormCategorySection';
import PageFormContentSection from './PageFormContentSection';
import PageFormImagesSection from './PageFormImagesSection';
import PageFormSettingsSection from './PageFormSettingsSection';
import PageFormSummary from './PageFormSummary';

const PAGE_FORM_ID = 'page-form-id';

type Props = {
  onSubmit: (values: IPageInput) => void;
  page?: IPage | null;
  loading?: boolean;
  /** past versions of the content, shown in the preview column's second tab */
  versions?: IContentVersion[];
  canRestoreVersion?: boolean;
  onRestoreVersion?: (versionId: string) => void;
};

/**
 * The page form, laid out as the CMS workbench: the summary rail naming its five sections, the
 * section being filled, and what it produces drawn next to it. Only the French name and content
 * are mandatory, and neither gates anything that follows.
 */
const PageForm = ({
  onSubmit, page, loading, versions, canRestoreVersion, onRestoreVersion,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const locale = useSelector(getSettingsLocaleSelector);

  const [uploadedJsonValues, setUploadedJsonValues] = useState<Partial<IPage>>({});
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<IPageFormInput, any, IPageInput>({
    /*
     * finalPageSchema's repeated `.extend()` chain degrades some fields' inferred TS types
     * (see IPageFormInput's comment in page.type.ts) even though the actual Zod runtime
     * validation is correct — cast to the hand-fixed generics rather than the schema's own
     * (broken) inference
     */
    resolver: zodResolver(finalPageSchema) as unknown as Resolver<IPageFormInput, any, IPageInput>,
  });

  const {
    reset,
  } = form;

  // initialize/merge form values from the page being edited and/or an uploaded JSON import — shared across all sections
  useEffect(() => {
    // guards against a stale response landing after a newer `page` has already been selected
    let isCancelled = false;

    const init = async () => {
      setIsInitializing(true);
      const editionInitialValues = await getFinalPageInitialValues(page, locale);

      if (isCancelled) return;
      reset({ ...editionInitialValues, ...uploadedJsonValues } as IPageFormInput);
      setIsInitializing(false);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [page, locale, reset, uploadedJsonValues]);

  const handleTransformUploadedJsonData = async (data: Partial<IPage>) => {
    const values = await getFinalPageInitialValues<IPage>(data as any, locale);

    return values || {};
  };

  const handleJsonUploadSuccess = (data: Partial<IPage>) => {
    setUploadedJsonValues(data);
  };

  const renderSection = (section: CmsFormSectionEnum, tab: Locale) => {
    switch (section) {
      case CmsFormSectionEnum.SEO:
        return (
          <CmsFormSeoSection
            basePath="/"
            locale={tab}
            slugSourceField="name"
            theEntity={t('cms:thePage')}
          >
            {/* the picture social networks put on the card when the page's link is shared */}
            <DropzoneField
              accept={ACCEPTED_IMAGE_TYPES}
              helperText={t('common:infoMessages.previewImageHelper')}
              inputLabel={`${t('common:add')} ${t('common:previewImage')}`}
              label={t('common:previewImage')}
              maxSize={MAX_IMAGE_SIZE_BYTES}
              multiple={false}
              name="previewImage"
              shouldReset={!!page} // can reset input in edition
            />
          </CmsFormSeoSection>
        );
      case CmsFormSectionEnum.IMAGES:
        return <PageFormImagesSection page={page} />;
      case CmsFormSectionEnum.CATEGORY:
        return <PageFormCategorySection />;
      case CmsFormSectionEnum.SETTINGS:
        return <PageFormSettingsSection />;
      default:
        /*
         * keyed by locale so switching language remounts the rich text editor: TipTap keeps its
         * document in its own state, and only a remount makes it pick up the other translation
         */
        return <PageFormContentSection key={tab} locale={tab} />;
    }
  };

  const renderPreview = (section: CmsFormSectionEnum, tab: Locale) => {
    if (section === CmsFormSectionEnum.SEO) {
      return (
        <CmsSeoPreview
          basePath="/"
          descriptionFieldName={tab + ':description'}
          locale={tab}
          shareCardLayout="centered"
          tab={tab}
          titleFieldName={tab + ':name'}
          titlePlaceholder={t('cms:pageForm.untitledPage')}
        />
      );
    }

    // the category and the settings describe the record rather than the page, so both show its summary
    if (section === CmsFormSectionEnum.CATEGORY || section === CmsFormSectionEnum.SETTINGS) {
      return <PageFormSummary />;
    }

    // content and images end up on the same public page, so they share one rendering of it
    return (
      <CmsFormRenderedPreview
        bannerFieldName="bannerImage"
        locale={tab}
        titleFields={['title', 'name']}
        untitledLabel={t('cms:pageForm.untitledPage')}
      />
    );
  };

  return (
    <CmsFormWorkbench
      canRestoreVersion={canRestoreVersion}
      config={PAGE_FORM_SECTIONS}
      form={form}
      formId={PAGE_FORM_ID}
      initializing={isInitializing}
      loading={loading}
      loadingLabel={t('cms:pageForm.loadingPage')}
      onRestoreVersion={onRestoreVersion}
      onSubmit={onSubmit}
      renderPreview={renderPreview}
      renderSection={renderSection}
      savedAt={page?.updatedAt}
      versions={versions}
      importAction={!page && (
        <JsonUploadButton
          downloadFilename="page-template.json"
          fieldsToIgnore={[...creationUploadedFieldsToIgnore, 'categories']}
          onSuccess={handleJsonUploadSuccess}
          onTransformDataBeforeValidate={handleTransformUploadedJsonData}
          schema={finalPageSchema}
          templateSchema={pageDbTemplateSchema}
        />
      )}
    />
  );
};

export default PageForm;
