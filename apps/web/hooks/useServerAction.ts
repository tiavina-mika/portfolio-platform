'use client';

/**
 * Hook to handle server actions
 * It handles form submission, validation, and server response
 */

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
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

  const bindAction = bind && Array.isArray(bind) && bind.length > 0
    ? (action as any).bind(null, ...bind)
    : action;

  const onSubmit = async (values: FormData) => {
    setLoading(true);

    // ------------ 1. recaptcha ------------ //
    if (recaptchaActionName) {
      // execute google recaptcha and get the token
      const token = await executeGoogleReCaptcha(recaptchaActionName);

      // send the token to the server for verification
      const response = await axios.post(
        '/api/recaptcha-verification',
        { token },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      // check if the recaptcha verification was successful
      if (!response.data.success) {
        setError(tForm('somethingWentWrong'));
        setLoading(false);
        return;
      }
    }

    // ------------ 2. form submission ------------ //


    const data = await bindAction(values);

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
  };
};
