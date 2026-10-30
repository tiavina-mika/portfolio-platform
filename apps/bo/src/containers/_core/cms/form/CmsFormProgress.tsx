import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import IconPopover from '@/components/IconPopover';
import { FORM_WORKBENCH_PROGRESS_GAP } from '@/constants/_core/ui.constants';

const classes = {
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_PROGRESS_GAP}px`,
    minWidth: 0,
  },
};

type Props = {
  filled: number;
  total: number;
  /** the sentence saying which fields are actually required — it depends on the record being written */
  helper: string;
  className?: string;
};

/**
 * How much of the whole form is filled in, with the one sentence that keeps the summary rail from
 * being read as a wizard: the sections can be filled in any order, and only a few French fields
 * are actually required.
 */
const CmsFormProgress = ({
  filled, total, helper, className,
}: Props) => {
  const {
    t,
  } = useTranslation('cms');

  return (
    <div className={className} css={classes.root}>
      <Typography noWrap variant="body2">
        {t('cms:cmsForm.filledFields', { filled, total })}
      </Typography>
      <IconPopover message={helper} />
    </div>
  );
};

export default CmsFormProgress;
