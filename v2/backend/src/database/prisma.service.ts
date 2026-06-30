import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private config: ConfigService) {
    super({
      datasources: { db: { url: config.get<string>('database.url') } },
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        ...(config.get('app.env') === 'development'
          ? [{ level: 'query' as const, emit: 'event' as const }]
          : []),
      ],
    });

    // Log slow queries
    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      if (e.duration > 500) {
        this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });

    (this as any).$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(e.message);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Set the tenant context for Row Level Security.
   * MUST be called before any query within a request context.
   */
  async setTenantContext(orgId: string): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`;
  }

  /**
   * Clear tenant context (for super admin operations)
   */
  async clearTenantContext(): Promise<void> {
    await this.$executeRaw`SELECT set_config('app.current_org_id', '', true)`;
  }

  /**
   * Execute within a transaction with tenant context set.
   */
  async withTenant<T>(
    orgId: string,
    fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_org_id', ${orgId}, true)`;
      return fn(tx);
    });
  }

  /**
   * Soft delete helper — sets is_deleted = true and deleted_at = now()
   */
  async softDelete(model: string, id: string, deletedBy?: string): Promise<void> {
    await this.$executeRaw`
      UPDATE ${Prisma.raw(model)}
      SET is_deleted = true, deleted_at = NOW(), updated_by = ${deletedBy || null}
      WHERE id = ${id}::uuid
    `;
  }
}
