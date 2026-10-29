'use client';

/**
 * Hook to handle server actions
 * It handles form submission, validation, and server response
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-hook';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { DefaultValues, FieldValues } from 'react-hook-form';

import env from '@/env';
import { setFormError } from '@/utils/utils';

export type UseServerActionParams<Input, Schema, Action, Bind> = {
  /**
   * initial values for the form if any
   */
  initialValue?: Input;
  /**
   * schema for the form validation
   */
  schema: Schema;
  /**
   * action to be called on form submit (server action)
   */
  // action: ((values: FormData) => Promise<any>) | ((args: Args) => void);
  action: Action;
  /**
   * message to be displayed on successful form submit
   */
  sentMessage?: string;
  /**
   * message to be displayed when the request itself fails (network down, server unreachable)
   */
  failedMessage?: string;
  /**
   * translation key for the form
   */
  translationKey?: any;
  /**
   * action name for the form to be used for recaptcha
   * IMPORTANT: if not provided, recaptcha will not be used and executed
   */
  recaptchaActionName?: string;
  /**
   * bind arguments for the server action
   * ex: [myId, locale]
   */
  bind?: Bind | ((string | number | boolean)[]);
};
export const useServerAction = <
  /**
   * form input values
   */
  Input extends FieldValues,
  /**
   * form schema validation
   * e.g: typeof mySchema
   */
  Schema extends z.Schema<any, any>,
  /**
   * server action with bind or without
   * e.g: typeof myAction
   */
  Action,
  /**
   * list of bind arguments for the server action
   * e.g: [myId, locale]
   * @optional
   */
  Bind = void
>({
  initialValue,
  schema,
  action,
  sentMessage,
  failedMessage,
  translationKey,
  recaptchaActionName,
  bind,
}: UseServerActionParams<Input, Schema, Action, Bind>) => {
  const [sentSuccessMessage, setSentSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // get the google recaptcha token
  const { executeGoogleReCaptcha } = useGoogleReCaptcha(
    env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  );

  const t = useTranslations(translationKey);
  const tForm = useTranslations('Form');

  const form = useForm<Input>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialValue as DefaultValues<Input>,
  });

  // goes back to an empty form after a confirmation or a failure banner
  const reset = () => {
    setSentSuccessMessage('');
    setError('');
  };

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    // a new attempt hides the previous failure banner
    setError('');

    // ------------ 1. recaptcha ------------ //
    let recaptchaToken: string | undefined;

    if (recaptchaActionName) {
      // execute google recaptcha and get the token
      recaptchaToken = await executeGoogleReCaptcha(recaptchaActionName);
    }

    /*
     * ------------ 2. form submission ------------ //
     *
     * The token travels unverified all the way to the API that performs the write, and is checked
     * exactly once, there. Google accepts a v3 token a single time, so an extra "fast feedback"
     * round-trip from here would spend it and leave the real check nothing to validate — and a
     * check made anywhere upstream of the write protects the form, not the data, since a server
     * action and the Parse API are both callable directly.
     */
    const boundArgs = recaptchaActionName
      ? [...(Array.isArray(bind) ? bind : []), recaptchaToken]
      : bind;

    const bindAction = boundArgs && Array.isArray(boundArgs) && boundArgs.length > 0
      ? (action as any).bind(null, ...boundArgs)
      : action;

    let data;

    try {
      data = await bindAction(values);
    } catch (exception) {
      setLoading(false);
      // without a message to show, the failure is not ours to hide
      if (!failedMessage) throw exception;
      setError(failedMessage);
      return;
    }

    if (!data) {
      setLoading(false);
      return;
    }

    // ------- success ------- //
    if (data.data?.success) {
      if (sentMessage) {
        setSentSuccessMessage(sentMessage);
      }
      setError('');
      setLoading(false);
      form.reset(initialValue);
      return;
    }

    /*
     * ------- error ------- //
     * display server error
     */

    if (data.serverError) {
      setError(data.serverError);
      setSentSuccessMessage('');
      setLoading(false);
      return;
    }
    setFormError<Input>(form, data, tForm, t);
    setLoading(false);
  };

  return {
    sentSuccessMessage,
    error,
    loading,
    form,
    onSubmit,
    reset,
  };
};
