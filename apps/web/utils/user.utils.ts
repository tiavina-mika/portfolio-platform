export const getUserFullName = (user: Parse.User): string => {
  if (!user.get('firstName')) return user.get('firstName');

  return `${user.get('firstName')} ${user.get('lastName')}`;
};

/**
 * get full name abbreviation
 * ex: John Doe => JD
 * @param user
 * @returns
 */
export const getUserFullNameAbbreviation = (user: Parse.User): string => {
  const lastName = user.get('lastName');
  const firstName = user.get('firstName');

  if (!lastName && !firstName) {
    return 'US';
  }
  let abbreviatedName = lastName.charAt(0);

  if (firstName) {
    abbreviatedName += firstName.charAt(0);
  }
  return abbreviatedName.toUpperCase();
};
