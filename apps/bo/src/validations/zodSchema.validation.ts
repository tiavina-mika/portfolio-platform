/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @cspell/spellchecker */
import { z } from 'zod';

import i18n, { locales } from '@/config/i18n';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/constants/file.constants';
import { TranslatedFieldOption } from '@/types/app.type';

import { DEFAULT_LOCALE } from '../utils/constants';
import { convertFileExtensionToMimeType, convertFileSizeToBytes } from '../utils/file.utils';

/**
 * Generate a schema for date or number with optional min and max constraints
 * @param type 'date' or 'number'
 * @param required whether the field is required
 * @param options optional min and max constraints
 */
export const generateDateOrNumberSchema = (
  type: 'date' | 'number',
  required: boolean,
  options?: { min?: number | Date; max?: number | Date }
): z.ZodTypeAny => {
  const { min, max } = options || {};

  let mainSchema: z.ZodTypeAny;

  if (type === 'date') {
    mainSchema = z.date();
    if (min !== undefined) {
      mainSchema = (mainSchema as z.ZodDate).min(min as Date);
    }
    if (max !== undefined) {
      mainSchema = (mainSchema as z.ZodDate).max(max as Date);
    }
  } else {
    mainSchema = z.coerce.number();
    if (min !== undefined) {
      mainSchema = (mainSchema as z.ZodNumber).min(min as number);
    }
    if (max !== undefined) {
      mainSchema = (mainSchema as z.ZodNumber).max(max as number);
    }
  }

  if (!required) {
    mainSchema = mainSchema.optional();
  }

  const baseSchema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    mainSchema
  );

  return required ? baseSchema : baseSchema.optional();
};

type FileValidationOptions = {
  /**
   * minimum file size in MB
   * @default undefined
   */
  minSize?: number;
  /**
   * maximum file size in MB
   * @default undefined
   */
  maxSize?: number;
  /**
   * allowed file extensions (e.g.: ['jpg', '.png']) [NOTE: the dot is optional]
   * @default undefined
   */
  extensions?: string[];
  /**
   * upload type: 'single' or 'multiple'
   * NOTE: if max > 1, type will be considered as 'multiple' even if this parameter is 'single'
   * NOTE: Dropzone always returns an array of files even for single file upload
   * So when using it, always use 'multiple' and set max to 1 for single file upload
   * @default false
   */
  multiple?: boolean;
  /**
   * Minimum number of files (only for multiple files)
   * @default 1
   */
  min?: number;
  /**
   * Maximum number of files (only for multiple files)
   * @default 1
   */
  max?: number;

  shouldCheckMimeType?: boolean;
};

/**
 * Generate schema for file upload field
 * @param required whether the field is required
 * @param options file validation options
 * @returns zod schema
 */
export const generateFileSchema = (
  /**
   * whether the field is required
   * @default false
   */
  required = false,
  options?: FileValidationOptions
) => {
  const {
    minSize = 0,
    maxSize = MAX_IMAGE_SIZE,
    extensions = ACCEPTED_IMAGE_TYPES,
    min = 1,
    max = 1,
    multiple = false,
  } = options || {};

  const isMultiple = multiple || max > 1;

  let fileSchema: z.ZodFile | z.ZodOptional<z.ZodFile> = z.file();

  if (extensions !== undefined) {
    // convert extensions to mime types (e.g.: '.jpg' => 'image/jpg', 'png' => 'image/png')
    const mimeTypes = extensions.map(convertFileExtensionToMimeType);
    const validMimeTypes = mimeTypes.filter((mime: string) => mime !== '');

    // e.g: Only .jpg, .png are allowed
    const errorMessage = i18n.t('form:globalError.invalidFileMimeType', {
      extensions: extensions.map((ext: string) => (ext.startsWith('.') ? ext : '.' + ext)).join(', '),
      field: i18n.t('form:name.file'),
    });

    fileSchema = fileSchema.mime(validMimeTypes, { error: errorMessage });
  }

  if (minSize !== undefined) {
    fileSchema = fileSchema.min(convertFileSizeToBytes(minSize));
  }
  if (maxSize !== undefined) {
    fileSchema = fileSchema.max(convertFileSizeToBytes(maxSize));
  }

  // We do not need individual file optional here because the array will handle that
  if (!required && !isMultiple) {
    fileSchema = fileSchema.optional();
  }

  /*
   * Force null, empty string and empty array to be undefined for both single and multiple files
   * So that the optional schema works correctly
   */
  const validateFileForPreprocess = (val: unknown) => val === null || val === '' || (Array.isArray(val) && val.length === 0) ? undefined : val;

  if (isMultiple) {
    // Always use plain z.file() for array elements, never z.file().optional()
    let arraySchema: z.ZodOptional | z.ZodArray<z.ZodFile> = z
      .array(z.file()) // Individual file schema
      .min(min) // Number of files min in the list
      .max(max); // Number of files max in the list

    if (!required) {
      arraySchema = arraySchema.optional();
    }

    return z.preprocess(
      validateFileForPreprocess, // Check empty values
      arraySchema
    );
  }

  return z.preprocess(
    validateFileForPreprocess, // Check empty values
    fileSchema
  );
};

/**
 * e.g.: generate schema for a translated field (e.g.: title, description)
 * @param field
 * @param locale
 * @returns
 */
const generateTranslatedIndividualFieldSchema = (
  field: TranslatedFieldOption,
  locale: string
): z.ZodTypeAny => {
  let mainSchema: z.ZodTypeAny = z.string().trim();

  if (field.min !== undefined && (field.required && DEFAULT_LOCALE === locale)) {
    mainSchema = (mainSchema as z.ZodString).min(field.min);
  }
  if (field.max !== undefined) {
    mainSchema = (mainSchema as z.ZodString).max(field.max);
  }
  if (field.required && DEFAULT_LOCALE === locale) {
    mainSchema = (mainSchema as z.ZodString).nonempty();
  } else {
    mainSchema = mainSchema.optional();
  }

  return mainSchema;
};

/**
 * Generate translated fields schema for form (initial values)
 * input: { fr: { title: z.string() }, en: { title: z.string() } }
 * output: { 'fr:title': z.string(), 'en:title': z.string().optional() }
 * @param fields array of translated field options (e.g.: name, min, max, required)
 * @returns Record<string, z.ZodTypeAny>
 */
export const generateTranslatedFieldsInputSchema = (
  fields: TranslatedFieldOption[]
// ): Record<string, z.ZodTypeAny> => {
): z.ZodObject<any> => {
  // e.g.: { 'fr:title': z.string().min(1), 'en:title': z.string().optional() }
  const inputSchema: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    for (const locale of locales) {
      const mainSchema: z.ZodTypeAny = generateTranslatedIndividualFieldSchema(field, locale);

      inputSchema[`${locale}:${field.name}`] = mainSchema;
    }
  }

  return z.object(inputSchema);
};

/**
 * Generate translated fields schema for form output (after encoding)
 * input: { 'fr:title': z.string(), 'en:title': z.string().optional() }
 * output: { fr: { title: z.string() }, en: { title: z.string().optional() }.optional() }
 * @param fields array of translated field options (e.g.: name, min, max, required)
 */
export const generateTranslatedFieldsOutputSchema = (
  fields: TranslatedFieldOption[]
): z.ZodObject<any> => {
  const outputSchema: Record<string, any> = {};

  for (const locale of locales) {
    // e.g.: { name: z.string(), slug: z.string().optional() }
    const fieldObjects = fields.reduce((acc, field) => {
      const mainSchema: z.ZodTypeAny = generateTranslatedIndividualFieldSchema(field, locale);

      (acc as any)[field.name] = mainSchema;
      return acc;
    }, {});

    // e.g.: z.object({ name: z.string(), slug: z.string().optional() })
    let fieldSchema: z.ZodObject<any> | z.ZodOptional<z.ZodObject<any>> = z.object(fieldObjects);

    // Make the whole locale object optional if none of the fields are required for this locale
    if (!(fields.some(field => field.required && DEFAULT_LOCALE === locale))) {
      fieldSchema = fieldSchema.optional();
    }

    // e.g.: outputSchema['fr'] = z.object({ name: z.string(), slug: z.string().optional() })
    outputSchema[locale] = fieldSchema;
  }

  return z.object(outputSchema);
};

/**
 * Get a Zod codec for translated fields
 * * Zod schema for the form (with translated fields as separate fields)
 * * e.g.: { "fr:title": string, "en:title": string }
 * @param formSchema
 * * Zod schema for the db (with translated fields as separate fields)
 * * e.g.: { fr: { title: string }, en: { title: string } }
 * @param dbSchema
 * * translated fields definition
 * @param translatedFieldsObj
 * @returns Zod codec
 */
export const getTranslatedFieldsCodec = (
  translatedFieldsObj: TranslatedFieldOption[] = []
) => {
  // e.g.: { "fr:title": z.string(), "en:title": z.string().optional() }
  const formSchema: z.ZodObject<any> = generateTranslatedFieldsInputSchema(translatedFieldsObj);
  // e.g.: { fr: { title: z.string() }, en: { title: z.string().optional() }.optional() }
  const dbSchema: z.ZodObject<any> = generateTranslatedFieldsOutputSchema(translatedFieldsObj);

  return z.codec(
    // Input schema: Form -> Output schema: DB
    formSchema,
    // Output schema: DB -> Input schema: Form
    dbSchema,
    {
    // Decode : Input -> Output (Form -> DB)
      decode: (input: z.infer<typeof formSchema>) => {
        const output: Partial<z.infer<typeof dbSchema>> = {};

        for (const locale of locales) {
          output[locale] = {};
          for (const field of translatedFieldsObj) {
            const key = `${locale}:${field.name}`;

            if (input[key]) {
              // e.g.: output['fr']['title'] = input['fr:title']
              (output[locale] as any)[field.name] = input[key] as string;
            }
          }

          // Remove empty locale objects (e.g.: { fr: {}, en: {} })
          if (!output[locale] || Object.keys(output[locale]).length === 0) {
            delete output[locale];
          }
        }

        // e.g.: { fr: { title: 'Titre en francais' }, en: { title: 'Title in english' } }
        return output;
      },

      // Encode : Output -> Input (DB -> Form)
      encode: (output: z.infer<typeof dbSchema>) => {
        // e.g.: { "fr:title": 'Titre en francais', "en:title": 'Title in english' }
        const input: Partial<z.infer<typeof formSchema>> = {};

        // const locales: ('fr' | 'en')[] = ['fr', 'en'];
        const translatedFields = translatedFieldsObj;

        for (const locale of locales) {
          for (const field of translatedFields) {
            const value = (output as any)?.[locale]?.[field.name];

            if (value) {
              const realValue = field.transform ? field.transform(value) : value;

              // e.g.: input['fr:title'] = output['fr']['title']
              (input as any)[`${locale}:${field.name}`] = realValue;
            }
          }
        }

        return input as z.infer<typeof formSchema>;
      },
    }
  );
};
