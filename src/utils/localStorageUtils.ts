export const writeToLocalStorage = (item: string, value: string | number | object) => {
  localStorage.setItem(item, JSON.stringify(value));
};

export const readFromLocalStorage = <T>(item: string): T | null => {
  const ls = localStorage.getItem(item);
  if (ls !== null) {
    try {
      return JSON.parse(ls);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return null;
};
