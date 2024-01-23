export const mapNameValueFields = (data) =>
    Object.entries(data ?? {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.value - b.value);
