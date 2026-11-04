import {
  Box, Button, Stack, Typography,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCopy, FiXCircle } from 'react-icons/fi';

import { ImpersonationSession } from '@/types/_core/impersonation.type';
import { displayDate } from '@/utils/_core/date.utils';
import { buildImpersonationDeepLink } from '@/utils/_core/impersonation.utils';

type Props = {
  session: ImpersonationSession;
  userFullName: string;
  onEndSession: () => void;
};

/**
 * What the support agent gets once a session is open: a one-shot deep link into the mobile app,
 * as a QR code to scan from the phone that will run the session, plus the raw link for a device
 * that cannot scan. The link is shown once — it is never stored anywhere the agent can go back to.
 */
const ImpersonationSessionPanel = ({ session, userFullName, onEndSession }: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [isCopied, setIsCopied] = useState(false);
  const deepLink = buildImpersonationDeepLink(session);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(deepLink);
    setIsCopied(true);
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body2">
        {t('user:impersonation.scanHelper', { name: userFullName })}
      </Typography>

      <Box sx={{ alignSelf: 'center', bgcolor: 'common.white', p: 2, borderRadius: 1 }}>
        <QRCodeSVG size={192} value={deepLink} />
      </Box>

      <Typography color="text.secondary" variant="caption">
        {t('user:impersonation.expiresAt', { date: displayDate(session.expiresAt, true) })}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ wordBreak: 'break-all' }}
        variant="caption"
      >
        {deepLink}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button onClick={handleCopy} startIcon={<FiCopy />} variant="outlined">
          {isCopied ? t('user:impersonation.linkCopied') : t('user:impersonation.copyLink')}
        </Button>
        <Button
          color="error"
          onClick={onEndSession}
          startIcon={<FiXCircle />}
          variant="outlined"
        >
          {t('user:impersonation.endSession')}
        </Button>
      </Stack>
    </Stack>
  );
};

export default ImpersonationSessionPanel;
