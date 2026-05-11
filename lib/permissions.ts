export const canAccess = (
  user: any,
  modules?: string[],
  permissions?: string[],
  item?: any
): boolean => {
  if (!user) return false;

  const userRole = user.role;
  const userPermissions = user.permissions || {};

  if (item?.roles?.length) {
    if (!item.roles.includes(userRole)) {
      return false;
    }
  }

  if (modules && permissions) {
    const hasAccess = modules.some((mod: string) => {
      const perms = userPermissions[mod] || [];
      return permissions.some((perm: string) =>
        perms.includes(perm)
      );
    });

    if (!hasAccess) return false;
  }

  return true;
};