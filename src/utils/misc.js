// Functional utilities
export const id = x => x;  // id is a function that returns its first passed parameter
export const nop = () => {};
export const constFn = x => () => x;  // constFn(null) creates a function that always returns null

// Object utilities
export const simpleDeepCopy = o => JSON.parse(JSON.stringify(o));
export const objectWithoutProps = (o, ps) => Object.fromEntries(Object.entries(o).filter(([p2]) => !ps.includes(p2)));
export const objectWithoutProp = (o, p) => objectWithoutProps(o, [p]);
export const arrayToObjectByProperty = (l, p) => Object.fromEntries(l.map(l => [l[p], l]));
