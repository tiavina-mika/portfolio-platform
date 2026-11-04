import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';

type Props = {
  published: boolean;
};

/**
 * Whether a piece of content is live on the public site, stated next to its name at the top of its
 * detail page. It is the one fact about the content that changes what every other block on the
 * page means, so it is read before them rather than found in a block of its own further down.
 */
const PublishedChip = ({ published }: Props) => {
  const {
    t,
  } = useTranslation(['cms']);

  return (
    <Chip
      size="small"
      color={published
        ? 'success'
        : 'default'}
      label={published
        ? t('cms:published')
        : t('cms:notPublished')}
    />
  );
};

export default PublishedChip;
