import { locales } from '@/config/i18n';
import { categoryEntityOptions, imagePositionOptions, pageLinkLocationOptions } from '@/constants/cms.constants';
import { Category } from '@/redux/actions/category.action';
import { DefaultMUIColorType, ISelectOption } from '@/types/app.type';
import { IArticle, IArticleInput } from '@/types/article.type';
import {
  CategoryEntityEnum, ICategory, ICategoryInput, ICategoryTranslatedFields,
} from '@/types/category.type';
import { IFileCloud } from '@/types/file.type';
import {
  IPage, ISectionBlockObj, ISectionBlocksInput, IPageSection,
  IPageStepOneInput, IPageStepThreeInput, IPageStepTwoInput,
  PageSectionInput,
} from '@/types/page.type';
import { Locale } from '@/types/setting.type';
import { articleCodec } from '@/validations/article.validations';
import { categoryCodec } from '@/validations/category.validation';
import { eachSectionBlockCodec, pageCodec, pageSectionCodec } from '@/validations/page.validations';

import { getFileFromUrl } from './file.utils';
import { getValues } from './parse.utils';
import { getTranslatedField } from './settings.utils';

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
 * format translated form fields name to data base fields
 * ex: { "fr:title": "my-title-fr", active: true } to { active: true, translated:
 * {{ "fr": { "title" : "my-title-fr" }}}}
 * @param values
 * @returns
 */
export const formatTranslatedFormValuesToSave =
  (fields: string[] = []) =>
    (values: Record<string, any>): any => {
      const newValues: Record<string, any> = {};
      const translated: Record<string, any> = {};

      for (const key of Object.keys(values)) {
        /*
         * important: all translated fields must be in this key
         * (ex: { translated: { fr: { title: 'xxx' }, en: { title: 'yyy' } } })
         */
        const separatedKey = key.split(':');
        const locale = separatedKey[0]; // ex: fr
        const keyName = separatedKey[separatedKey.length - 1]; // ex: title

        /**
         * change the key name to the translated object
         * check example ['fr', 'content'], so it is a translated field
         */
        if (keyName && fields.includes(keyName) && separatedKey.length === 2) {
          if (locales.includes(locale)) {
            translated[locale] = {
              ...translated[locale],
              [keyName]: values[key],
            };
          }
        }
        // otherwise outside the "translated" field
        else {
          newValues[key] = values[key];
        }
      }

      return {
        ...newValues,
        translated,
      };
    };

/**
 * transform form values to values to save
 * @param values
 * @returns
 */
export const formatTranslatedPageFormValuesToSave = (values: Record<string, any>) => {
  // other fields transformation
  const newValues: Record<string, any> = {};

  // translated blocks transformation
  if (values.blocks) {
    const translatedBlocks = [];

    for (const block of values.blocks) {
      const translatedBlock = formatTranslatedFormValuesToSave(block);

      translatedBlocks.push(translatedBlock);
    }
    newValues.blocks = translatedBlocks;
  }

  return newValues;
};

/**
 * category format for select option
 * used mainly for autocomplete full text search
 * @param locale
 * @returns
 */
export const getCategoryInputValue = (locale: Locale) => (category: ICategory) => {
  return {
    label: getTranslatedField(category.get('translated'), locale, 'name'),
    value: { objectId: category.id },
  };
};

export const getCMSImagesInitialValues = async <T extends Parse.Object>(
  parseObj: T
) => {
  const [bannerImage, previewImage, image] = await Promise.all([
    parseObj.has('bannerImage')
      ? getFileFromUrl((parseObj.get('bannerImage') as IFileCloud).url)
      : null,
    parseObj.has('previewImage')
      ? getFileFromUrl((parseObj.get('previewImage') as IFileCloud).url)
      : null,
    parseObj.has('image')
      ? getFileFromUrl((parseObj.get('image') as IFileCloud).url)
      : null,
  ]);

  const images = await Promise.all(
    parseObj.get('images')?.map((image: IFileCloud) => getFileFromUrl(image.url)) ?? []
  );

  return {
    bannerImage,
    previewImage,
    image,
    images,
  };
};

const getCategoriesPointersInitialValues = (
  item: Parse.Object,
  locale: Locale
): ISelectOption[] => {
  if (!item.has('categories')) return [];

  // array of pointer json to form select option
  const categories = item.get('categories') || [];

  if (categories.length <= 0) return [];

  const categoryOptions = categories.map((category: ICategory) => ({
    label: getTranslatedField(category.get('translated'), locale, 'name'),
    value: category.id,
  }));

  return categoryOptions || [];
};

export const getArticleEditionInitialValues = async (
  article: IArticle | null | undefined,
  locale: Locale
): Promise<IArticleInput | undefined> => {
  if (!article) return;
  const values = {
    ...getValues(article, ['active']),
    ...articleCodec.encode(article.get('translated') as Record<string, any>),
    categories: getCategoriesPointersInitialValues(article, locale),
  };
  const imagesFields = await getCMSImagesInitialValues<IArticle>(article);

  const defaultValues = { ...values, ...imagesFields };

  return defaultValues as IArticleInput;
};

export const getSectionBlocksEditionCmsInitialValues = async (
  blocks: ISectionBlockObj[] = []
): Promise<ISectionBlocksInput | undefined> => {
  // -------- blocks -------- //
  const newBlocks: any = [];

  for (const block of blocks) {
    const values = eachSectionBlockCodec.encode(block.translated);
    const image = block.image;

    if (image) {
      const file = await getFileFromUrl(image.url);

      values.image = file; // should be an array
      values.imagePosition = block.imagePosition;
    }

    newBlocks.push(values);
  }

  return { blocks: newBlocks };
};

export const getPageSectionEditionInitialValues = async (
  section: IPageSection | null | undefined
): Promise<PageSectionInput | undefined> => {
  if (!section) return;
  const blocksValues = await getSectionBlocksEditionCmsInitialValues(
    section.get('blocks') || []
  );

  const values = {
    ...getValues(section, ['active']),
    ...pageSectionCodec.encode(section.get('translated') as Record<string, any>),
    blocks: blocksValues?.blocks?.length ? blocksValues.blocks : [{ title: '' }],
  };

  return values;
};

/**
 * form initial values for page edition
 * @param page
 * @returns
 */
export const getPageStepOneEditionInitialValues = (
  page: IPage | null | undefined
): IPageStepOneInput | undefined => {
  if (!page) return;
  const values = pageCodec.encode(page.get('translated') as Record<string, any>);

  return values;
};

export const getPageStepTwoEditionInitialValues = async (
  page: IPage | null | undefined
): Promise<IPageStepTwoInput | undefined> => {
  if (!page) return;
  const imagesFields = await getCMSImagesInitialValues<IPage>(page);

  return imagesFields;
};

export const getPageStepThreeEditionInitialValues = (
  page: IPage | null | undefined,
  locale: Locale
): IPageStepThreeInput | undefined => {
  if (!page) return;
  const values: Record<string, any> = {
    active: !!page.get('active'),
    linkLocations: page.get('linkLocations') || [],
    categories: getCategoriesPointersInitialValues(page, locale),
  };

  return values;
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

  const values = {
    ...getValues(category, ['active', 'entity', 'image']),
    ...categoryCodec.encode(category.get('translated') as Record<string, any>),
  };

  if (category.get('image')) {
    const image = category.get('image')!;
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
    category.get('translated'),
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
