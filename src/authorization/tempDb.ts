import { Permission } from './permission';

export const PermissionDb: Map<string, Permission[]> = new Map([
  ['bernun', [new Permission(true)]],
]);
