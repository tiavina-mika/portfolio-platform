import {
  Button, Stack, Theme, Typography,
} from '@mui/material';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ReactInputVerificationCode from 'react-input-verification-code';
import { useSelector } from 'react-redux';


import {
  AUTH_OTP_CELL_FONT_SIZE,
  AUTH_OTP_CELL_GAP,
  AUTH_OTP_CELL_GAP_MOBILE,
  AUTH_OTP_CELL_SIZE,
  AUTH_OTP_CELL_SIZE_MOBILE,
} from '@/constants/_core/ui/ui.constants';
import { VERIFICATION_CODE_LENGTH } from '@/constants/_core/user.constants';
import AuthLink from '@/containers/_core/auth/AuthLink';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { PATH_NAMES } from '@/utils/_core/pathnames';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';


const RESEND_COOLDOWN_SECONDS = 60;

const classes = {
  verificationCodeContainer: (hasError: boolean) => (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      width: '100%',
      '& .ReactInputVerificationCode__container': {
        width: '100% !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: AUTH_OTP_CELL_GAP,
        [theme.breakpoints.down('sm')]: { gap: AUTH_OTP_CELL_GAP_MOBILE },
      },
      '& .ReactInputVerificationCode__item': {
        '& input': {
          width: '100%',
          height: '100%',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: AUTH_OTP_CELL_FONT_SIZE,
        fontWeight: 600,
        boxShadow: `inset 0 0 0 1px ${hasError ? theme.palette.error.main : tokens.borderInput} !important`,
        width: `${AUTH_OTP_CELL_SIZE}px !important`,
        height: `${AUTH_OTP_CELL_SIZE}px !important`,
        [theme.breakpoints.down('sm')]: {
          width: `${AUTH_OTP_CELL_SIZE_MOBILE}px !important`,
          height: `${AUTH_OTP_CELL_SIZE_MOBILE}px !important`,
        },
      },
      '& .ReactInputVerificationCode__item.is-active': {
        boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main} !important`,
      },
    };
  },
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

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string>('');

  /*
   * the library renders each digit as a `role="button"` div with no name and offers no prop to give
   * one: it is named here, after every render, so a screen reader announces which digit it is on
   */
  useEffect(() => {
    codeContainerRef.current
      ?.querySelectorAll('.ReactInputVerificationCode__item')
      .forEach((item, index) => {
        item.setAttribute(
          'aria-label',
          t('user:codeDigit', { position: index + 1, total: VERIFICATION_CODE_LENGTH })
        );
      });
  });
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    // if an error occurred, clear the input
    if (!appError) return;
    setCode('');
  }, [appError]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((seconds) => seconds - 1), 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCodeInputChange = (code: string) => {
    if (code.length < VERIFICATION_CODE_LENGTH) return;
    onCodeChange(code);
    setCode(code);
  };

  const handleResendCode = useCallback(() => {
    if (appError || !onResendCode || cooldown > 0) return;
    onResendCode();
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, [appError, onResendCode, cooldown]);

  return (
    <Stack>
      {appError && (
        <Button
          color="inherit"
          disabled={cooldown > 0}
          onClick={handleResendCode}
          size="small"
        >
          {cooldown > 0 ? t('user:resendCodeCountdown', { seconds: cooldown }) : resendCodeText}
        </Button>
      )}
      <Stack
        spacing={3}
        sx={{
          alignItems: 'center',
        }}
      >
        {/* --------- code input --------- */}
        <div css={classes.verificationCodeContainer(!!appError)} ref={codeContainerRef}>
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
            cooldown > 0 ? (
              <Typography
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {t('user:codeNotReceivedOrExpired')}&nbsp;{t('user:resendCodeCountdown', { seconds: cooldown })}
              </Typography>
            ) : (
              <AuthLink
                label={t('user:codeNotReceivedOrExpired')}
                onClick={handleResendCode}
                text={resendCodeText}
              />
            )
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
