// Functional utilities
export const id = x => x;  // id is a function that returns its first passed parameter
export const nop = () => {};
export const constFn = x => () => x;  // constFn(null) creates a function that always returns null
export const getFalse = constFn(false);
export const getTrue = constFn(true);

export const countNonNullElements = (arr) => {
    return arr.filter((item) => item !== null).length;
}; // counts the non-null elements in any array

// Object utilities
export const simpleDeepCopy = o => JSON.parse(JSON.stringify(o));
export const objectWithoutProps = (o, ps) => Object.fromEntries(Object.entries(o).filter(([p2]) => !ps.includes(p2)));
export const objectWithoutProp = (o, p) => objectWithoutProps(o, [p]);
export const arrayToObjectByProperty = (l, p) => Object.fromEntries(l.map(l => [l[p], l]));
export const recursiveOrderedObject = x => {
    if (Array.isArray(x)) {
        // Don't sort array, but DO make sure each nested object has sorted keys
        return x.map(y => recursiveOrderedObject(y));
    } else if (typeof x === "object" && x !== null) {
        return Object.keys(x).sort().reduce((acc, y) => {
            acc[y] = x[y];
            return acc;
        }, {});
    } else {
        return x;  // Primitive
    }
};

// REGEX
export const notAlleleCharactersRegex = new RegExp("[^ACGTN]", "g");
