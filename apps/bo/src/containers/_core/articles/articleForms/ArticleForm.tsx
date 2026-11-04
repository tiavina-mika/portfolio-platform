import { zodResolver } from '@hookform/resolvers/zod';
import { DEFAULT_COUNTRY_CODE } from '@shared/constants';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import JsonUploadButton from '@/components/JsonUploadButton';
import {
  ARTICLE_WEBSITE_BASE_PATH, ARTICLE_FORM_SECTIONS, creationUploadedFieldsToIgnore,
} from '@/constants/_core/cms.constants';
import CmsSeoPreview from '@/containers/_core/cms/CmsSeoPreview';
import CmsFormRenderedPreview from '@/containers/_core/cms/form/CmsFormRenderedPreview';
import CmsFormSeoSection from '@/containers/_core/cms/form/CmsFormSeoSection';
import CmsFormWorkbench from '@/containers/_core/cms/form/CmsFormWorkbench';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { IArticle, IArticleInput } from '@/types/_core/article.type';
import { CmsFormSectionEnum } from '@/types/_core/cms.type';
import { IContentVersion } from '@/types/_core/contentVersion.type';
import { Locale } from '@/types/_core/setting.type';
import { getArticleEditionInitialValues, getArticleJsonUploadInitialValues } from '@/utils/_core/cms.utils';
import { articleDbTemplateSchema, articleJsonUploadSchema, articleSchema } from '@/validations/_core/article.validations';

import ArticleFormCategorySection from './ArticleFormCategorySection';
import ArticleFormContentSection from './ArticleFormContentSection';
import ArticleFormImagesSection from './ArticleFormImagesSection';
import ArticleFormSettingsSection from './ArticleFormSettingsSection';
import ArticleFormSummary from './ArticleFormSummary';

const ARTICLE_FORM_ID = 'article-form-id';

const initialValues = {
  active: true,
  country: DEFAULT_COUNTRY_CODE,
  categories: [],
};

type Props = {
  onSubmit: (values: IArticleInput) => void;
  article?: IArticle | null;
  loading?: boolean;
  /** past versions of the content, shown in the preview column's second tab */
  versions?: IContentVersion[];
  canRestoreVersion?: boolean;
  onRestoreVersion?: (versionId: string) => void;
};

/**
 * The article form, laid out as the CMS workbench the page form uses: the summary rail naming its
 * five sections, the section being filled, and what it produces drawn next to it. The French
 * title, description and content, the main picture and at least one category are required.
 */
const ArticleForm = ({
  onSubmit, article, loading, versions, canRestoreVersion, onRestoreVersion,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const locale = useSelector(getSettingsLocaleSelector);

  const [uploadedJsonValues, setUploadedJsonValues] = useState<Partial<IArticleInput>>({});
  const [isInitializing, setIsInitializing] = useState(true);

  const form = useForm<IArticleInput>({
    mode: 'onBlur',
    defaultValues: initialValues,
    resolver: zodResolver(articleSchema),
  });

  const {
    reset,
  } = form;

  // initialize/merge form values from the article being edited and/or an uploaded JSON import
  useEffect(() => {
    // guards against a stale response landing after a newer `article` has already been selected
    let isCancelled = false;

    const init = async () => {
      setIsInitializing(true);
      const editionInitialValues = article
        ? await getArticleEditionInitialValues(article, locale)
        : initialValues;

      if (isCancelled) return;
      reset({ ...editionInitialValues, ...uploadedJsonValues });
      setIsInitializing(false);
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [article, reset, locale, uploadedJsonValues]);

  const handleJsonUploadSuccess = (data: Partial<IArticleInput>) => {
    setUploadedJsonValues(data);
  };

  const renderSection = (section: CmsFormSectionEnum, tab: Locale) => {
    switch (section) {
      case CmsFormSectionEnum.SEO:
        return (
          <CmsFormSeoSection
            basePath={ARTICLE_WEBSITE_BASE_PATH}
            locale={tab}
            slugSourceField="title"
            theEntity={t('cms:theArticle')}
          />
        );
      case CmsFormSectionEnum.IMAGES:
        return <ArticleFormImagesSection isEdition={!!article} />;
      case CmsFormSectionEnum.CATEGORY:
        return <ArticleFormCategorySection />;
      case CmsFormSectionEnum.SETTINGS:
        return <ArticleFormSettingsSection />;
      default:
        /*
         * keyed by locale so switching language remounts the rich text editor: TipTap keeps its
         * document in its own state, and only a remount makes it pick up the other translation
         */
        return <ArticleFormContentSection key={tab} locale={tab} />;
    }
  };

  const renderPreview = (section: CmsFormSectionEnum, tab: Locale) => {
    if (section === CmsFormSectionEnum.SEO) {
      return (
        <CmsSeoPreview
          basePath={ARTICLE_WEBSITE_BASE_PATH}
          descriptionFieldName={tab + ':description'}
          locale={tab}
          shareCardLayout="left"
          tab={tab}
          titleFieldName={tab + ':title'}
          titlePlaceholder={t('cms:articleForm.untitledArticle')}
        />
      );
    }

    // the categories and the settings describe the record rather than the text, so both show its summary
    if (section === CmsFormSectionEnum.CATEGORY || section === CmsFormSectionEnum.SETTINGS) {
      return <ArticleFormSummary />;
    }

    // content and images end up on the same public article, so they share one rendering of it
    return (
      <CmsFormRenderedPreview
        bannerFieldName="image"
        locale={tab}
        titleFields={['title']}
        untitledLabel={t('cms:articleForm.untitledArticle')}
      />
    );
  };

  return (
    <CmsFormWorkbench
      canRestoreVersion={canRestoreVersion}
      config={ARTICLE_FORM_SECTIONS}
      form={form}
      formId={ARTICLE_FORM_ID}
      initializing={isInitializing}
      loading={loading}
      loadingLabel={t('cms:articleForm.loadingArticle')}
      onRestoreVersion={onRestoreVersion}
      onSubmit={onSubmit}
      renderPreview={renderPreview}
      renderSection={renderSection}
      savedAt={article?.updatedAt}
      versions={versions}
      importAction={!article && (
        <JsonUploadButton
          downloadFilename="article-template.json"
          fieldsToIgnore={[...creationUploadedFieldsToIgnore, 'categories']}
          onSuccess={handleJsonUploadSuccess}
          onTransformDataBeforeValidate={getArticleJsonUploadInitialValues}
          schema={articleJsonUploadSchema}
          templateSchema={articleDbTemplateSchema}
        />
      )}
    />
  );
};

export default ArticleForm;
