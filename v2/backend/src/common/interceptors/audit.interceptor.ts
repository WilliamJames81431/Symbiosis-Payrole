import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  // Routes that should NOT be audited (read-only, too frequent)
  private readonly skipRoutes = [
    'GET /api/v1/notifications',
    'GET /api/v1/dashboard',
    'GET /api/v1/employees',
  ];

  // Routes that MUST be audited
  private readonly auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Only audit write operations
    if (!this.auditMethods.includes(method)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Non-blocking audit log write
          this.writeAuditLog({
            orgId: user?.orgId,
            actorId: user?.sub,
            actorRole: user?.role,
            actorIp: ip,
            actorUa: headers['user-agent'],
            sessionId: user?.sessionId,
            action: method,
            resourceType: this.extractResourceType(url),
            resourceId: this.extractResourceId(url),
            dataAfter: this.sanitizeData(data?.data),
            requestId: headers['x-request-id'],
            endpoint: url,
          }).catch((err) => {
            this.logger.warn(`Failed to write audit log: ${err.message}`);
          });
        },
        error: () => {
          // Don't audit failed operations
        },
      }),
    );
  }

  private async writeAuditLog(data: {
    orgId?: string;
    actorId?: string;
    actorRole?: string;
    actorIp?: string;
    actorUa?: string;
    sessionId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    dataBefore?: any;
    dataAfter?: any;
    requestId?: string;
    endpoint: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({ data });
  }

  private extractResourceType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    // api/v1/employees/123 → employees
    // api/v1/payroll/runs/123 → payroll_runs
    const versionIndex = parts.findIndex((p) => p.startsWith('v'));
    if (versionIndex >= 0 && parts[versionIndex + 1]) {
      return parts[versionIndex + 1].replace(/-/g, '_');
    }
    return 'unknown';
  }

  private extractResourceId(url: string): string | undefined {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : undefined;
  }

  private sanitizeData(data: any): any {
    if (!data) return undefined;
    const sensitiveFields = ['password', 'passwordHash', 'panEncrypted', 'aadhaarEncrypted', 'accountNumberEncrypted', 'totpSecret'];
    if (typeof data === 'object') {
      const sanitized = { ...data };
      sensitiveFields.forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      return sanitized;
    }
    return data;
  }
}
