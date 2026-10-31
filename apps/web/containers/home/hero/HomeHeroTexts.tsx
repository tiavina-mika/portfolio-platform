import ReadOnlyTextCodeEditor from '@/containers/articles/ReadOnlyTextCodeEditor';

type Props = {
  /**
   * Rich text from the database (the app settings)
   */
  description?: string;
};

const HomeHeroTexts = ({ description }: Props) => {
  if (!description) return null;

  /*
   * the editor is shared with the articles: only the hero paragraphs get a larger size. The stored
   * text carries inline font sizes on its spans (pasted from elsewhere): the spans inherit the
   * paragraph size with !important, as a class cannot beat an inline style otherwise
   */
  return (
    <div className={`
      [&_p]:text-xl
      [&_p]:leading-loose!
      [&_p_*]:text-[length:inherit]!
      [&_p_*]:leading-[inherit]!
    `}
    >
      <ReadOnlyTextCodeEditor content={description} />
    </div>
  );
};

export default HomeHeroTexts;
