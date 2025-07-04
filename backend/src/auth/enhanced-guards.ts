import { SetMetadata } from '@nestjs/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

/**
 * Custom decorator for role-based access control
 * Usage: @Roles(Role.ADMIN, Role.SUPERVISOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

/**
 * Permission-based decorator for granular access control
 * Usage: @RequirePermission('CREATE_SHIFT', 'APPROVE_LEAVE')
 */
export const RequirePermission = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);

/**
 * Enhanced Role Guard with permission checking
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles or permissions specified, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check role-based access
    if (requiredRoles) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        return false;
      }
    }

    // Check permission-based access
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.some(permission => 
        this.userHasPermission(user.role, permission)
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user role has specific permission
   */
  private userHasPermission(userRole: Role, permission: string): boolean {
    const rolePermissions: Record<Role, string[]> = {
      [Role.ADMIN]: [
        'CREATE_SHIFT', 'EDIT_SHIFT', 'DELETE_SHIFT', 'VIEW_ALL_SHIFTS',
        'APPROVE_LEAVE', 'MANAGE_USERS', 'VIEW_REPORTS', 'MANAGE_SYSTEM'
      ],
      [Role.SUPERVISOR]: [
        'CREATE_SHIFT', 'EDIT_SHIFT', 'VIEW_ALL_SHIFTS',
        'APPROVE_LEAVE', 'APPROVE_SHIFT_SWAP', 'VIEW_REPORTS'
      ],
      [Role.DOKTER]: [
        'VIEW_OWN_SHIFTS', 'REQUEST_LEAVE', 'REQUEST_SHIFT_SWAP',
        'VIEW_SCHEDULE', 'MANAGE_PATIENTS'
      ],
      [Role.PERAWAT]: [
        'VIEW_OWN_SHIFTS', 'REQUEST_LEAVE', 'REQUEST_SHIFT_SWAP',
        'VIEW_SCHEDULE', 'RECORD_ATTENDANCE'
      ],
      [Role.STAF]: [
        'VIEW_OWN_SHIFTS', 'REQUEST_LEAVE', 'VIEW_SCHEDULE', 'RECORD_ATTENDANCE'
      ],
    };

    return rolePermissions[userRole]?.includes(permission) || false;
  }
}

/**
 * Resource ownership guard - ensures user can only access their own resources
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceUserId = request.params.userId || request.body.userId;

    // Admin and Supervisor can access all resources
    if (user.role === Role.ADMIN || user.role === Role.SUPERVISOR) {
      return true;
    }

    // Regular users can only access their own resources
    return user.id === parseInt(resourceUserId);
  }
}
