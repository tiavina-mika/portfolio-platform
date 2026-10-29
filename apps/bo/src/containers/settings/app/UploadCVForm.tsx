

import { IconButton, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';

import DropzoneInput from '@/components/form/dropzone/input/DropzoneInput';
import InputLabel from '@/components/form/InputLabel';
import { downloadCV, uploadCV } from '@/redux/actions/app.action';
import { getAppAppSelector } from '@/redux/reducers/app.reducer';
import { generateFileSchema } from '@/validations/zodSchema.validation';

const UploadCVForm = () => {
  const dispatch = useDispatch();
  const app = useSelector(getAppAppSelector);
  const [error, setError] = useState<string>('');

  const handleDownload = () => {
    dispatch(downloadCV());
  };

  const handleChange = (files: File[]) => {
    const schema = generateFileSchema(true, { maxSize: 5, extensions: ['pdf'] });
    const validation = schema.safeParse(files);

    if (validation.success) {
      setError('');
      dispatch(uploadCV((validation.data as File[])[0]));
      return;
    }
    const {
      issues,
    } = (validation as any).error;

    setError(issues[0].message);
  };

  return (
    <Stack spacing={2}>
      <div>
        <InputLabel label={t('app.uploadCV') + ' (pdf)'} />
        <DropzoneInput
          error={error}
          inputLabel="Curriculum Vitae"
          onChange={handleChange}
        />
      </div>

      {app?.has('cv')
        ? (
          <div className="flexRow center">
            <Typography>
              {app.get('cv')?.publicId.split('/')[1]}.pdf
            </Typography>
            <IconButton onClick={handleDownload}>
              <IoMdDownload />
            </IconButton>
          </div>
        )
        : (
          <Typography color="warning.main" variant="body2">
            {t('app.noCVYet')}
          </Typography>
        )}
    </Stack>
  );
};

export default UploadCVForm;
