import Parse from 'parse';

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

/**
 * initials of a displayed name, two letters at most
 * ex: Hanitra R. => HR
 * @param name first name, then the last name or its initial
 * @returns
 */
export const getNameInitials = (name: string): string => name
  .split(/\s+/)
  .map(word => word.replace(/[^\p{L}]/gu, '').charAt(0))
  .join('')
  .slice(0, 2)
  .toUpperCase();
