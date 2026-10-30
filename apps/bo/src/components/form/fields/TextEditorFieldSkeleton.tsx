import { Skeleton, Stack } from '@mui/material';

const TOOLBAR_BUTTONS_COUNT = 8;

const TextEditorFieldSkeleton = () => {
  return (
    <Stack spacing={1}>
      <Skeleton height={20} variant="text" width="20%" />
      <Stack direction="row" spacing={1}>
        {Array.from({ length: TOOLBAR_BUTTONS_COUNT }).map((_, index) => (
          <Skeleton
            height={28}
            key={index}
            variant="rounded"
            width={28}
          />
        ))}
      </Stack>
      <Skeleton height={160} variant="rounded" />
    </Stack>
  );
};

export default TextEditorFieldSkeleton;
