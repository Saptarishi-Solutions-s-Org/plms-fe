export function canAccess(user: any, module: string, permission: string) {
  return user?.permissions?.[module]?.includes(permission);
}
