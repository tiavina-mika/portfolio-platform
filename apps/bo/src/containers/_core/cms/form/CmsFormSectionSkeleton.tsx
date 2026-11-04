import {
  Card, CardContent, CardHeader, CircularProgress, Skeleton, Typography,
} from '@mui/material';

import {
  FORM_WORKBENCH_SKELETON_FIELD_GAP, FORM_WORKBENCH_SKELETON_FIELDS, FORM_WORKBENCH_SKELETON_FIELDS_GAP,
  FORM_WORKBENCH_SKELETON_HELPER_HEIGHT, FORM_WORKBENCH_SKELETON_LABEL_HEIGHT,
  FORM_WORKBENCH_SKELETON_SPINNER_GAP, FORM_WORKBENCH_SKELETON_SPINNER_SIZE,
  FORM_WORKBENCH_SKELETON_TITLE_HEIGHT, FORM_WORKBENCH_SKELETON_TITLE_WIDTH,
} from '@/constants/_core/ui.constants';

const classes = {
  // the one sentence of the card: what is being waited for, next to the spinner saying it is moving
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: `${FORM_WORKBENCH_SKELETON_SPINNER_GAP}px`,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_SKELETON_FIELDS_GAP}px`,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${FORM_WORKBENCH_SKELETON_FIELD_GAP}px`,
  },
};

/**
 * The section card while the record is read into the form: the card's own head, and four fields of
 * the sizes a section really holds — two single lines, a short text, the editor — so nothing jumps
 * once the values land.
 */
type Props = {
  /** what is being waited for, ex: "Loading the page…" */
  label: string;
};

const CmsFormSectionSkeleton = ({ label }: Props) => {
  return (
    <Card aria-busy="true">
      <CardHeader
        action={(
          <span css={classes.status}>
            <CircularProgress size={FORM_WORKBENCH_SKELETON_SPINNER_SIZE} />
            <Typography color="text.secondary" component="span" variant="body2">
              {label}
            </Typography>
          </span>
        )}
        title={(
          <Skeleton
            height={FORM_WORKBENCH_SKELETON_TITLE_HEIGHT}
            variant="rounded"
            width={FORM_WORKBENCH_SKELETON_TITLE_WIDTH}
          />
        )}
      />
      <CardContent css={classes.fields}>
        {FORM_WORKBENCH_SKELETON_FIELDS.map((field, index) => (
          <div css={classes.field} key={index}>
            <Skeleton height={FORM_WORKBENCH_SKELETON_LABEL_HEIGHT} variant="rounded" width={field.labelWidth} />
            <Skeleton height={field.fieldHeight} variant="rounded" width="100%" />
            <Skeleton height={FORM_WORKBENCH_SKELETON_HELPER_HEIGHT} variant="rounded" width={field.helperWidth} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CmsFormSectionSkeleton;
