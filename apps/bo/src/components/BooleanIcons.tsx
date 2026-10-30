import { useTheme } from '@mui/material';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

type Props = {
  value: boolean;
  size?: number;
};
const BooleanIcons = ({
  value,
  size = 22,
}: Props) => {
  const theme = useTheme();

  if (value) {
    return <FaCircleCheck color={theme.palette.success.main} size={size} />;
  }

  return <FaCircleXmark color={theme.palette.error.main} size={size} />;
};

export default BooleanIcons;
