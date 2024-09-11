export const isValidUrl = (url: string): boolean => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};
