import { Button, Stack, type Theme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactInputVerificationCode from 'react-input-verification-code';
import { useSelector } from 'react-redux';


import { getAppErrorSelector } from '@/redux/reducers/app.reducer';
import { VERIFICATION_CODE_LENGTH } from '@/utils/constants';
import { PATH_NAMES } from '@/utils/pathnames';

import AuthLink from './AuthLink';

const classes = {
  verificationCodeContainer: (theme: Theme) => ({
    marginTop: 40,
    width: '100%',
    '& .ReactInputVerificationCode__container': {
      width: '100% !important',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    '& .ReactInputVerificationCode__item': {
      '& input': {
        width: '100%',
        height: '100%',
      },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.up('xl')]: {
        width: '60px !important',
        height: '60px !important',
      },
      [theme.breakpoints.between('sm', 'xl')]: {
        width: '50px !important',
        height: '50px !important',
      },
      [theme.breakpoints.down('sm')]: {
        width: '48px !important',
        height: '48px !important',
      },
    },
  }),
};

type Props = {
  onResendCode?: () => void;
  onCodeChange: (code: string) => void;
};
const CodeConfirmationForm = ({
  onResendCode, onCodeChange,
}: Props) => {
  const {
    t,
  } = useTranslation(['common', 'user']);
  const appError = useSelector(getAppErrorSelector);
  const resendCodeText = t('user:resendCode');

  const [code, setCode] = useState<string>('');

  useEffect(() => {
    // if an error occurred, clear the input
    if (!appError) return;
    setCode('');
  }, [appError]);

  const handleCodeInputChange = (code: string) => {
    if (code.length < VERIFICATION_CODE_LENGTH) return;
    onCodeChange(code);
    setCode(code);
  };

  const handleResendCode = () => {
    if (appError || !onResendCode) return;
    onResendCode();
  };

  return (
    <Stack>
      {appError && (
        <Button color="inherit" onClick={handleResendCode} size="small">
          {resendCodeText}
        </Button>
      )}
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        {/* --------- code input --------- */}
        <div css={classes.verificationCodeContainer}>
          <ReactInputVerificationCode
            /* eslint-disable jsx-a11y/no-autofocus */
            autoFocus
            length={VERIFICATION_CODE_LENGTH}
            onChange={handleCodeInputChange}
            placeholder=""
            value={code} // optional, need this only for clearing the input
          />
        </div>
        {/* --------- links --------- */}
        <Stack spacing={2}>
          {onResendCode && (
            <AuthLink
              label={t('user:codeNotReceivedOrExpired')}
              onClick={handleResendCode}
              text={resendCodeText}
            />
          )}
          <AuthLink
            label={t('common:accountAlreadyVerified')}
            text={t('user:login')}
            url={PATH_NAMES.login}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CodeConfirmationForm;
