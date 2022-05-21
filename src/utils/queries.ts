export function optionalDate(date: string | undefined) {
  return date ? new Date(date) : undefined;
}
