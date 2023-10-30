export function toUrlEncodedString(obj: any) {
  return Object.keys(obj)
      .map(key => `${key}=${encodeURIComponent(obj[key])}`)
      .join('&');
}