import { DEFAULT_OTHER_THRESHOLD_PERCENTAGE } from "../constants";

export const mapNameValueFields = (data, otherThreshold = DEFAULT_OTHER_THRESHOLD_PERCENTAGE) => {
    if (!data)
        return [];

    // Accumulate all values to compute on them later
    const sumOfAllValues = Object.values(data).reduce((acc, v) => acc + v, 0);
    const numCategoriesBelowThreshold = Object.values(data).filter(
        (val) => val / sumOfAllValues < otherThreshold
    ).length;

    // Group the items in the array of objects denoted by
    // a "name" and "value" parameter
    const results = [];
    Object.entries(data).forEach(([key, val]) => {
        // Group all elements with a small enough value together under an "Other", as long as there's more than one
        if (numCategoriesBelowThreshold > 1 && val > 0 && (val / sumOfAllValues) < otherThreshold) {
            const otherIndex = results.findIndex(ob => ob.name === "Other");
            if (otherIndex > -1) {
                results[otherIndex].value += val; // Accumulate
            } else {
                results.push({name: "Other", value: val, skipAutoquery: true}); // Create a new  element in the array
            }
        } else { // Treat items
            results.push({name: key, value: val});
        }
    });

    // Sort by value
    return results.sort((a, b) => a.value - b.value);
};
