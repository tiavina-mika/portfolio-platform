import {
  Stack, type Theme, Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { TextEditorReadOnly } from 'mui-tiptap-editor';
import { useTranslation } from 'react-i18next';

import Layout from '@/components/layouts/Layout';
import { Locale } from '@/types/setting.type';
import { getTranslatedFields } from '@/utils/settings.utils';

const classes = {
  imageContainer: (theme: Theme) => ({
    width: 500,
    height: 300,
    overflow: 'hidden',
    '& > img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    [theme.breakpoints.down('md')]: { width: '100%' },
  }),
  blockTexts: (imagePosition: 'bottom' | 'right' | 'left') => (theme: Theme) => {
    switch (imagePosition) {
      case 'right':
        return { order: -1 };
      case 'left':
        return { order: 1 };
      case 'bottom':
        return {
          marginBottom: 8,
          // the text should be above the image
          order: -1,
        };
      default:
        return { [theme.breakpoints.down('md')]: { order: -1 } };
    }
  },
  block: (imagePosition: 'bottom' | 'right' | 'left') => (theme: Theme) => {
    switch (imagePosition) {
      case 'bottom':
        return {
          flexDirection: 'column' as const,
          display: 'flex',
          marginTop: 16,
          marginBottom: 16,
        };
      default:
        return {
          flexDirection: 'row' as const,
          display: 'flex',
          gap: 40,
          [theme.breakpoints.down('md')]: { flexDirection: 'column' as const },
        };
    }
  },
};

type Props = {
  blocks: any[];
  locale: Locale;
};
const SectionBlocksPreview = ({
  blocks, locale,
}: Props) => {
  const {
    t,
  } = useTranslation(['cms']);

  return (
    <Layout
      actionsEmplacement="content"
      cardTitle={t('cms:blocks')}
      helperText={t('cms:blocksHelper')}
    >
      <Stack spacing={3}>
        {blocks && blocks.length > 0
          ? (
            <Stack css={{ marginTop: 12 }} spacing={8}>
              {blocks.map((block, index) => {
                const values = block.get
                  ? { translated: block.get('translated'), imagePosition: block.get('imagePosition'), image: block.get('image') }
                  : {
                    translated: block.translated,
                    imagePosition: block.imagePosition,
                    image: block.image,
                  };
                const translatedFields = getTranslatedFields(
                  values.translated,
                  ['title', 'description', 'content'],
                  locale
                );

                return (
                  <div
                    css={classes.block(values.imagePosition)}
                    key={index + block.id}
                  >
                    <div className="flex1" css={classes.imageContainer}>
                      {values.image && <img alt="block" css={{ width: '100%' }} src={values.image.url} />}
                    </div>
                    <div className="flexColumn flex1" css={classes.blockTexts(values.imagePosition)}>
                      <Typography variant="h5">{translatedFields.title}</Typography>
                      {translatedFields.description && (
                        <Typography>{translatedFields.description}</Typography>
                      )}
                      <TextEditorReadOnly value={translatedFields.content} />
                    </div>
                  </div>
                );
              })}
            </Stack>
          ) : (
            <Typography css={{ color: grey[600] }}>{t('cms:thereIsNoBlocks')}</Typography>
          )}
      </Stack>
    </Layout>
  );
};

export default SectionBlocksPreview;
