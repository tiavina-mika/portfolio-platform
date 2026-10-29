import { Button, FormHelperText, Stack } from '@mui/material';
import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiTrash } from 'react-icons/fi';

import CardFormBlock from '@/components/form/CardFormBlock';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import SelectField from '@/components/form/fields/SelectField';
import TextEditorField from '@/components/form/fields/TextEditorField';
import TextField from '@/components/form/fields/TextField';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import { locales } from '@/config/i18n';
import { imagePositionOptions } from '@/constants/cms.constants';
import { useTranslatedValuesByTab } from '@/hooks/useTranslatedValuesByTab';
import { Locale } from '@/types/setting.type';
import { DEFAULT_LOCALE } from '@/utils/constants';

type Props = {
  name: string;
  currentLocale?: Locale;
};

const TranslatedSectionBlocksField = ({
  name,
  currentLocale,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const {
    onTabChange, tab,
  } = useTranslatedValuesByTab();

  // hooks
  const {
    control,
    watch,
    formState: {
      errors,
    },
  } = useFormContext();

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  const watchFieldArray = watch(name);
  const controlledFields = useMemo(() => {
    return fields.map((field, index) => {
      const watchedFields = watchFieldArray?.[index] || {};

      return {
        ...field,
        ...watchedFields,
      };
    });
  }, [fields, watchFieldArray]);

  return (
    <div>
      {/* language selection tab */}
      {!currentLocale && (
        <TranslationTabs
          tab={tab}
          onTabChange={onTabChange}
        />
      )}

      {/* fields array */}
      {controlledFields.map((item, index) => {
        const error = errors[name]
          ? (errors[name] as any)[index]
          : {};

        return (
          <div key={item.id}>
            <CardFormBlock
              title={`${t('cms:block')} n° ${index + 1}`}
            >
              {/* -------- each lang -------- */}
              {locales.map((locale: string) => {
                return (
                  <div
                    // hide other locale fields, display only the selected (current) locale
                    style={{
                      display: locale === (currentLocale || tab)
                        ? 'block'
                        : 'none',
                      marginTop: 12,
                    }}
                  >
                    <Stack spacing={1}>
                      <TextField
                        fixedLabel
                        fullWidth
                        errorMessage={error[`${locale}:title`]}
                        fieldClassName="flex1"
                        label={t('cms:titleOfEachBlock')}
                        name={`${name}.${index}.${locale}:title`}
                        required={locale === DEFAULT_LOCALE}
                        type="text"
                        variant="outlined"
                      />
                      {error && <FormHelperText error>{error[`${locale}:title`]?.message}</FormHelperText>}
                    </Stack>
                    <Stack>
                      <TextField
                        fixedLabel
                        fullWidth
                        multiline
                        label={t('common:description')}
                        name={`${name}.${index}.${locale}:description`}
                        rows={3}
                        type="text"
                        variant="outlined"
                      />
                      {error && (
                        <FormHelperText error>
                          {error[`${locale}:description`]?.message}
                        </FormHelperText>
                      )}
                    </Stack>
                    <Stack css={{ marginTop: 12 }}>
                      <TextEditorField
                        id={locale + index + 'content'}
                        label={t('cms:content')}
                        name={`${name}.${index}.${locale}:content`}
                        required={locale === DEFAULT_LOCALE}
                        toolbar={['bold', 'italic', 'underline', 'link', 'orderedList', 'bulletList']}
                      />
                      {error && <FormHelperText error>{error[`${locale}:content`]?.message}</FormHelperText>}
                    </Stack>
                  </div>
                );
              })}

              <div css={{ marginTop: 12 }}>
                <DropzoneField
                  shouldReset // can reset input in edition
                  error={(errors as any)?.[name]?.[index]?.image?.message}
                  helperText={t('cms:blockImageHelper')}
                  inputLabel={t('common:addImage')}
                  label={t('common:image')}
                  multiple={false}
                  name={`${name}.${index}.image`}
                />
              </div>

              {/* displayed only if an image was selected */}
              {watch(`${name}.${index}.image`) && (
                <Stack css={{ marginTop: 24 }}>
                  <SelectField
                    isClearable
                    required
                    hasError={errors && (errors as any)?.[name]?.[index]?.imagePosition}
                    helperText={t('cms:imagePositionHelper')}
                    label={t('cms:imagePosition')}
                    name={`${name}.${index}.imagePosition`}
                    options={imagePositionOptions}
                    variant="outlined"
                  />
                  {(errors as any)?.[name]?.[index] && (
                    <FormHelperText error>
                      {(errors as any)[name][index]?.imagePosition?.message}
                    </FormHelperText>
                  )}
                </Stack>
              )}
              {/*
                * delete a line, each line of translated fields are removed
                * NOTE: it's should be outside of the locale loop
                * NOTE: it will remove each line of translated fields
              */}
              <div style={{ marginTop: 12 }}>
                <Button
                  color="error"
                  css={{ padding: '4px 12px', borderRadius: 4 }}
                  startIcon={<FiTrash size={18} />}
                  variant="outlined"
                  onClick={() => remove(index)}
                >
                  {`${t('delete')} ${t('cms:block').toLowerCase()} n° ${index + 1}`}
                </Button>
              </div>
            </CardFormBlock>
          </div>
        );
      })}
      {/*
        * add a new line of translated fields
        * a new line for each translated fields
      */}
      <div css={{ marginTop: 12 }}>
        <Button
          color="primary"
          css={{ padding: '4px 12px', borderRadius: 4 }}
          startIcon={<FiPlus size={18} />}
          variant="outlined"
          onClick={() => {
            const newLine = locales.reduce((acc, locale) => {
              // add new field here
              (acc as any)[`${name}.${controlledFields.length}.${locale}:name`] = '';
              return acc;
            }, {});

            append(newLine);
          }}
        >
          {t('cms:addBlock')}
        </Button>
      </div>
    </div>
  );
};

export default TranslatedSectionBlocksField;
