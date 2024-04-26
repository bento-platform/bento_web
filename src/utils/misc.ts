// Functional utilities
export const id = <T>(x: T) => x; // id is a function that returns its first passed parameter
export const nop = () => {};
export const constFn = <T>(x: T) => () => x; // constFn(null) creates a function that always returns null
export const getFalse = constFn<false>(false);
export const getTrue = constFn<true>(true);

export const countNonNullElements = (arr: unknown[]) => {
    return arr.filter((item) => item !== null).length;
}; // counts the non-null elements in any array

// Object utilities
export type RecordKey = string | number | symbol;
export const simpleDeepCopy = (o: object) => JSON.parse(JSON.stringify(o));
export const objectWithoutProps = (o: object, ps: RecordKey[]) =>
    Object.fromEntries(Object.entries(o).filter(([p2]) => !ps.includes(p2)));
export const objectWithoutProp = (o: object, p: RecordKey) => objectWithoutProps(o, [p]);
export const arrayToObjectByProperty =
    <T extends Record<RecordKey, unknown>>(l: T[], p: RecordKey) =>
        Object.fromEntries(l.map((item) => [item[p], item]));

// REGEX
export const notAlleleCharactersRegex = new RegExp("[^ACGTN]", "g");
