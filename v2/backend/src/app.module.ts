import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { EmployeeModule } from './employee/employee.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { StatutoryModule } from './statutory/statutory.module';
import { ReportsModule } from './reports/reports.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { PerformanceModule } from './performance/performance.module';
import { AssetsModule } from './assets/assets.module';
import { AuditModule } from './audit/audit.module';
import { AiModule } from './ai/ai.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import emailConfig from './config/email.config';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, storageConfig, emailConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'global',
          ttl: config.get('app.throttle.ttl', 60000),
          limit: config.get('app.throttle.limit', 100),
        },
      ],
    }),

    // Job Queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host', 'localhost'),
          port: config.get('redis.port', 6379),
          password: config.get('redis.password'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    // Cron Jobs
    ScheduleModule.forRoot(),

    // Core Infrastructure
    DatabaseModule,
    AuditModule,
    NotificationsModule,

    // Business Modules
    AuthModule,
    OrganizationModule,
    EmployeeModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    StatutoryModule,
    ReportsModule,
    DocumentsModule,
    HelpdeskModule,
    RecruitmentModule,
    PerformanceModule,
    AssetsModule,
  ],
})
export class AppModule {}
