import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'string-ts';

import Layout from '@/components/layouts/Layout';
import { IFileCloud } from '@/types/file.type';
import { PAGE_IMAGES_FIELDS, PAGE_SINGLE_IMAGE_FIELDS } from '@/validations/file.validation';

type Props<T extends Record<string, any>> = {
  page: T;
  fields?: string[];
};

const PreviewImages = <T extends Record<string, any>>({
  page, fields = PAGE_SINGLE_IMAGE_FIELDS,
}: Props<T>) => {
  const {
    t,
  } = useTranslation();

  return (
    <Layout cardTitle={t('common:images')}>
      <div css={{ marginTop: 12 }}>
        <Stack spacing={2}>
          {fields.map((field: string, index: number) => (
            <div key={field + index}>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>{capitalize(t('cms:' + field))}</Typography>
                {page.has(field)
                  ? (
                    <Box sx={{ width: 300 }}>
                      <img alt={field} css={{ width: '100%' }} src={page.get ? page.get(field).url : page[field].url} />
                    </Box>
                  )
                  : (
                    <Typography>{t('common:errors.noField', { field: t('common:' + field) })}</Typography>
                  )}
              </Box>
            </div>
          ))}

          <Stack>
            {PAGE_IMAGES_FIELDS.map((field: string, index: number) => (
              <Stack key={field + index}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>{t('common:otherImages')}</Typography>
                {(page.get ? page.get(field) : page[field])?.length > 0
                  ? (
                    <Stack direction="row" spacing={2}>
                      {(page.get ? page.get(field) : page[field]).map((image: IFileCloud, index: number) => (
                        <Box key={image.url + index}>
                          <Box sx={{ width: 300 }}>
                            <img alt={image.url} css={{ width: '100%' }} src={image.url} />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )
                  : (
                    <Typography>{t('common:errors.noOtherImages')}</Typography>
                  )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </div>
    </Layout>
  );
};

export default PreviewImages;
