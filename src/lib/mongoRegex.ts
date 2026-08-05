/** Escapes user input for safe use inside a MongoDB $regex filter. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" filter, equivalent to SQL's ILIKE `%value%`. */
export function containsRegex(value: string): { $regex: string; $options: string } {
  return { $regex: escapeRegex(value), $options: "i" };
}
