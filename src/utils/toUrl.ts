export function toUrlEncodedString(obj) {
  return Object.keys(obj)
      .map(key => `${key}=${encodeURIComponent(obj[key])}`)
      .join('&');
}