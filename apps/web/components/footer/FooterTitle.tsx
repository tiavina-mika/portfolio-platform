import Title from '../typography/Title';

type Props = {
  text: string;
};
const FooterTitle = ({ text }: Props) => {
  return (
    <Title className="text-lg! font-semibold" level={3}>
      {text}
    </Title>
  );
};

export default FooterTitle;
