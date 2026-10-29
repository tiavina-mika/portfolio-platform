export const formatStatusToCamelCase = (status: string): string => {
  const fieldArr = status.toLocaleLowerCase().split('_');
  const field = fieldArr.length > 1 && fieldArr[1]
    ? fieldArr[0] + (fieldArr[1][0]?.toUpperCase() ?? '') + (fieldArr[1]?.slice(1) ?? '')
    : status.toLocaleLowerCase();

  return field;
};
