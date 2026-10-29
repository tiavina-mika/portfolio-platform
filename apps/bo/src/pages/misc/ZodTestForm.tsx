/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @cspell/spellchecker */
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  // TextField,
  Typography,
  Container,
  // Alert,
} from '@mui/material';
import { File } from '@web-std/file';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { capitalize } from 'string-ts';
import { z } from 'zod';

// import DatePickerInput from '@/components/form/inputs/DatePickerInput';
import DropzoneField from '@/components/form/dropzone/DropzoneField';
import DatePickerField from '@/components/form/fields/DatePickerField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { loadZodI18nLocale } from '@/config/i18n/zod-i18n';
import { TranslatedFieldOption } from '@/types/app.type';
import { CategoryEntityEnum } from '@/types/category.type';
import { Locale } from '@/types/setting.type';
import {
  generateDateOrNumberSchema, generateFileSchema,
  generateTranslatedFieldsInputSchema, getTranslatedFieldsCodec,
} from '@/validations/zodSchema.validation';

const schema = z.object({
  name: z.string()
  // .nonempty()
    /*
     * .min(3)
     * .min(3, { message: 'Nom trop court (custom override)' })
     */
    .max(50),
  /*
   * age: z.preprocess(
   *   (val) => (val === '' ? undefined : val),
   *   z.coerce.number().min(18).optional()
   * ).optional(),
   */
  age: generateDateOrNumberSchema('number', true),
  /*
   * age: z.coerce.number().min(18),
   * age: z.preprocess(
   *   (val) => (val === '' ? undefined : val),
   *   z.coerce.number().min(18).optional()
   * ),
   */
  isActive: z.boolean(),
  customField: z.string().refine((val) => val !== 'bad', {
    message: 'Valeur interdite',
    params: { field: 'customField' }, // Pour i18n custom
  }),
  language: z.string(), // Nouveau champ pour la langue (non validé strictement)
  dateOfBirth: generateDateOrNumberSchema('date', false),
  // dateOfBirth: generateDateOrNumberSchema('date', false, { min: dayjs().subtract(1, 'year').toDate(), max: dayjs().toDate() }),
  files: generateFileSchema(false, { extensions: ['.jpg', '.png'], multiple: false }),
});

export const testOptionNumberCases = () => {
  /*
   * const numberSchema = z.preprocess(
   *   (val) => (val === '' || val === null ? undefined : val),
   *   z.coerce.number().min(18).optional()
   * ).optional();
   */

  const numberSchema = generateDateOrNumberSchema('number', false, { min: 18 });

  console.log('optional undefined: ', numberSchema.safeParse(undefined)); // success
  console.log('optional null: ', numberSchema.safeParse(null)); // success
  console.log('optional empty string: ', numberSchema.safeParse('')); // success
  console.log('optional 0: ', numberSchema.safeParse(0)); // Error: too small
  console.log('optional 19: ', numberSchema.safeParse(19)); // success

  /*
   * const nonOptionalNumberSchema = z.preprocess(
   *   (val) => (val === '' || val === null ? undefined : val),
   *   z.coerce.number().min(18)
   * );
   */
  const nonOptionalNumberSchema = generateDateOrNumberSchema('number', true, { min: 18 });

  console.log('required undefined: ', JSON.parse(JSON.stringify(nonOptionalNumberSchema.safeParse(undefined).error?.issues?.[0].message))); // Error: Required
  console.log('required null: ', JSON.parse(JSON.stringify(nonOptionalNumberSchema.safeParse(null).error?.issues?.[0].message))); // Error: Required
  console.log('required empty string: ', JSON.parse(JSON.stringify(nonOptionalNumberSchema.safeParse('').error?.issues?.[0].message))); // Error: Required
  console.log('required 0: ', JSON.parse(JSON.stringify(nonOptionalNumberSchema.safeParse(0).error?.issues?.[0].message))); // Error: too small
  console.log('required 19: ', nonOptionalNumberSchema.safeParse(19)); // success

  console.log('------------');
};

export const testDate = () => {
  const optionalDateSchema = generateDateOrNumberSchema('date', false);

  console.log('optional undefined: ', optionalDateSchema.safeParse(undefined)); // success
  console.log('optional null: ', optionalDateSchema.safeParse(null)); // success
  console.log('optional empty string: ', optionalDateSchema.safeParse('')); // success
  console.log('optional valid date: ', optionalDateSchema.safeParse(new Date())); // success
  console.log('optional invalid date: ', optionalDateSchema.safeParse('invalid date')); // Error: Invalid date

  const requiredDateSchema = generateDateOrNumberSchema('date', true);

  console.log('required undefined: ', JSON.parse(JSON.stringify(requiredDateSchema.safeParse(undefined).error?.issues?.[0].message))); // Error: Required
  console.log('required null: ', JSON.parse(JSON.stringify(requiredDateSchema.safeParse(null).error?.issues?.[0].message))); // Error: Required
  console.log('required empty string: ', JSON.parse(JSON.stringify(requiredDateSchema.safeParse('').error?.issues?.[0].message))); // Error: Required
  console.log('required valid date: ', requiredDateSchema.safeParse(new Date()));


  // with dayjs
  const nowDayjs = dayjs();

  const requiredDaysDateSchema = generateDateOrNumberSchema('date', true, { min: nowDayjs.startOf('day').toDate(), max: nowDayjs.endOf('day').toDate() });

  console.log('dayjs undefined: ', JSON.parse(JSON.stringify(requiredDaysDateSchema.safeParse(undefined).error?.issues?.[0].message))); // Error: Required
  console.log('dayjs null: ', JSON.parse(JSON.stringify(requiredDaysDateSchema.safeParse(null).error?.issues?.[0].message))); // Error: Required
  console.log('dayjs empty string: ', JSON.parse(JSON.stringify(requiredDaysDateSchema.safeParse('').error?.issues?.[0].message))); // Error: Required
  console.log('dayjs valid date: ', requiredDaysDateSchema.safeParse(nowDayjs.toDate()));
  console.log('dayjs yesterday: ', JSON.parse(JSON.stringify(requiredDaysDateSchema.safeParse(nowDayjs.subtract(1, 'day').toDate()).error?.issues?.[0].message))); // Error: too small
  console.log('dayjs in 2 days: ', JSON.parse(JSON.stringify(requiredDaysDateSchema.safeParse(nowDayjs.add(2, 'day').toDate()).error?.issues?.[0].message))); // Error: too big
};

export const testTranslatedValue = () => {
  const categorySchema = z.object({
    'fr:title': z.string().nonempty(),
    'en:title': z.string().optional(),
  });

  console.log('category valid: ', categorySchema.safeParse({ 'fr:title': 'Titre en français', 'en:title': 'Title in English' })); // success
  console.log('category fr:title 5: ', JSON.parse(JSON.stringify(categorySchema.safeParse({ 'fr:title': 5, 'en:title': 'Title in English' }).error?.issues?.[0].message))); // Error: fr:title required
  console.log('category missing en:title: ', categorySchema.safeParse({ 'fr:title': 'Titre en français' })); // Error: en:title required
  const requiredStringSchema = z.string().nonempty();

  console.log('non empty string: ', JSON.parse(JSON.stringify(requiredStringSchema.safeParse('').error?.issues?.[0].message))); // Error: Required
  console.log('non empty string 5: ', JSON.parse(JSON.stringify(requiredStringSchema.safeParse(5).error?.issues?.[0].message))); // Error: Required

  const nonRequiredStringSchema = z.string().optional();

  console.log('optional string valid: ', nonRequiredStringSchema.safeParse('Hello')); // success
  console.log('optional string empty: ', nonRequiredStringSchema.safeParse('')); // success
  console.log('optional string 5: ', JSON.parse(JSON.stringify(nonRequiredStringSchema.safeParse(5).error?.issues?.[0].message))); // Error: Expected string, received number
  console.log('optional string null: ', JSON.parse(JSON.stringify(nonRequiredStringSchema.safeParse(null).error?.issues?.[0].message))); // Error: Expected string, received null
};

export const testFile = () => {
  /*
   * const requiredSchema = {
   *   minCheck: z.file().min(2),
   *   maxCheck: z.file().max(5),
   *   mimeCheck: z.file().mime(['text/plain', 'application/json']),
   *   optionalCheck: z.preprocess(
   *     (val) => (val === null || val === '' ? undefined : val),
   *     z.file().mime(['text/plain', 'application/json']).optional()
   *   ),
   * };
   */

  const fileSchema = {
    minCheck: generateFileSchema(true, { minSize: 0.000002 }),
    maxCheck: generateFileSchema(true, { maxSize: 0.000005 }),
    mimeCheck: generateFileSchema(false, { extensions: ['.pdf'], multiple: false }),
    optionalCheck: generateFileSchema(false, { extensions: ['.txt', '.json'] }),
  };

  console.log('min file size (0.000002):', JSON.parse(JSON.stringify(fileSchema.minCheck.safeParse(new File(['c'], 'filename.txt', { type: 'text/plain' })).error?.issues?.[0].message))); // success
  console.log('max file size (0.000005) :', JSON.parse(JSON.stringify(fileSchema.maxCheck.safeParse(new File(['c'.repeat(6)], 'filename.txt', { type: 'text/plain' })).error?.issues?.[0].message))); // error
  console.log('mime file:', fileSchema.mimeCheck.safeParse(new File(['content'], 'filename.jpg', { type: 'image/jpg' }))); // error
  console.log('mime file:', JSON.parse(JSON.stringify(fileSchema.mimeCheck.safeParse(new File(['content'], 'filename.jpg', { type: 'image/jpg' })).error?.issues?.[0].message))); // error
  console.log('optional file undefined:', fileSchema.optionalCheck.safeParse(undefined)); // success
  console.log('optional file null:', fileSchema.optionalCheck.safeParse(null)); // success
  console.log('optional file 5:', JSON.parse(JSON.stringify(fileSchema.optionalCheck.safeParse(5).error?.issues?.[0].message))); // Error: Expected file, received number
};

export const testArrayOfFiles = () => {
  /*
   * const requiredArraySchema = z.preprocess(
   *   (val) => val === null || (Array.isArray(val) && val.length === 0) ? undefined : val,
   *   z.array(
   *     z.file().max(5).mime(['image/jpg', 'image/png'])
   *   ).min(1).max(2)
   * );
   */

  const requiredArraySchema = generateFileSchema(true, { maxSize: 0.000005, extensions: ['jpg', 'png'], min: 1, max: 2 });

  console.log('required array of files valid:', requiredArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
    new File(['c'], 'file2.png', { type: 'image/png' }),
  ])); // success

  console.log('required array of files too many (3):', JSON.parse(JSON.stringify(requiredArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
    new File(['c'], 'file2.png', { type: 'image/png' }),
    new File(['c'], 'file3.jpg', { type: 'image/jpg' }),
  ]).error?.issues?.[0].message))); // Error: too many files

  console.log('required array of files invalid mime (1 of 3):', JSON.parse(JSON.stringify(requiredArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
    new File(['c'], 'file2.png', { type: 'image/png' }),
    new File(['c'], 'file3.gif', { type: 'image/gif' }),
  ]).error?.issues?.[0].message))); // Error: Invalid file type

  console.log('required array of files invalid size (1 of 2):', JSON.parse(JSON.stringify(requiredArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
    new File(['c'.repeat(6)], 'file2.png', { type: 'image/png' }),
  ]).error?.issues?.[0].message))); // Error: file too big

  // empty
  console.log('required array of files []:', JSON.parse(JSON.stringify(requiredArraySchema.safeParse([]).error?.issues?.[0].message))); // Error: Expected array, received null
  console.log('required array of files null:', JSON.parse(JSON.stringify(requiredArraySchema.safeParse(null).error?.issues?.[0].message))); // Error: Expected array, received null
  console.log('required array of files undefined:', JSON.parse(JSON.stringify(requiredArraySchema.safeParse(undefined).error?.issues?.[0].message))); // Error: Expected array, received undefined

  /*
   * const optionalArraySchema = z.preprocess(
   *   (val) => val === null || (Array.isArray(val) && val.length === 0) ? undefined : val,
   *   z.array(
   *     z.file().max(5).mime(['image/jpg', 'image/png'])
   *   ).min(2).max(3).optional()
   * );
   */

  const optionalArraySchema = generateFileSchema(false, { extensions: ['jpg', 'png'], min: 2, max: 3 });

  console.log('optional array of files valid:', optionalArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
    new File(['c'], 'file2.png', { type: 'image/png' }),
    new File(['c'], 'file3.png', { type: 'image/png' }),
  ])); // success
  console.log('optional array of files [1] min error:', JSON.parse(JSON.stringify(optionalArraySchema.safeParse([
    new File(['c'], 'file1.jpg', { type: 'image/jpg' }),
  ]).error?.issues?.[0].message))); // Error : too small
  console.log('optional array of files []:', optionalArraySchema.safeParse([])); // success
  console.log('optional array of files undefined:', optionalArraySchema.safeParse(undefined)); // success
  console.log('optional array of files null:', optionalArraySchema.safeParse(null)); // success
  console.log('optional array of files 5:', JSON.parse(JSON.stringify(optionalArraySchema.safeParse(5).error?.issues?.[0].message))); // Error: Expected file, received number
};

export const testArrayOfObjects = () => {
  const objectArraySchema = z.array(
    z.object({
      name: z.string().nonempty(),
      age: z.number().min(0),
    })
  ).min(1).max(3);

  console.log('array of objects valid:', objectArraySchema.safeParse([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ])); // success
  console.log('array of objects too few (0):', JSON.parse(JSON.stringify(objectArraySchema.safeParse([]).error?.issues?.[0].message))); // Error: too few items
  console.log('array of objects too many (4):', JSON.parse(JSON.stringify(objectArraySchema.safeParse([
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
    { name: 'David', age: 40 },
  ]).error?.issues?.[0].message))); // Error: too many items

  console.log('array of objects invalid item (2nd):', JSON.parse(JSON.stringify(objectArraySchema.safeParse([
    { name: 'Alice', age: 30 },
    { name: 'James', age: -5 },
  ]).error?.issues?.[0].message))); // Error: invalid item
};

const translatedFieldsObj: TranslatedFieldOption[] = [
  { name: 'name', required: true, max: 100, transform: capitalize },
  { name: 'slug', required: false, max: 100 },
];

export const testCodecs = () => {
  // Form initial values schema
  const formSchema = z.object({
    isActive: z.boolean(),
    ...generateTranslatedFieldsInputSchema(translatedFieldsObj).shape,
  });

  const translatedCodec = getTranslatedFieldsCodec(translatedFieldsObj);

  const formData = {
    'fr:name': 'titre en francais',
    'en:name': 'titre en anglais',
    'mg:name': '',
    'fr:tags': 'fr tags',
    'en:tags': 'en tags',
    'mg:tags': '',
    'mg:slug': 'mg-slug',
    'fr:slug': 'fr-slug',
    'en:slug': 'en-slug',
    isActive: true,
    // previewImage: null,
  } as z.infer<typeof formSchema>;

  const dbData = translatedCodec.decode(formData);

  console.log('Form → DB:', JSON.stringify(dbData, null, 2));
  // Output : { "isActive": true, "translated": { "fr": { "title": "Titre en francais" }, "en": { "title": "Title in english" } } }

  const reverseFormData = translatedCodec.encode(dbData);

  console.log('DB → Form:', JSON.stringify(reverseFormData, null, 2));
// Output : { "isActive": true, "fr:title": "Titre en francais", "en:title": "Title in english" }
};

export const testEnum = () => {
  const requiredEnumSchema = z.enum(CategoryEntityEnum);

  console.log('required enum valid (page):', requiredEnumSchema.safeParse('page')); // success
  console.log('required enum invalid (blog):', JSON.parse(JSON.stringify(requiredEnumSchema.safeParse('blog').error?.issues?.[0].message))); // Error: Invalid enum value
  console.log('required enum invalid (undefined):', JSON.parse(JSON.stringify(requiredEnumSchema.safeParse(undefined).error?.issues?.[0].message))); // Error: Required
  console.log('required enum invalid (null):', JSON.parse(JSON.stringify(requiredEnumSchema.safeParse(null).error?.issues?.[0].message))); // Error: Required

  const optionalEnumSchema = z.preprocess(
    (val) => (val === null ? undefined : val),
    z.enum(CategoryEntityEnum).optional()
  );

  console.log('optional enum valid (article):', optionalEnumSchema.safeParse('article')); // success
  console.log('optional enum valid (undefined):', optionalEnumSchema.safeParse(undefined)); // success
  console.log('optional enum valid (null):', optionalEnumSchema.safeParse(null)); // success
  console.log('optional enum invalid (blog):', JSON.parse(JSON.stringify(optionalEnumSchema.safeParse('blog').error?.issues?.[0].message))); // Error: Invalid enum value
};

type FormData = z.infer<typeof schema>;

const languageOptions = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

const ZodTestForm = () => {
  const [result, setResult] = useState<any>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('fr');

  // Init du form avec react-hook-form + Zod
  const form = useForm<z.input<typeof schema>, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      age: 10,
      isActive: false,
      customField: '',
      language: 'fr',
      dateOfBirth: undefined,
    },
  });

  const {
    handleSubmit, watch, formState: { errors },
  } = form;

  // console.log('values: ', form.getValues());

  /*
   * testOptionNumberCases();
   * testDate();
   * testTranslatedValue();
   * testFile();
   * testArrayOfFiles();
   * testCodecs();
   * testEnum();
   */
  // Watch pour le champ language et switch auto
  const watchedLanguage = watch('language');

  useEffect(() => {
    if (watchedLanguage !== currentLanguage) {
      setCurrentLanguage(watchedLanguage);
      loadZodI18nLocale(watchedLanguage as Locale); // Switch Zod locale
      console.log(`Langue changée vers : ${watchedLanguage}`);
    }
  }, [watchedLanguage, currentLanguage]);

  const onSubmit = (data: FormData) => {
    // console.log('onSubmit: ', data);

    // setResult(data);

    const parseResult = schema.safeParse(data);

    console.log('🚀 ~ onSubmit ~ parseResult:', parseResult);

    setResult(parseResult);
    if (parseResult.success) {
      console.log('Formulaire valide :', data);
      // Ex. : Appel API ici
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography gutterBottom component="h1" variant="h4">
          Formulaire avec MUI & Zod i18n
        </Typography>

        {/* Select pour choix de langue */}
        <FormControl fullWidth error={!!errors.language}>
          <InputLabel id="language-select-label">Langue</InputLabel>
          <Select
            label="Langue"
            labelId="language-select-label"
            {...form.register('language')} // Avec react-hook-form
            onChange={(e) => form.setValue('language', e.target.value)}
            value={currentLanguage}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.language && (
            <Typography color="error" variant="caption">
              {errors.language.message}
            </Typography>
          )}
        </FormControl>
        <Form form={form} onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fixedLabel
            fullWidth
            name="name"
            type="text"
            variant="outlined"
          />
          <TextField
            fixedLabel
            fullWidth
            name="age"
            type="number"
            variant="outlined"
          />
          <DropzoneField
            // multiple
            label="Fichiers"
            name="files"
          />
          {/* Formulaire principal */}
          {/* Nom */}
          {/* Checkbox Actif */}
          <FormControlLabel
            label="Actif ?"
            control={(
              <Checkbox
                checked={form.watch('isActive')}
                name="isActive"
                onChange={(e) => form.setValue('isActive', e.target.checked)}
              />
            )}
          />

          {/* Champ custom */}
          {/* <TextField
            fullWidth
            label="Champ Custom"
            variant="outlined"
            {...methods.register('customField')}
            error={!!errors.customField}
            helperText={errors.customField?.message}
          /> */}
          {/* Date input */}
          <DatePickerField
            fullWidth
            error={!!errors.dateOfBirth}
            // onChange={(date) => form.setValue('dateOfBirth', dayjs(date).toDate())}
            label="Date de naissance"
            // {...form.register('dateOfBirth')}
            name="dateOfBirth"
          />
          {errors.dateOfBirth && (
            <Typography color="error" variant="caption">
              {errors.dateOfBirth.message}
            </Typography>
          )}

          {/* Bouton submit */}
          <Button
            fullWidth
            color="primary"
            type="submit"
            variant="contained"
          >
            Valider
          </Button>
        </Form>

        {/* Debug résultat */}
        {result && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="h6">Résultat Validation :</Typography>
            <pre style={{ fontSize: '0.8em', overflow: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ZodTestForm;
