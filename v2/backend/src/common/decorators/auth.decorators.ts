import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// ─── Get current user from JWT ───────────────────────────────
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

// ─── Get current org ID from JWT ─────────────────────────────
export const CurrentOrg = createParamDecorator(
  (_: undefined, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user?.orgId;
  },
);

// ─── Skip auth for public routes ─────────────────────────────
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ─── Role-based access control ───────────────────────────────
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// ─── Permission-based access control ─────────────────────────
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// ─── Skip RLS for super admin operations ─────────────────────
export const SKIP_TENANT_KEY = 'skipTenant';
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
