import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { ARTICLE_DEFAULT_VIEWS_GOAL } from '@/constants/_core/cms.constants';
import CmsFormSummary from '@/containers/_core/cms/form/CmsFormSummary';
import { getCategoriesOptionsSelector } from '@/redux/reducers/_core/category.reducer';
import { ArticleStatusEnum } from '@/types/_core/article.type';
import { getSelectedOptionsLabel, getTranslatedArticleStatusLabel } from '@/utils/_core/cms.utils';

/**
 * What the category and settings sections of the article form add up to, restated as three facts:
 * whether the article is visible, the shelves it is filed under, and the views goal it is measured
 * against — the ordinary one when the editor left it empty.
 */
const ArticleFormSummary = () => {
  const {
    t,
  } = useTranslation(['common', 'cms']);
  const categoryOptions = useSelector(getCategoriesOptionsSelector);
  const {
    control,
  } = useFormContext();

  const [active, categories, viewsGoal] = useWatch({
    control,
    name: ['active', 'categories', 'viewsGoal'],
  });

  const status = active
    ? ArticleStatusEnum.PUBLISHED
    : ArticleStatusEnum.DRAFT;

  return (
    <CmsFormSummary
      rows={[
        {
          label: t('common:status'),
          value: getTranslatedArticleStatusLabel(status),
        },
        {
          label: t('cms:category.categories'),
          value: getSelectedOptionsLabel(categoryOptions, categories as string[] | undefined) ||
            t('cms:category.noCategory'),
        },
        {
          label: t('cms:viewsGoal'),
          value: viewsGoal
            ? Number(viewsGoal).toLocaleString()
            : t('cms:articleForm.defaultViewsGoal', { value: ARTICLE_DEFAULT_VIEWS_GOAL.toLocaleString() }),
        },
      ]}
    />
  );
};

export default ArticleFormSummary;
