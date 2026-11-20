import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import type { Theme } from '@mui/material';

import { ProfileCameraIcon } from '@/components/icons/ProfileIcons';
import { PROFILE_PHOTO_BUTTON_SIZE } from '@/constants/_core/ui/entity.constants';
import { uploadCurrentUserProfileImage } from '@/redux/actions/_core/user.action';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

const classes = {
  /*
   * the button sits on the edge of the picture it replaces, so it carries the card's own surface and
   * a shadow of its own — without them it reads as part of the avatar rather than as an action on it
   */
  button: (theme: Theme) => {
    const tokens = getDesignTokens(theme);

    return {
      width: PROFILE_PHOTO_BUTTON_SIZE,
      height: PROFILE_PHOTO_BUTTON_SIZE,
      color: tokens.text,
      backgroundColor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      boxShadow: tokens.shadowPopover,
      '&:hover': {
        backgroundColor: tokens.surface,
        color: theme.palette.primary.main,
      },
    };
  },
  input: { display: 'none' },
};

const ProfilePicUploadButton = () => {
  const {
    t,
  } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUploadClick = () => {
    if (!inputRef.current) return;
    inputRef.current.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);
    try {
      await dispatch(uploadCurrentUserProfileImage(file));
    }
    finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        accept="image/*"
        css={classes.input}
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
      <IconButton
        aria-label={t('user:profilePicture')}
        css={classes.button}
        disabled={isUploading}
        onClick={handleUploadClick}
        title={t('user:profilePicture')}
      >
        {isUploading ? <CircularProgress aria-label={t('loading')} size={16} /> : <ProfileCameraIcon />}
      </IconButton>
    </>
  );
};

export default ProfilePicUploadButton;
