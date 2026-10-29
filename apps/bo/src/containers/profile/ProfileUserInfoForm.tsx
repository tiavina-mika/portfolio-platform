import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppCurrentUserSelector } from '@/redux/reducers/app.reducer';
import { ProfileUserInfoInput } from '@/types/user.type';
import { profileUserInfoSchema } from '@/validations/auth.validation';

type Props = {
  formId: string;
  onSubmit: (values: ProfileUserInfoInput) => void;
};


const ProfileUserInfoForm = ({
  formId, onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();
  const currentUser = useSelector(getAppCurrentUserSelector);

  const form = useForm<ProfileUserInfoInput>({
    resolver: zodResolver(profileUserInfoSchema),
    defaultValues: {
      lastName: currentUser?.get('lastName'),
      firstName: currentUser?.get('firstName'),
    },
  });

  const {
    handleSubmit,
  } = form;

  const onSubmitHandler: SubmitHandler<ProfileUserInfoInput> = (values) => {
    onSubmit(values);
  };

  return (
    <Form form={form} formId={formId} onSubmit={handleSubmit(onSubmitHandler)}>
      <TextField
        required
        label={t('user:lastName')}
        name="lastName"
        type="text"
        variant="standard"
      />
      <TextField
        label={t('user:firstName')}
        name="firstName"
        type="text"
        variant="standard"
      />
    </Form>
  );
};

export default ProfileUserInfoForm;
