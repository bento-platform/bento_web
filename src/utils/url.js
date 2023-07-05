export const urlPath = url => {
    try {
        return (new URL(url)).pathname;
    } catch (e) {
        // Wrap possible thrown error with something to log the actual URL value.
        console.error(`Error with URL: ${url}`);
        throw e;
    }
};
