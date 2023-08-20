// true acts as a wildcard and allows user to access all resources in that category
// hierarchy is as follows: space > area > location > item > action
// false is currently unused
export type PropType = string | boolean;
export class Permission {
  space: PropType = '';
  area: PropType = '';
  location: PropType = '';
  item: PropType = '';
  action: PropType = '';

  constructor(
    space: PropType = '',
    area: PropType = '',
    location: PropType = '',
    item: PropType = '',
    action: PropType = '',
  ) {
    this.space = space;
    this.area = area;
    this.location = location;
    this.item = item;
    this.action = action;
  }

  toArray(): (string | boolean)[] {
    return [this.space, this.area, this.location, this.item, this.action];
  }

  static fromArray = (array: (string | boolean)[]): Permission => {
    const toReturn = new Permission();
    toReturn.space = array[0];
    toReturn.area = array[1];
    toReturn.location = array[2];
    toReturn.item = array[3];
    toReturn.action = array[4];

    return toReturn;
  };
}

export const hasPermission = (
  permissions: Permission[],
  permissionToCheck: Permission,
): boolean => {
  const permissionToCheckArray = permissionToCheck.toArray();

  permissions = permissions.filter((permission) => {
    const permissionArray = permission.toArray();

    for (let i = 0; i < permissionArray.length; i++) {
      if (
        permissionArray[i] !== permissionToCheckArray[i] &&
        permissionArray[i] !== true
      ) {
        return false;
      }

      if (permissionArray[i] === true && permissionToCheckArray[i] !== true) {
        return true;
      }
    }

    return true;
  });

  return permissions.length > 0;
};

export const test = (): void => {
  const permWeChecking1 = Permission.fromArray([
    'space',
    'area',
    'location',
    true,
    '',
  ]);
  const permWeChecking2 = Permission.fromArray([
    'space',
    'area',
    'location',
    'item',
    'action',
  ]);
  const permWeChecking3 = Permission.fromArray([
    'space',
    'area',
    'location',
    'item',
    'nope',
  ]);

  const perms1 = [permWeChecking1, permWeChecking2, permWeChecking3];
  console.log(
    hasPermission(perms1, permWeChecking1),
    hasPermission(perms1, permWeChecking2),
    hasPermission(perms1, permWeChecking3),
  );
  const perms2 = [permWeChecking2, permWeChecking3];
  console.log(
    hasPermission(perms2, permWeChecking1),
    hasPermission(perms2, permWeChecking2),
    hasPermission(perms2, permWeChecking3),
  );
  const perms3 = [permWeChecking3];
  console.log(
    hasPermission(perms3, permWeChecking1),
    hasPermission(perms3, permWeChecking2),
    hasPermission(perms3, permWeChecking3),
  );

  // expected output:
  // true true true
  // false true true
  // false false true
};
