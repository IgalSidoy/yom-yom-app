/**
 * Creates a hash of an object by sorting its keys and stringifying it
 * This ensures consistent hashing regardless of property order
 */
export const hashObject = (obj: Record<string, any>): string => {
  const sortedObj = Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key: string) => {
      result[key] = obj[key];
      return result;
    }, {});

  return JSON.stringify(sortedObj);
};

/**
 * Compares two objects by hashing them
 * Returns true if the objects are different
 */
export const areObjectsDifferent = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): boolean => {
  return hashObject(obj1) !== hashObject(obj2);
};
