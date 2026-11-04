import { DEFAULT_COUNTRY_CODE } from '@shared/constants';
import { CategoryEntityEnum } from '@shared/types';

import { StatusDotColor } from '@/components/StatusDot';
import i18n from '@/config/i18n';
import { DEFAULT_LOCALE } from '@/constants/_core/app.constants';
import {
  ARTICLE_DEFAULT_VIEWS_GOAL, AVERAGE_READING_WORDS_PER_MINUTE, CATEGORY_PATH_SEPARATOR,
  categoryEntityOptions,
  imagePositionOptions, pageLinkLocationOptions,
} from '@/constants/_core/cms.constants';
import { Category } from '@/services/_core/category.service';
import { DefaultMUIColorType, IChoiceChipOption, ISelectOption } from '@/types/_core/app.type';
import { ArticleStatusEnum, IArticle, IArticleInput } from '@/types/_core/article.type';
import {
  CategoryStatusEnum, ICategory, ICategoryInput, ICategoryTranslatedFields,
} from '@/types/_core/category.type';
import { IFileCloud } from '@/types/_core/file.type';
import {
  IPage, ISectionBlockObj, ISectionBlocksInput, IPageSection,
  IPageStepOneInput, IPageStepThreeFormInput, IPageStepTwoInput,
  PageSectionInput,
  IPageAttributes,
  IPageFormInput,
  IPageTranslatedFields,
  ISectionBlockProgress,
  PageStatusEnum,
} from '@/types/_core/page.type';
import { Locale } from '@/types/_core/setting.type';
import { getFileFromUrl } from '@/utils/_core/file.utils';
import { getValues } from '@/utils/_core/parse.utils';
import { getTranslatedField } from '@/utils/_core/settings.utils';
import { articleCodec } from '@/validations/_core/article.validations';
import { categoryCodec } from '@/validations/_core/category.validations';
import { eachSectionBlockCodec, pageCodec, pageSectionCodec } from '@/validations/_core/page.validations';


export const getCategoryEntityLabel = (entity: CategoryEntityEnum): string => {
  const entityOption = categoryEntityOptions.find(option => option.value === entity);

  return entityOption
    ? entityOption.label
    : '';
};

export const getCategoryLabelColor = (entity: CategoryEntityEnum): DefaultMUIColorType => {
  if (entity === 'article') return 'success';
  return 'warning';
};

/**
 * Reads a field from either a live Parse.Object (via `.get()`) or a plain JSON object.
 * Some domains are still raw Parse.Object instances, others have been converted to JSON —
 * this helper keeps shared CMS utils usable across both during the migration.
 */
const getField = (obj: Record<string, any>, field: string): any =>
  (typeof obj.get === 'function' ? obj.get(field) : obj[field]);

export const getCMSImagesInitialValues = async <T extends Record<string, any>>(
  parseObj: T
) => {
  const bannerImageField = getField(parseObj, 'bannerImage') as IFileCloud | undefined;
  const previewImageField = getField(parseObj, 'previewImage') as IFileCloud | undefined;
  const imageField = getField(parseObj, 'image') as IFileCloud | undefined;

  const [bannerImage, previewImage, image] = await Promise.all([
    bannerImageField ? getFileFromUrl(bannerImageField.url) : undefined,
    previewImageField ? getFileFromUrl(previewImageField.url) : undefined,
    imageField ? getFileFromUrl(imageField.url) : undefined,
  ]);

  const images = await Promise.all(
    (getField(parseObj, 'images') as IFileCloud[] | undefined)
      ?.map((image: IFileCloud) => getFileFromUrl(image.url)) ?? []
  );

  return {
    bannerImage,
    previewImage,
    image,
    images,
  };
};

const getCategoriesPointersInitialValues = (
  item: Record<string, any>,
  locale: Locale
): ISelectOption[] => {
  const categories = getField(item, 'categories') || [];

  if (categories.length <= 0) return [];

  // nested pointers — only `objectId` is available at this hop, not `id` (see toJSONWithId doc comment)
  const categoryOptions = categories.map((category: ICategory) => ({
    label: getTranslatedField(getField(category, 'translated'), locale, 'name'),
    value: (category as unknown as { objectId: string }).objectId,
  }));

  return categoryOptions || [];
};

export const getArticleEditionInitialValues = async (
  article: IArticle | null | undefined,
  locale: Locale
): Promise<IArticleInput | undefined> => {
  if (!article) return;
  const values = {
    ...getValues(article, ['active', 'viewsGoal']),
    country: article.country ?? DEFAULT_COUNTRY_CODE,
    ...articleCodec.encode(article.translated as Record<string, any>),
    // plain category ids — matches the preloaded Select's value shape (see ArticleForm)
    categories: getCategoriesPointersInitialValues(article, locale).map((option) => option.value),
  };
  const imagesFields = await getCMSImagesInitialValues<IArticle>(article);

  const defaultValues = { ...values, ...imagesFields };

  return defaultValues;
};

/**
 * transforms a JSON-uploaded article (database shape — nested `translated` per locale) into the
 * flattened form shape expected by `articleJsonUploadSchema` (`fr:title`-style keys). Categories
 * and image fields are intentionally left out — see `articleDbTemplateSchema`'s doc comment.
 */
export const getArticleJsonUploadInitialValues = (
  data: Partial<IArticle>
): Partial<IArticleInput> => ({
  ...getValues(data, ['active']),
  ...articleCodec.encode(data.translated as Record<string, any>),
});

export const getSectionBlocksEditionCmsInitialValues = async (
  blocks: ISectionBlockObj[] = []
): Promise<ISectionBlocksInput | undefined> => {
  // -------- blocks -------- //
  const newBlocks = await Promise.all(blocks.map(async (block) => {
    const values = eachSectionBlockCodec.encode(block.translated);
    const image = block.image;

    if (image) {
      const file = await getFileFromUrl(image.url);

      values.image = file; // should be an array
      values.imagePosition = block.imagePosition;
    }

    return values;
  }));

  return { blocks: newBlocks };
};

export const getPageSectionEditionInitialValues = async (
  section: IPageSection | null | undefined
): Promise<PageSectionInput | undefined> => {
  if (!section) return;
  const blocksValues = await getSectionBlocksEditionCmsInitialValues(
    section.blocks || []
  );

  const values = {
    ...getValues(section, ['active']),
    ...pageSectionCodec.encode(section.translated),
    blocks: blocksValues?.blocks?.length ? blocksValues.blocks : [{ title: '' }],
  };

  return values;
};

/**
 * form initial values for page edition
 * @param page
 * @returns
 */
export const getPageStepOneEditionInitialValues = async (
  page: IPage | null | undefined
): Promise<IPageStepOneInput | undefined> => {
  if (!page) return;
  const values = pageCodec.encode(page.translated as Record<string, any>);
  const { previewImage } = await getCMSImagesInitialValues<IPage>(page);

  return { ...values, previewImage };
};

export const getPageStepTwoEditionInitialValues = async (
  page: IPage | null | undefined
): Promise<IPageStepTwoInput | undefined> => {
  if (!page) return;
  const { bannerImage, images } = await getCMSImagesInitialValues<IPage>(page);

  return { bannerImage, images };
};

export const getPageStepThreeEditionInitialValues = <O extends IPageAttributes | null | undefined>(
  page: O,
  locale: Locale
): IPageStepThreeFormInput | undefined => {
  if (!page) return;

  // only the first linked category drives the cascade (root -> subcategory -> sub-subcategory)
  const currentCategories = (page as Record<string, any>)?.categories;
  const currentCategory = Array.isArray(currentCategories) ? currentCategories[0] : undefined;
  // nested pointers — only `objectId` is available at each hop, not `id` (see toJSONWithId doc comment)
  const parentCategory = typeof currentCategory === 'string' ? undefined : currentCategory?.parentCategory;
  const grandParentCategoryId = parentCategory?.parentCategory?.objectId;

  let categoryId = typeof currentCategory === 'string' ? currentCategory : currentCategory?.objectId;
  let subcategoryId: string | undefined;
  let subcategory2Id: string | undefined;

  if (grandParentCategoryId) {
    // currentCategory is a level-3 leaf (sub-subcategory)
    categoryId = grandParentCategoryId;
    subcategoryId = parentCategory?.objectId;
    subcategory2Id = typeof currentCategory === 'string' ? currentCategory : currentCategory?.objectId;
  } else if (parentCategory?.objectId) {
    // currentCategory is a level-2 subcategory
    categoryId = parentCategory.objectId;
    subcategoryId = typeof currentCategory === 'string' ? currentCategory : currentCategory?.objectId;
  }

  const values: Record<string, any> = {
    active: !!page.active,
    country: page.country ?? DEFAULT_COUNTRY_CODE,
    linkLocations: page.linkLocations || [],
    categories: getCategoriesPointersInitialValues(page, locale),
    code: page.code || '',
    category: categoryId,
    subcategory: subcategoryId,
    subcategory2: subcategory2Id,
  };

  return values;
};

export const getFinalPageInitialValues = async <O extends IPage | null | undefined>(
  page: O,
  locale: Locale
): Promise<Partial<IPageFormInput> | undefined> => {
  if (!page) {
    return {
      active: true,
      country: DEFAULT_COUNTRY_CODE,
      linkLocations: [],
      categories: [],
    };
  }
  const stepOneValues = getPageStepOneEditionInitialValues(page);
  const stepTwoValues = getPageStepTwoEditionInitialValues(page);
  const stepThreeValues = getPageStepThreeEditionInitialValues(page, locale);

  return Promise.all([stepOneValues, stepTwoValues, stepThreeValues])
    .then(([stepOne, stepTwo, stepThree]) => ({
      ...stepOne,
      ...stepTwo,
      ...stepThree,
    }));
};

/**
 * initial form values for creation or edition
 * @param category
 * @returns
 */
export const getCategoryFormInitialValues = async (
  category: ICategory | null | undefined
): Promise<ICategoryInput> => {
  // ----------- creation ----------- //
  if (!category) {
    return { active: true };
  }
  // ----------- update ----------- //

  const values: Record<string, any> = {
    ...getValues(category, ['active', 'entity', 'image', 'code']),
    ...categoryCodec.encode(category.translated as Record<string, any>),
    // nested pointer — only `objectId` is available, not `id` (see toJSONWithId doc comment)
    parentCategory: category.parentCategory
      ? category.parentCategory.objectId
      : undefined,
  };

  if (category.image) {
    const image = category.image;
    const file = await getFileFromUrl(image.url);

    values.image = file; // should be an array
  }

  return values;
};

/**
 * create a pointer by category id
 * ex: 'myId' => pointer
 * @param categoryId
 * @returns
 */
export const getCategoryPointer = (categoryId: string): Parse.Object => {
  // array of pointers
  const category = new Category();

  category.id = categoryId;
  return category;
};

/**
 * create a list of pointer by a list of category id
 * ex: ['myId'] => [pointer]
 * @param categoryIds
 * @returns
 */
export const getCategoryPointersFromIds = (categoryIds: string[]): Parse.Object[] | void => {
  if (!categoryIds) return;

  // array of pointers
  const categories = categoryIds.map(getCategoryPointer);

  return categories;
};

/**
 * get categories name separated by comma
 * @param categories
 * @param locale
 * @returns
 */
export const getTranslatedCategoriesName = (categories: ICategory[], locale: Locale) => {
  return categories?.map((category: ICategory) => getTranslatedField<ICategoryTranslatedFields>(
    category.translated,
    locale, 'name')
  ).join(', ');
};

export const getImagePositionLabel = (position: string): string => {
  const option = imagePositionOptions.find(option => option.value === position);

  return option
    ? option.label
    : '';
};

export const getLinkEmplacementLabel = (emplacement: string): string => {
  const option = pageLinkLocationOptions.find(option => option.value === emplacement);

  return option
    ? option.label
    : '';
};

/**
 * the view target an article is measured against: its own when the editor set one, the ordinary
 * one otherwise, so every article can be read as a percentage rather than as a raw count
 */
export const getArticleViewsGoal = (article: IArticle): number =>
  article.viewsGoal || ARTICLE_DEFAULT_VIEWS_GOAL;

/**
 * how far an article is along its view goal, in whole percent. Not capped at 100: an article that
 * doubled its target is exactly what an editor wants to spot, so 200 % stays readable as 200 %.
 */
export const getArticleViewsGoalPercent = (article: IArticle): number =>
  Math.round(((article.views || 0) / getArticleViewsGoal(article)) * 100);

/**
 * where an article stands, from the two flags it carries. The bin wins over everything else: a
 * binned article is off the website whatever its `active` flag still says.
 */
export const getArticleStatus = (article: IArticle): ArticleStatusEnum => {
  if (article.deleted) return ArticleStatusEnum.ARCHIVED;

  return article.active
    ? ArticleStatusEnum.PUBLISHED
    : ArticleStatusEnum.DRAFT;
};

export const getArticleStatusColor = (status: ArticleStatusEnum): StatusDotColor => {
  switch (status) {
    case ArticleStatusEnum.PUBLISHED:
      return 'success';
    case ArticleStatusEnum.ARCHIVED:
      return 'error';
    default:
      return 'default';
  }
};

export const getTranslatedArticleStatusLabel = (status: ArticleStatusEnum): string =>
  i18n.t(`cms:articleStatus.${status}`);

/**
 * how long the article takes to read, from its own body. Computed here rather than stored: the
 * figure has to follow every edit of the content, and it is the same count the public website
 * prints under the article so the two never disagree.
 */
export const getArticleReadingTimeInMinutes = (htmlContent?: string): number => {
  const text = (htmlContent || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .trim();

  if (!text) return 0;

  return Math.max(1, Math.ceil(text.split(/\s+/).length / AVERAGE_READING_WORDS_PER_MINUTE));
};

/**
 * where a page stands, from the two flags it carries. The bin wins over everything else: a binned
 * page is off the website whatever its `active` flag still says.
 */
export const getPageStatus = (page: IPage): PageStatusEnum => {
  if (page.deleted) return PageStatusEnum.DELETED;

  return page.active
    ? PageStatusEnum.PUBLISHED
    : PageStatusEnum.UNPUBLISHED;
};

export const getPageStatusColor = (status: PageStatusEnum): StatusDotColor => {
  switch (status) {
    case PageStatusEnum.PUBLISHED:
      return 'success';
    case PageStatusEnum.DELETED:
      return 'error';
    default:
      return 'default';
  }
};

export const getTranslatedPageStatusLabel = (status: PageStatusEnum): string =>
  i18n.t(`cms:pageStatus.${status}`);

/**
 * How many languages the page is actually written in — a locale left blank is a translation that
 * does not exist, so it is the filled title that is counted, not the presence of the locale key
 * the form creates for every language up front.
 */
export const getPageTranslationsCount = (page: IPage): number => {
  // typed as one set of fields, keyed by locale at runtime — same shape `getTranslatedField` reads
  const translatedByLocale = (page.translated ?? {}) as unknown as Record<
    string,
    IPageTranslatedFields | undefined
  >;

  return Object.values(translatedByLocale).filter((fields) => !!fields?.title?.trim()).length;
};

export const getCategoryStatus = (category: ICategory): CategoryStatusEnum => {
  if (category.deleted) return CategoryStatusEnum.DELETED;

  return category.active
    ? CategoryStatusEnum.ACTIVE
    : CategoryStatusEnum.INACTIVE;
};

export const getCategoryStatusColor = (status: CategoryStatusEnum): StatusDotColor => {
  switch (status) {
    case CategoryStatusEnum.ACTIVE:
      return 'success';
    case CategoryStatusEnum.DELETED:
      return 'error';
    default:
      return 'default';
  }
};

export const getTranslatedCategoryStatusLabel = (status: CategoryStatusEnum): string =>
  i18n.t(`cms:categoryStatus.${status}`);

/**
 * How many languages the category is actually named in — a locale left blank is a translation that
 * does not exist, so it is the filled name that is counted, not the presence of the locale key the
 * form creates for every language up front.
 */
export const getCategoryTranslationsCount = (category: ICategory): number => {
  // typed as one set of fields, keyed by locale at runtime — same shape `getTranslatedField` reads
  const translatedByLocale = (category.translated ?? {}) as unknown as Record<
    string,
    ICategoryTranslatedFields | undefined
  >;

  return Object.values(translatedByLocale).filter((fields) => !!fields?.name?.trim()).length;
};

/*
 * an empty rich text editor still writes a paragraph tag into the form, so a raw truthiness check
 * on the content field would count an untouched editor as filled
 */
const EMPTY_EDITOR_CONTENTS = ['<p></p>', '<p><br></p>'];

/**
 * Whether one field of a CMS form counts as answered, for the section counters of the summary
 * rail. A boolean is always an answer — a toggle left on its default was still shown to the editor
 * and says what it says — whereas an empty string, an empty list and a missing file are not.
 */
export const isCmsFormFieldFilled = (value: unknown): boolean => {
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();

    return !!trimmed && !EMPTY_EDITOR_CONTENTS.includes(trimmed);
  }
  return value !== undefined && value !== null;
};

/**
 * the active categories hanging directly under `parentId` — the root ones when it is left out.
 * `parentCategory` is a bare pointer on a category read from Parse and a full record on a fixture,
 * so both of its id fields are read.
 */
export const getChildCategories = (categories: ICategory[], parentId?: string): ICategory[] => (
  categories.filter((category) => {
    const categoryParentId = category.parentCategory?.objectId ?? category.parentCategory?.id;

    return category.active && !category.deleted && categoryParentId === parentId;
  })
);

const getParentCategoryId = (category: ICategory): string | undefined => (
  category.parentCategory?.objectId ?? category.parentCategory?.id
);

/**
 * the categories a category can be filed under, laid out as the tree they form: each root followed
 * by its own subcategories, a subcategory labelled with its whole path and one level deeper. A
 * subcategory whose root is not in the list still comes last rather than vanishing from the choice.
 */
export const getParentCategoryOptions = (categories: ICategory[], locale: Locale): IChoiceChipOption[] => {
  const toOption = (category: ICategory): IChoiceChipOption => {
    const name = getTranslatedField(category.translated, locale, 'name');

    if (!getParentCategoryId(category)) return { value: category.id, label: name, depth: 0 };

    const parentName = category.parentCategory?.translated
      ? getTranslatedField(category.parentCategory.translated, locale, 'name')
      : '';

    return {
      value: category.id,
      label: [parentName, name].filter(Boolean).join(CATEGORY_PATH_SEPARATOR),
      depth: 1,
    };
  };

  const roots = categories.filter((category) => !getParentCategoryId(category));
  const rootIds = roots.map((root) => root.id);
  const orphans = categories.filter((category) => {
    const parentId = getParentCategoryId(category);

    return !!parentId && !rootIds.includes(parentId);
  });

  return [
    ...roots.flatMap((root) => [
      root,
      ...categories.filter((category) => getParentCategoryId(category) === root.id),
    ]),
    ...orphans,
  ].map(toOption);
};

/**
 * the labels of the options whose values are picked, joined in the order they were picked — how a
 * many-valued choice (an article's categories) is restated as one line under it and in the summary
 */
export const getSelectedOptionsLabel = (options: ISelectOption[], values: string[] = []): string => (
  values
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean)
    .join(', ')
);

/**
 * Whether a block of a section form holds what the site needs to draw it: a title and a content in
 * the default language. The other languages fall back to it on the site, so a block missing only a
 * translation is still a block the visitor will see.
 */
export const isSectionBlockComplete = (block: Record<string, unknown> | undefined): boolean => (
  !!block &&
  isCmsFormFieldFilled(block[`${DEFAULT_LOCALE}:title`]) &&
  isCmsFormFieldFilled(block[`${DEFAULT_LOCALE}:content`])
);

/**
 * where a block's picture goes, in the words the list of blocks and the editor's head use for it:
 * the chosen side, a prompt while a picture has no side yet, or that the block has none
 */
export const getSectionBlockImageLabel = (
  block: Pick<ISectionBlockProgress, 'hasImage' | 'imagePosition'>
): string => {
  if (!block.hasImage) return i18n.t('cms:sectionForm.noImage');
  if (!block.imagePosition) return i18n.t('cms:sectionForm.chooseImagePosition');

  return i18n.t(`cms:${block.imagePosition}`);
};
