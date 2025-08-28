import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction → allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}