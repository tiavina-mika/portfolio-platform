import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert, Box, Button, Chip, Stack, Typography, type Theme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import SelectField from '@/components/form/fields/SelectField';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import TranslationTabs from '@/components/form/translated/TranslationTabs';
import {
  BROADCAST_BODY_MAX_LENGTH, BROADCAST_LOCALES, BROADCAST_TITLE_MAX_LENGTH,
  broadcastSegmentOptions,
} from '@/constants/_core/notification.constants';
import {
  BROADCAST_AUDIENCE_GAP, BROADCAST_BREAKPOINT, BROADCAST_FIELDS_GAP, BROADCAST_FORM_ID,
  BROADCAST_FIELDS_MAX_WIDTH, BROADCAST_MESSAGE_ROWS, BROADCAST_SIDE_WIDTH,
} from '@/constants/_core/ui/broadcast.constants';
import { CONTENT_GAP } from '@/constants/_core/ui/page.constants';
import { BroadcastFormInput, BroadcastSegment, BroadcastSegmentEnum } from '@/types/_core/notification.type';
import { Locale } from '@/types/_core/setting.type';
import { broadcastSchema } from '@/validations/_core/notification.validations';

import BroadcastPreview from './BroadcastPreview';

const classes = {
  // one column of cards; from the breakpoint up the preview takes a rail beside the two form cards
  grid: (theme: Theme) => ({
    display: 'grid',
    alignItems: 'start',
    gap: `${CONTENT_GAP}px`,
    gridTemplateColumns: 'minmax(0, 1fr)',
    [theme.breakpoints.up(BROADCAST_BREAKPOINT)]: {
      gridTemplateColumns: `minmax(0, 1fr) ${BROADCAST_SIDE_WIDTH}px`,
    },
  }),
  preview: (theme: Theme) => ({
    [theme.breakpoints.up(BROADCAST_BREAKPOINT)]: { gridColumn: 2, gridRow: '1 / span 2' },
  }),
  recipients: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BROADCAST_FIELDS_GAP}px`,
    maxWidth: BROADCAST_FIELDS_MAX_WIDTH,
  },
  audience: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: `${BROADCAST_AUDIENCE_GAP}px`,
  },
  // the title and the message take the whole width of the language block
  fields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BROADCAST_FIELDS_GAP}px`,
    width: '100%',
  },
  message: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BROADCAST_FIELDS_GAP}px`,
  },
  // the send closes the card on its right edge, and takes the whole width on a phone
  actions: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: { '& > *': { flex: 1 } },
  }),
};

const EMPTY_TRANSLATIONS = Object.fromEntries(BROADCAST_LOCALES.map((locale) => [locale, '']));

const DEFAULT_VALUES: BroadcastFormInput = {
  segment: BroadcastSegmentEnum.ALL,
  city: '',
  title: { ...EMPTY_TRANSLATIONS },
  body: { ...EMPTY_TRANSLATIONS },
};

type Props = {
  /**
   * How many members the current audience holds, as the server counted it — `null` while it has not
   * been counted, or once the audience was edited. Nothing can be sent until it is a number: the
   * count is what the operator confirms and what the server checks the send against.
   */
  audienceCount: number | null;
  loading?: boolean;
  onCheckAudience: (audience: { segment: BroadcastSegment; city?: string }) => void;
  /** clears the counted audience — called as soon as the segment or the city is edited */
  onAudienceChange: () => void;
  /** hands the written announcement over; the page is what asks for the final confirmation */
  onSubmit: (values: BroadcastFormInput) => void;
};

/**
 * Where an operator writes an announcement: who it goes to, what it says in each language, and how
 * it will read — three cards of one form.
 *
 * The send is deliberately two steps, and both of them live in what the form considers valid. The
 * audience has to be counted before anything can be submitted, and editing it throws the count away
 * — so "confirm 200 recipients, send to 40 000" cannot happen through a field changed after the
 * check. The second step, the confirmation itself, belongs to the page: this form only hands over a
 * message it considers complete.
 */
const BroadcastForm = ({
  audienceCount, loading, onCheckAudience, onAudienceChange, onSubmit,
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [tab, setTab] = useState<Locale>(BROADCAST_LOCALES[0] as Locale);

  const form = useForm<BroadcastFormInput>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
    resolver: zodResolver(broadcastSchema) as any,
  });
  const {
    control, getValues, setValue, formState: { isValid },
  } = form;
  const segment = useWatch({ control, name: 'segment' });
  const city = useWatch({ control, name: 'city' });
  const title = useWatch({ control, name: 'title' });
  const body = useWatch({ control, name: 'body' });
  const isCitySegment = segment === BroadcastSegmentEnum.CITY;

  /*
   * the counted audience describes the segment and the city as they were when it was counted, so
   * touching either of them makes it a figure about a different send
   */
  useEffect(() => {
    onAudienceChange();
  }, [segment, city, onAudienceChange]);

  /*
   * the count is a field of the form rather than a flag beside it: the schema requires it, so an
   * uncounted (or invalidated) audience is simply a form that cannot be submitted, through the same
   * mechanism as an empty translation
   */
  useEffect(() => {
    setValue('expectedRecipientCount', audienceCount ?? undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [audienceCount, setValue]);

  /** the languages still empty, so the strip shows at a glance what would stop the send */
  const missingLocales = BROADCAST_LOCALES.filter((locale) => (
    !title?.[locale]?.trim() || !body?.[locale]?.trim()
  ));

  const handleCheckAudience = useCallback(() => {
    const values = getValues();

    onCheckAudience({ segment: values.segment, city: values.city });
  }, [getValues, onCheckAudience]);

  return (
    <Form
      form={form}
      formId={BROADCAST_FORM_ID}
      onSubmit={onSubmit}
    >
      <Box css={classes.grid}>
        <CardFormBlock title={t('user:notifications.broadcast.segment')}>
          <Box css={classes.recipients}>
            <SelectField
              label={t('user:notifications.broadcast.segment')}
              name="segment"
              options={broadcastSegmentOptions}
            />
            {isCitySegment && (
              <TextField
                helperText={t('user:notifications.broadcast.cityHelper')}
                label={t('user:notifications.broadcast.city')}
                name="city"
              />
            )}
            <Box css={classes.audience}>
              <Button
                disabled={loading || (isCitySegment && !city?.trim())}
                onClick={handleCheckAudience}
                variant="outlined"
              >
                {t('user:notifications.broadcast.checkAudience')}
              </Button>
              {audienceCount === null
                ? (
                  <Typography color="text.secondary" variant="body2">
                    {t('user:notifications.broadcast.audienceUnknown')}
                  </Typography>
                )
                : (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography color="text.secondary" variant="body2">
                      {t('user:notifications.broadcast.audience')}
                    </Typography>
                    <Chip
                      color="primary"
                      label={t('user:notifications.broadcast.audienceCount', { count: audienceCount })}
                      variant="outlined"
                    />
                  </Stack>
                )}
            </Box>
          </Box>
        </CardFormBlock>

        <CardFormBlock title={t('user:notifications.broadcast.messageBody')}>
          <Box css={classes.message}>
            <TranslationTabs
              missingLocales={missingLocales}
              onTabChange={setTab}
              tab={tab}
            >
              <Box css={classes.fields}>
                <TextField
                  fullWidth
                  helperText={`${title?.[tab]?.length ?? 0} / ${BROADCAST_TITLE_MAX_LENGTH}`}
                  label={t('user:notifications.broadcast.messageTitle')}
                  name={`title.${tab}`}
                  slotProps={{ htmlInput: { maxLength: BROADCAST_TITLE_MAX_LENGTH } }}
                />
                <TextField
                  fullWidth
                  multiline
                  helperText={`${body?.[tab]?.length ?? 0} / ${BROADCAST_BODY_MAX_LENGTH}`}
                  label={t('user:notifications.broadcast.messageBody')}
                  name={`body.${tab}`}
                  rows={BROADCAST_MESSAGE_ROWS}
                  slotProps={{ htmlInput: { maxLength: BROADCAST_BODY_MAX_LENGTH } }}
                />
              </Box>
            </TranslationTabs>

            <Alert severity="warning">{t('user:notifications.broadcast.subtitle')}</Alert>

            <Box css={classes.actions}>
              <Button
                disabled={!isValid}
                loading={loading}
                type="submit"
                variant="contained"
              >
                {t('user:notifications.broadcast.send')}
              </Button>
            </Box>
          </Box>
        </CardFormBlock>

        <Box css={classes.preview}>
          <BroadcastPreview body={body?.[tab] ?? ''} title={title?.[tab] ?? ''} />
        </Box>
      </Box>
    </Form>
  );
};

export default BroadcastForm;
