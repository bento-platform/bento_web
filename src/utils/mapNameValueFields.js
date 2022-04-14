export const mapNameValueFields = (data, otherThreshold) => {
    if (!data) {
        return [];
    }

    const sumOfAllValues = Object.values(data).reduce((acc, v) => acc + v, 0);

  // no point using an "other" category if only one category below threshold
    const multipleCategoriesBelowThreshold =
    Object.values(data).filter((val) => (val > 0) && (val / sumOfAllValues < otherThreshold)).length > 1;

    const results = [];
    const other = { name: "Other", value: 0, skipAutoquery: true };

    Object.entries(data).forEach(([key, val]) => {
        const categoryNotEmpty = val > 0;
        const categoryBelowThreshold = val / sumOfAllValues < otherThreshold;
        if (multipleCategoriesBelowThreshold && categoryNotEmpty && categoryBelowThreshold) {
            other.value += val;
        } else {
            if (categoryNotEmpty) {
                results.push({ name: key, value: val });
            }
        }
    });

    if (other["value"] > 0) {
        results.push(other);
    }

    return results.sort((a, b) => a.value - b.value);
};
