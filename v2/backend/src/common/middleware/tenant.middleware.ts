import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(private prisma: PrismaService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    // org_id is available after JWT auth — set it in PG session
    const orgId = req.user?.orgId;

    if (orgId) {
      try {
        await this.prisma.$executeRaw`
          SELECT set_config('app.current_org_id', ${orgId}::text, true)
        `;
      } catch (err) {
        this.logger.warn(`Failed to set tenant context: ${err.message}`);
      }
    }

    next();
  }
}
