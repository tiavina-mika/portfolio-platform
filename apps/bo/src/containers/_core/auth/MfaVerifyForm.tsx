import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { MFA_TOTP_CODE_PATTERN } from '@/constants/_core/auth.constants';
import { IMfaCodeInput } from '@/types/_core/auth.type';
import { mfaCodeSchema } from '@/validations/_core/auth.validations';

type Props = {
  onSubmit: (values: IMfaCodeInput) => void;
  loading?: boolean;
  error?: string;
  primaryButtonText?: string;
  formId?: string;

  /**
   * Submit as soon as a full 6-digit TOTP code is typed or pasted, without waiting for a click.
   * Opt-in, and meant for the login gate only: there the submit is idempotent and the code is the
   * single thing the screen asks for. Leave it off wherever the submit performs an irreversible
   * action the user must deliberately confirm (disabling MFA, regenerating backup codes).
   * @default false
   */
  autoSubmit?: boolean;
};

/**
 * Reused for both the post-password login gate (a fresh MfaVerify page/route) and any in-app
 * action that requires re-confirming the second factor (disableMfa, regenerateMfaBackupCodes) —
 * accepts a TOTP code or a backup code, same as the server side (verifyMfaLoginService /
 * disableMfaService both try TOTP first, then fall back to a backup code).
 */
const MfaVerifyForm = ({
  onSubmit, loading, error, primaryButtonText, formId, autoSubmit = false,
}: Props) => {
  const {
    t,
  } = useTranslation(['user']);

  const form = useForm<IMfaCodeInput>({ resolver: zodResolver(mfaCodeSchema) });

  const code = form.watch('code');
  const autoSubmittedCodeRef = useRef<string | undefined>(undefined);

  /*
   * one submit per distinct code value: a wrong code counts towards the 5 failed attempts that
   * lock the account for good, so re-running this effect (a parent re-render, the request coming
   * back with an error) must never resend a value already sent. Correcting a digit produces a new
   * value and is allowed through again.
   */
  useEffect(() => {
    if (!autoSubmit || loading) return;
    if (!MFA_TOTP_CODE_PATTERN.test(code ?? '')) return;
    if (autoSubmittedCodeRef.current === code) return;

    autoSubmittedCodeRef.current = code;
    form.handleSubmit(onSubmit)();
  }, [autoSubmit, code, form, loading, onSubmit]);

  return (
    <Form
      error={error}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
      primaryButtonText={primaryButtonText ?? t('user:mfa.verify')}
    >
      <TextField
        /*
         * the MFA screen exists only to collect this code — focusing it on mount saves the extra
         * tap and matches how authenticator apps hand the code over
         */
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        fixedLabel
        fullWidth
        // lets a password manager fill the TOTP code straight into the field
        autoComplete="one-time-code"
        helperText={t('user:mfa.verifyHelperText')}
        label={t('user:mfa.code')}
        name="code"
        placeholder="123456"
      />
    </Form>
  );
};

export default MfaVerifyForm;
