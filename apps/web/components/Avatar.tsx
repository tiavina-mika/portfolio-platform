import Image from 'next/image';

import {
  getUserFullName,
  getUserFullNameAbbreviation,
} from '@/utils/user.utils';

import Text from './typography/Text';

type Props = {
  user: Parse.User;
};
const Avatar = ({ user }: Props) => {
  if (!user.get('image')) {
    return (
      <div className={`
        flex size-[24px] flex-row items-center justify-center rounded-[50%] bg-blue-200
        md:size-[40px]
      `}
      >
        <Text className={`
          font-medium uppercase
          max-md:!text-xs
        `}
        >
          {getUserFullNameAbbreviation(user)}
        </Text>
      </div>
    );
  }
  return (
    <div className={`
      flex size-[24px] flex-row items-center justify-center rounded-[50%] bg-blue-200
      md:size-[40px]
    `}
    >
      <Image
        alt={getUserFullName(user)}
        height={40}
        src={user.get('image').url}
        width={40}
      />
    </div>
  );
};

export default Avatar;
