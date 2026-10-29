import { z } from 'zod';

/**
 * Unwraps optional/nullable/default/transform wrappers to reach the underlying leaf type,
 * so the template generator below can inspect the real type (string, number, array, object...).
 */
const unwrapZodType = (schema: z.ZodTypeAny): z.ZodTypeAny => {
  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault
  ) {
    return unwrapZodType(schema.unwrap() as z.ZodTypeAny);
  }
  if (schema instanceof z.ZodPipe) {
    return unwrapZodType(schema._def.in as z.ZodTypeAny);
  }
  return schema;
};

/**
 * Builds an empty-value template from a Zod object schema: same field keys as the schema,
 * every value blanked out. Used to generate a downloadable JSON template that an admin can
 * fill by hand and re-upload via JsonUploadButton.
 */
export const generateZodEmptyTemplate = (schema: z.ZodTypeAny): unknown => {
  const unwrapped = unwrapZodType(schema);

  if (unwrapped instanceof z.ZodObject) {
    return Object.fromEntries(
      Object.entries(unwrapped.shape).map(([key, fieldSchema]) => [
        key,
        generateZodEmptyTemplate(fieldSchema as z.ZodTypeAny),
      ])
    );
  }

  if (unwrapped instanceof z.ZodArray) {
    return [];
  }

  if (unwrapped instanceof z.ZodBoolean) {
    return false;
  }

  if (unwrapped instanceof z.ZodNumber) {
    return 0;
  }

  return '';
};
