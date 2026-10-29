import { useTheme } from '@mui/material';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

type Props = {
  value: boolean;
};
const BooleanIcons = ({
  value,
}: Props) => {
  const theme = useTheme();

  if (value) {
    return <FaCircleCheck color={theme.palette.success.main} size={22} />;
  }

  return <FaCircleXmark color={theme.palette.error.main} size={22} />;
};

export default BooleanIcons;
