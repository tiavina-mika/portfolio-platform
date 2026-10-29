import { debounce } from 'lodash';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import AutocompleteField, { AutocompleteProps } from '@/components/form/fields/AutocompleteField';
import { searchCategoriesForAutocomplete } from '@/redux/actions/category.action';
import { getSettingsLocaleSelector } from '@/redux/reducers/settings.reducer';
import { ISelectOption } from '@/types/app.type';
import { ICategory, ICategoryTypeEntity } from '@/types/category.type';
import { getTranslatedField } from '@/utils/settings.utils';

interface ICategoryOptionValue {
  objectId: string;
}
type ICategoryOption = ISelectOption<ICategoryOptionValue>;

type Props = {
  entity: ICategoryTypeEntity;
  name: string;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
} & Omit<AutocompleteProps<ICategoryOptionValue>, 'options'>;

/**
 * search a category for an article for example
 * @returns
 */
const CategoriesSearchByEntityField = ({
  entity, name, label, placeholder, multiple = true, ...otherProps
}: Props) => {
  const locale = useSelector(getSettingsLocaleSelector);

  const [categoryOptions, setCategoryOptions] = useState<ICategoryOption[]>([]);
  const [isCategoryOptionsLoading, setIsCategoryOptionsLoading] = useState<boolean>(false);

  /** autocomplete search */
  const handleSearchCategory = debounce(async (search: string) => {
    setIsCategoryOptionsLoading(true);
    const categories = (await searchCategoriesForAutocomplete(search, entity)) || [];
    const newOptions = categories.map((category: ICategory) => ({
      value: { objectId: category.id },
      label: getTranslatedField(category.get('translated'), locale, 'name'),
    }));

    setCategoryOptions(newOptions);
    setIsCategoryOptionsLoading(false);
  }, 500);

  return (
    <AutocompleteField<ICategoryOptionValue>
      {...otherProps}
      disableNoOptions
      fullWidth
      label={label}
      loading={isCategoryOptionsLoading}
      multiple={multiple}
      name={name}
      options={categoryOptions}
      placeholder={placeholder}
      onSearch={handleSearchCategory}
    />
  );
};

export default CategoriesSearchByEntityField;
