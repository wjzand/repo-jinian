export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${random}`;
}

export function generateAdminToken(): string {
  return Math.random().toString(36).substring(2, 18);
}
