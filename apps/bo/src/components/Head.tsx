import { Helmet } from 'react-helmet-async';

import { formatPageTitle } from '@/utils/utils';

type Props = {
  title?: string;
  description?: string;
};

const Head = ({
  title, description,
}: Props) => {
  const formattedTitle = formatPageTitle(title!);

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta content={description} property="description" />
    </Helmet>
  );
};

export default Head;
