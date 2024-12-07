export function stringifyWithBigInt(obj) {
  return JSON.stringify(obj, (key, value) => (typeof value === 'bigint' ? value.toString() : value));
}
