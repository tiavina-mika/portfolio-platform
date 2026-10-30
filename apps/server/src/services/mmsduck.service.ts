import { create, type AxiosError, type AxiosInstance } from 'axios';

import type { ISendSmsResponse, SmsProviderInput, SmsProviderResult } from '@/types/sms.type';

import { SMS_INSUFFICIENT_CREDITS_CODE } from '@/constants/_core/constants';
import { logger } from '@/utils/_core/logger';

const MMSDUCK_BASE_URL = 'https://api.mmsduck.com';

// a provider that never answers must not hold a sign-up (the code SMS is awaited there) for ever
const MMSDUCK_TIMEOUT_MS = 10_000;

type MmsDuckErrorBody = { error?: { code?: string; message?: string } };

// ─── Singleton client ────────────────────────────────────────────────────────

let _client: AxiosInstance | null = null;

const getMmsDuckClient = (): AxiosInstance => {
  if (!_client) {
    _client = create({
      baseURL: MMSDUCK_BASE_URL,
      timeout: MMSDUCK_TIMEOUT_MS,
      headers: { Authorization: `Bearer ${process.env.MMSDUCK_API_KEY ?? ''}` },
    });
  }
  return _client;
};

// ─── Provider ───────────────────────────────────────────────────────────────

/**
 * Texts a number through MMSDuck, which takes it as national digits, with no dial code — which is
 * why it can only serve one country, Madagascar. Every SMS costs real credits in both its sandbox
 * and production environments (no free tier, unlike Brevo).
 *
 * A refusal comes back with MMSDuck's own code and message rather than as a bare `undefined`: a
 * notification records them on the recipient the SMS failed for, and "unreachable number" and "no
 * credit left" call for two different reactions.
 */
export const sendWithMmsDuck = async ({
  nationalNumber, message,
}: SmsProviderInput): Promise<SmsProviderResult> => {
  try {
    const client = getMmsDuckClient();
    const { data } = await client.post<NonNullable<ISendSmsResponse>>(
      '/api/v1/sms/send',
      { to: nationalNumber, message }
    );

    logger.info('sendSms success:', JSON.stringify(data));

    // an answer that is not a success names its own state, the closest thing to a reason it gives
    return data?.success
      ? { data }
      : { data, errorCode: data?.status };
  }
  catch (error: unknown) {
    const apiError = (error as AxiosError<MmsDuckErrorBody>).response?.data?.error;

    logger.warn('sendSms failed — code:', apiError?.code);

    return {
      errorCode: apiError?.code ?? (error as AxiosError).code,
      errorMessage: apiError?.message ?? (error as Error).message,
      // the provider answers 402 with this code: every text is refused until the account is topped up
      isOutOfCredit: apiError?.code === SMS_INSUFFICIENT_CREDITS_CODE,
    };
  }
};
