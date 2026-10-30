import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';

type Props = {
  /**
   * Rich text from the database (the app settings)
   */
  description?: string;
};

const HomeHeroTexts = ({ description }: Props) => {
  if (!description) return null;

  return <ReadOnlyTextCodeEditor content={description} />;
};

export default HomeHeroTexts;
