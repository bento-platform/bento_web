export const mapNameValueFields = (data) =>
    Object.entries(data ?? {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.value - b.value);

export const getPieChart = ({ title, data, fieldLabel, thresholdFraction }) => ({
    title,
    data: mapNameValueFields(data),
    fieldLabel,
    type: "PIE",
    clickableOther: "Other" in (data ?? {}),
    thresholdFraction,
});
