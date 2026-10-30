import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box, Chip, Stack, Theme, Typography,
} from '@mui/material';
import { MessageChannelEnum } from '@shared/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Avatar from '@/components/Avatar';
import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import {
  DIALOG_RECIPIENT_AVATAR_SIZE, DIALOG_RECIPIENT_GAP, DIALOG_RECIPIENT_PADDING_X,
  DIALOG_RECIPIENT_PADDING_Y, RADIUS,
} from '@/constants/_core/ui/ui.constants';
import { getAppErrorSelector } from '@/redux/reducers/_core/app.reducer';
import { getUserLoadingSelector } from '@/redux/reducers/_core/user.reducer';
import { ISelectOption } from '@/types/_core/app.type';
import { IUser, SendMessageFormInput, UserMessageTemplateKey } from '@/types/_core/user.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import {
  getFullPhoneNumber, getUserFullName, getUserMessageTemplateKeys,
} from '@/utils/_core/user.utils';
import { sendMessageFormSchema } from '@/validations/_core/email.validations';

const classes = {
  recipient: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: `${DIALOG_RECIPIENT_GAP}px`,
    padding: `${DIALOG_RECIPIENT_PADDING_Y}px ${DIALOG_RECIPIENT_PADDING_X}px`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    border: `1px solid ${getDesignTokens(theme).borderLight}`,
    borderRadius: RADIUS,
  }),
  // the address must not push the strip wider than the dialog when it is a long mailbox
  recipientIdentity: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  },
};

type Props = {
  formId: string;
  user: IUser;
  onSubmit: (input: SendMessageFormInput) => void;
};

/**
 * The one-off message an administrator writes to a single user: which of the two channels it goes
 * out on, and what it says. The recipient is not a field — the strip at the top names the account
 * the dialog was opened on, and the caller is what adds the account's id to the payload.
 */
const SendMessageForm = ({
  formId, user, onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const loading = useSelector(getUserLoadingSelector);
  const appError = useSelector(getAppErrorSelector);

  /*
   * each channel can only go where the account has somewhere to send: a member who signed up by
   * phone has no email, so their dialog opens on the text message and the email stays on the list
   * (its absence would otherwise read as a missing feature) but cannot be picked
   */
  const hasEmail = !!user.email;
  const hasPhoneNumber = !!user.phone?.number;

  const defaultChannel = !hasEmail && hasPhoneNumber ? MessageChannelEnum.SMS : MessageChannelEnum.EMAIL;

  const form = useForm<SendMessageFormInput>({
    resolver: zodResolver(sendMessageFormSchema),
    defaultValues: { channel: defaultChannel },
  });

  const channel = form.watch('channel');
  const isEmailChannel = channel === MessageChannelEnum.EMAIL;

  const channelOptions: ISelectOption<MessageChannelEnum>[] = [
    {
      label: t('user:sendMessage.email'),
      value: MessageChannelEnum.EMAIL,
      disabled: !hasEmail,
    },
    {
      label: t('user:sendMessage.sms'),
      value: MessageChannelEnum.SMS,
      disabled: !hasPhoneNumber,
    },
  ];

  const templateKeys = getUserMessageTemplateKeys(user);

  /*
   * a template is a starting point, not a locked message: it fills both fields and leaves them
   * editable, and validating on the spot clears the errors a failed submit may have left behind
   */
  const handleApplyTemplate = (key: UserMessageTemplateKey) => () => {
    form.setValue('subject', t(`user:sendMessage.templates.${key}.subject`), { shouldValidate: true });
    form.setValue('message', t(`user:sendMessage.templates.${key}.message`), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Form
      error={appError}
      form={form}
      formId={formId}
      loading={loading}
      onSubmit={onSubmit}
    >
      {/* ---------- who the message is going to */}
      <Box css={classes.recipient}>
        <Avatar size={DIALOG_RECIPIENT_AVATAR_SIZE} user={user} />
        <Box css={classes.recipientIdentity}>
          <Typography variant="subtitle2">{getUserFullName(user)}</Typography>
          <Typography noWrap sx={{ color: 'text.secondary' }} variant="body2">
            {isEmailChannel
              ? user.email
              : getFullPhoneNumber(user.phone) || t('user:sendMessage.noPhoneNumber')}
          </Typography>
        </Box>
      </Box>

      {/* ---------- how it is sent */}
      <ToggleButtonsField
        disableDeselect
        label={t('user:sendMessage.channel')}
        name="channel"
        options={channelOptions}
        size="small"
      />

      {/* ---------- ready-made nudges, only the ones this account still has to act on */}
      {templateKeys.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {templateKeys.map((key) => (
            <Chip
              clickable
              key={key}
              label={t(`user:sendMessage.templates.${key}.label`)}
              onClick={handleApplyTemplate(key)}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      {/* ---------- what it says: a text has no subject line, so the field goes with the channel */}
      {isEmailChannel && (
        <TextField
          fixedLabel
          fullWidth
          label={t('subject')}
          name="subject"
          placeholder={t('subject')}
          type="text"
        />
      )}
      <TextField
        fixedLabel
        fullWidth
        multiline
        label={t('message')}
        name="message"
        placeholder={t('user:sendMessage.messagePlaceholder')}
        rows={4}
        type="text"
      />
    </Form>
  );
};

export default SendMessageForm;
