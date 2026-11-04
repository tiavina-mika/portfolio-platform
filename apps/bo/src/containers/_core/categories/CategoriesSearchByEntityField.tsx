import { useState } from 'react';
import { useSelector } from 'react-redux';

import AutocompleteField, { AutocompleteProps } from '@/components/form/fields/AutocompleteField';
import { searchCategoriesForAutocomplete } from '@/redux/actions/_core/category.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/_core/settings.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { ICategory, ICategoryTypeEntity } from '@/types/_core/category.type';
import { getTranslatedField } from '@/utils/_core/settings.utils';

export interface ICategoryOptionValue {
  objectId: string;
  // precomputed on the category — lets a cascade select decide whether to show a subcategory picker
  hasSubcategories?: boolean;
}
type ICategoryOption = ISelectOption<ICategoryOptionValue>;

type Props = {
  entity: ICategoryTypeEntity;
  name: string;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  // only root categories (no parentCategory) — used for the parent category picker
  rootOnly?: boolean;
  // only subcategories of this parent category id — used for the cascade subcategory picker
  parentCategory?: string;
  // exclude this category id (edition mode — a category cannot be its own parent)
  excludeId?: string;
} & Omit<AutocompleteProps<ICategoryOptionValue>, 'options'>;

/**
 * search a category for an article for example
 * @returns
 */
const CategoriesSearchByEntityField = ({
  entity, name, label, placeholder, multiple = true, rootOnly, parentCategory, excludeId, ...otherProps
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);

  const [categoryOptions, setCategoryOptions] = useState<ICategoryOption[]>([]);
  const [isCategoryOptionsLoading, setIsCategoryOptionsLoading] = useState<boolean>(false);

  /** autocomplete search — debouncing is handled by AutocompleteInput */
  const handleSearchCategory = async (search: string) => {
    setIsCategoryOptionsLoading(true);
    const categories = (await searchCategoriesForAutocomplete(search, entity, {
      rootOnly, parentCategory, excludeId,
    })) || [];
    const newOptions = categories.map((category: ICategory) => ({
      value: { objectId: category.id, hasSubcategories: !!category.hasSubcategories },
      label: getTranslatedField(category.translated, locale, 'name'),
    }));

    setCategoryOptions(newOptions);
    setIsCategoryOptionsLoading(false);
  };

  return (
    <AutocompleteField<ICategoryOptionValue>
      {...otherProps}
      disableNoOptions
      fullWidth
      label={label}
      loading={isCategoryOptionsLoading}
      multiple={multiple}
      name={name}
      onSearch={handleSearchCategory}
      options={categoryOptions}
      placeholder={placeholder}
    />
  );
};

export default CategoriesSearchByEntityField;
