import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/auth.decorators';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.orgId) {
      return false;
    }

    // Super Admin has all access
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Fetch permissions for user's role
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        orgId: user.orgId,
        role: user.role,
        permission: { in: requiredPermissions },
        granted: true,
      },
    });

    // Check if the user's role has ALL required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      rolePermissions.some((rp) => rp.permission === perm),
    );

    return hasAllPermissions;
  }
}
