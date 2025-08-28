import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';
export const Role = (role: 'client' | 'freelancer' | 'admin') =>
  SetMetadata(ROLES_KEY, role);