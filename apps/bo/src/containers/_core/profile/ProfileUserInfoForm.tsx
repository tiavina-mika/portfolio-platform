import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import TextField from '@/components/form/fields/TextField';
import Form from '@/components/form/Form';
import { getAppCurrentUserSelector } from '@/redux/reducers/_core/app.reducer';
import { ProfileUserInfoInput } from '@/types/_core/user.type';
import { profileUserInfoSchema } from '@/validations/_core/auth.validations';

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
      lastName: currentUser?.lastName,
      firstName: currentUser?.firstName,
    },
  });

  return (
    <Form form={form} formId={formId} onSubmit={onSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          required
          label={t('user:lastName')}
          name="lastName"
          type="text"
        />
        <TextField
          label={t('user:firstName')}
          name="firstName"
          type="text"
        />
      </Box>
    </Form>
  );
};

export default ProfileUserInfoForm;
