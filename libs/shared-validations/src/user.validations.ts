import { MINIMUM_AGE } from '@shared/constants';

export const isAtLeastMinimumAge = (birthday: Date): boolean => {
  const today = new Date();
  const minimumBirthDate = new Date(today.getFullYear() - MINIMUM_AGE, today.getMonth(), today.getDate());

  return birthday <= minimumBirthDate;
};
