export const writeToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};

export const readFromLocalStorage = (item) => {
    let value;
    try {
        value = JSON.parse(localStorage.getItem(item));
    } catch (e) {
        console.error(e);
        return null;
    }
    return value;
};

export const popLocalStorageItem = key => {
    const val = localStorage.getItem(key);
    localStorage.removeItem(key);
    return val;
};
