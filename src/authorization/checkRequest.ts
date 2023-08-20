export interface PermissionCheckRequest {
  permission: (string | boolean)[];
  user: string;
}

export class PermissionCheckResponse {
  permission: (string | boolean)[];
  user: string;
  hasPermission: boolean;
  signature: string;

  constructor(request: PermissionCheckRequest) {
    this.permission = request.permission;
    this.user = request.user;
    this.hasPermission = false;
    this.signature = '';
  }
}
