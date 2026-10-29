import { LinearProgress } from '@mui/material';

type Props = {
  loading: boolean;
};
const Loading = ({
  loading,
}: Props) => {
  return loading
    ? <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, width: '100%', height: 6, zIndex: 2000 }} />
    : null;
};

export default Loading;
