import NextIcon from '@/components/NextIcon';
import TextLink from '@/components/typography/TextLink';
import { IProjectUrl } from '@/types/project.type';

type Props = {
  links: IProjectUrl[];
  icon?: string;
  iconSize?: number;
};
const ProjectLinks = ({
  links,
  icon = '/icons/link.svg',
  iconSize = 18,
}: Props) => {
  return (
    <div className={`
      flex flex-col
      lg:gap-1
    `}
    >
      {links.map((link: IProjectUrl, index: number) => (
        <div
          key={link.url + index}
          className={`
            flex flex-row items-center gap-2
            md:gap-2
          `}
        >
          <div className="flex size-[28px] flex-col items-center justify-center">
            <NextIcon size={iconSize} src={icon} />
          </div>
          <TextLink className="max-md:text-base" href={link.url}>
            {link.url}
          </TextLink>
        </div>
      ))}
    </div>
  );
};

export default ProjectLinks;
