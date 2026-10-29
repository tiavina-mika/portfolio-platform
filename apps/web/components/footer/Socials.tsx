import Image from 'next/image';

import { cn } from '@/utils/app.utils';
import { APP_NAME, SOCIALS } from '@/utils/constants';

type Props = {
  className?: string;
};

const Socials = ({ className }: Props) => {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-center gap-2 self-stretch',
        className
      )}
    >
      {SOCIALS.map((social, index) => (
        <a key={index} href={social.value}>
          <div className="flex size-[42px] flex-row items-center justify-center rounded-sm bg-default">
            {/* light */}
            <Image
              alt={`${APP_NAME} ${social.label}`}
              height="24"
              src={`/icons/${social.label}.svg`}
              width="24"
              className={`
                block w-[24px]
                dark:hidden
              `}
            />
            {/* dark */}
            <Image
              alt={`${APP_NAME} ${social.label}`}
              height="24"
              src={`/icons/${social.label}-dark.svg`}
              width="24"
              className={`
                hidden w-[24px]
                dark:block
              `}
            />
          </div>
        </a>
      ))}
    </div>
  );
};

export default Socials;
