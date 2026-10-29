export const cutText = (text: string, limit = 100): string => {
  if (text.length > limit) {
    return `${text.substring(0, limit)}...`;
  }

  return text;
};
