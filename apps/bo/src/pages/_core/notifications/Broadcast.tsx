import {
  Checkbox, FormControlLabel, Stack, Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@/components/Dialog';
import Head from '@/components/Head';
import Layout from '@/components/layouts/Layout';
import { CONTENT_GAP } from '@/constants/_core/ui/page.constants';
import BroadcastForm from '@/containers/_core/notification/BroadcastForm';
import BroadcastHistory from '@/containers/_core/notification/BroadcastHistory';
import {
  clearNotificationBroadcastAudience, loadNotificationBroadcastAudience, sendNotificationBroadcast,
} from '@/redux/actions/_core/notification.action';
import { getAppLoadingSelector } from '@/redux/reducers/_core/app.reducer';
import {
  getNotificationBroadcastAudienceCountSelector, getNotificationBroadcastHistorySelector,
} from '@/redux/reducers/_core/notification.reducer';
import { BroadcastFormInput, BroadcastSegment, BroadcastSegmentEnum } from '@/types/_core/notification.type';

/**
 * The one page an announcement is sent from: a message written in every language, addressed to every
 * member or to the members of one city, with the announcements already sent listed under it.
 *
 * Nothing here can be undone, so the send is guarded three times over and only one of the three is
 * on this screen. The back-office right is checked by the server, the counted audience is checked
 * against the audience at send time by the server too, and this page adds the last one: a dialog
 * that states how many people are about to be written to and asks the operator to say, in so many
 * words, that they have re-read the message and the recipients.
 */
const Broadcast = () => {
  const { t } = useTranslation(['common', 'user']);
  const dispatch = useDispatch();
  const loading = useSelector(getAppLoadingSelector);
  const audienceCount = useSelector(getNotificationBroadcastAudienceCountSelector);
  const history = useSelector(getNotificationBroadcastHistorySelector);

  /** the announcement waiting on the confirmation — `null` while nothing is pending */
  const [pendingBroadcast, setPendingBroadcast] = useState<BroadcastFormInput | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);

  const handleCheckAudience = useCallback(
    (audience: { segment: BroadcastSegment; city?: string }) => {
      dispatch(loadNotificationBroadcastAudience(audience));
    },
    [dispatch]
  );

  const handleAudienceChange = useCallback(() => {
    dispatch(clearNotificationBroadcastAudience());
  }, [dispatch]);

  const closeConfirmation = useCallback(() => {
    setPendingBroadcast(null);
    setIsReviewed(false);
  }, []);

  const handleSubmit = useCallback((values: BroadcastFormInput) => {
    setIsReviewed(false);
    setPendingBroadcast(values);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pendingBroadcast?.expectedRecipientCount && pendingBroadcast?.expectedRecipientCount !== 0) {
      return;
    }

    const {
      segment, city, title, body, expectedRecipientCount,
    } = pendingBroadcast;

    dispatch(sendNotificationBroadcast(
      {
        segment,
        title,
        body,
        expectedRecipientCount,
        ...(segment === BroadcastSegmentEnum.CITY && city ? { city } : {}),
      },
      closeConfirmation
    ));
  }, [dispatch, pendingBroadcast, closeConfirmation]);

  return (
    <Layout
      isCard={false}
      title={t('user:notifications.broadcast.title')}
    >
      <Head title={t('user:notifications.broadcast.title')} />
      <Stack spacing={`${CONTENT_GAP}px`}>
        <BroadcastForm
          audienceCount={audienceCount}
          loading={loading}
          onAudienceChange={handleAudienceChange}
          onCheckAudience={handleCheckAudience}
          onSubmit={handleSubmit}
        />
        <BroadcastHistory entries={history} loading={loading} />
      </Stack>

      <Dialog
        buttonColor="error"
        loading={loading}
        onPrimaryButtonAction={handleConfirm}
        open={!!pendingBroadcast}
        // the confirmation is only a confirmation once the operator has said they re-read it
        primaryButtonDisabled={!isReviewed}
        primaryButtonText={t('user:notifications.broadcast.confirmAction')}
        title={t('user:notifications.broadcast.confirmTitle')}
        toggle={closeConfirmation}
      >
        <Stack spacing={2}>
          <Typography>
            {t('user:notifications.broadcast.confirmDescription', {
              count: pendingBroadcast?.expectedRecipientCount ?? 0,
            })}
          </Typography>
          <FormControlLabel
            label={t('user:notifications.broadcast.confirmCheckbox')}
            control={(
              <Checkbox
                checked={isReviewed}
                onChange={(event) => setIsReviewed(event.target.checked)}
              />
            )}
          />
        </Stack>
      </Dialog>
    </Layout>
  );
};

export default Broadcast;
