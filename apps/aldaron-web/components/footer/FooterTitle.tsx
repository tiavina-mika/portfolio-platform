import Title from '../typography/Title';

type Props = {
  text: string;
};

/**
 * The title of a footer column. The footer sits under the page h1, so h2 avoids skipping a level.
 */
const FooterTitle = ({ text }: Props) => {
  return (
    <Title className="text-lg! font-semibold" level={2}>
      {text}
    </Title>
  );
};

export default FooterTitle;
